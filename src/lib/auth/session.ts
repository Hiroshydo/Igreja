import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/auth/permissions";
import { hasServerEnv } from "@/lib/env";
import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import type {
  AccessContext,
  AccessibleCongregation,
  AuthenticatedAppUser,
  PermissionKey,
  PermissionResource,
  PermissionAction,
} from "@/types";

const congregationScopedResources = new Set<PermissionResource>([
  "dashboard",
  "members",
  "pastors",
  "departments",
  "ministries",
  "events",
  "schedules",
  "finance",
  "prayer_requests",
  "announcements",
  "media",
  "music",
  "education",
  "library",
  "doctrine",
  "pastoral_care",
  "worship",
  "discipleship",
]);

type AccessRouteResult =
  | { response: NextResponse; context: null }
  | { response: null; context: AccessContext };

function normalizePermission(resource: string, action: string): PermissionKey {
  return `${resource}.${action}` as PermissionKey;
}

function isSchemaCacheMissingTable(error: { code?: string; message?: string } | null | undefined) {
  if (!error) {
    return false;
  }

  return error.code === "PGRST205" || Boolean(error.message?.includes("Could not find the table"));
}

async function loadRoleAccess(profileId: string, congregationId: string | null) {
  if (!hasServerEnv()) {
    return {
      roles: [] as string[],
      permissions: [] as string[],
    };
  }

  const admin = createAdminSupabaseClient();
  let roleQuery = admin
    .from("profile_roles")
    .select("role_id, congregation_id, role:roles(code, name)")
    .eq("profile_id", profileId);

  roleQuery = congregationId
    ? roleQuery.or(`congregation_id.eq.${congregationId},congregation_id.is.null`)
    : roleQuery.is("congregation_id", null);

  const { data: roleRows, error: roleError } = await roleQuery;

  if (roleError) {
    if (isSchemaCacheMissingTable(roleError)) {
      return {
        roles: [] as string[],
        permissions: [] as string[],
      };
    }

    throw new AppError("Não foi possível carregar os papéis do usuário", 500, "roles_fetch_failed");
  }

  const typedRoles = (roleRows ?? []) as Array<{
    role_id: string;
    congregation_id: string | null;
    role: Database["public"]["Tables"]["roles"]["Row"] | null;
  }>;

  const roleIds = typedRoles.map((item) => item.role_id);
  if (roleIds.length === 0) {
    return {
      roles: [] as string[],
      permissions: [] as string[],
    };
  }

  const { data: permissionRows, error: permissionError } = await admin
    .from("role_permissions")
    .select("role_id, permission:permissions(resource, action)")
    .in("role_id", roleIds);

  if (permissionError) {
    if (isSchemaCacheMissingTable(permissionError)) {
      return {
        roles: typedRoles.flatMap((item) => (item.role?.code ? [item.role.code] : [])),
        permissions: [] as string[],
      };
    }

    throw new AppError("Não foi possível carregar as permissões do usuário", 500, "permissions_fetch_failed");
  }

  const permissions = ((permissionRows ?? []) as Array<{
    permission: { resource: string; action: string } | null;
  }>)
    .flatMap((item) => (item.permission ? [normalizePermission(item.permission.resource, item.permission.action)] : []));

  return {
    roles: typedRoles.flatMap((item) => (item.role?.code ? [item.role.code] : [])),
    permissions: Array.from(new Set(permissions)),
  };
}

async function listProfileCongregations(profileId: string): Promise<AccessibleCongregation[]> {
  if (!hasServerEnv()) {
    return [];
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("profile_congregations")
    .select("congregation_id, is_active, is_default, congregation:congregations(id, name, is_active)")
    .eq("profile_id", profileId)
    .order("is_default", { ascending: false });

  if (error) {
    if (isSchemaCacheMissingTable(error)) {
      return [];
    }

    throw new AppError("Não foi possível carregar as congregações vinculadas", 500, "profile_congregations_fetch_failed");
  }

  return ((data ?? []) as Array<{
    congregation_id: string;
    is_active: boolean;
    is_default: boolean;
    congregation: { id: string; name: string; is_active: boolean } | null;
  }>)
    .filter((row) => row.congregation?.id && row.congregation?.name)
    .map((row) => ({
      id: row.congregation_id,
      name: row.congregation?.name ?? "Congregação",
      isActive: row.is_active && Boolean(row.congregation?.is_active),
      isDefault: row.is_default,
    }));
}

export async function listAuthenticatedCongregations(profileId: string) {
  return listProfileCongregations(profileId);
}

function normalizeActiveCongregation(
  requestedCongregationId: string | null,
  availableCongregations: AccessibleCongregation[],
) {
  if (!requestedCongregationId) {
    return null;
  }

  const matchedCongregation = availableCongregations.find((item) => item.id === requestedCongregationId && item.isActive);
  return matchedCongregation?.id ?? null;
}

export async function setAuthenticatedActiveCongregation(profileId: string, congregationId: string) {
  const allowedCongregations = await listProfileCongregations(profileId);
  const targetCongregation = allowedCongregations.find((item) => item.id === congregationId && item.isActive);

  if (!targetCongregation) {
    throw new AppError("Congregação não vinculada ao usuário autenticado", 403, "congregation_access_denied");
  }

  const roleAccess = await loadRoleAccess(profileId, congregationId);
  if (roleAccess.roles.length === 0) {
    throw new AppError("Usuário sem papéis ativos para a congregação selecionada", 403, "congregation_role_missing");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ active_congregation_id: congregationId })
    .eq("id", profileId);

  if (error) {
    throw new AppError("Não foi possível atualizar a congregação ativa", 500, "active_congregation_update_failed");
  }

  return {
    congregation: targetCongregation,
    roleCodes: roleAccess.roles,
    permissions: roleAccess.permissions,
  };
}

export async function getAuthContext(): Promise<AccessContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AppError("Não foi possível validar a sessão atual", 401, "session_validation_failed");
  }

  if (!user) {
    return null;
  }

  let congregationId: string | null = null;
  let fullName = (user.user_metadata.full_name as string | undefined) ?? user.email ?? "Usuário";
  const profileId = user.id;
  let availableCongregations: AccessibleCongregation[] = [];

  if (hasServerEnv()) {
    const admin = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, active_congregation_id, full_name, email, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      if (isSchemaCacheMissingTable(profileError)) {
        // Fallback para ambientes com Auth pronto, mas sem schema de aplicacao provisionado.
      } else {
      throw new AppError("Não foi possível carregar o perfil do usuário", 500, "profile_fetch_failed");
      }
    }

    const typedProfile = profile as Database["public"]["Tables"]["profiles"]["Row"] | null;

    if (typedProfile) {
      fullName = typedProfile.full_name ?? fullName;
      availableCongregations = await listProfileCongregations(typedProfile.id);
      congregationId = normalizeActiveCongregation(typedProfile.active_congregation_id ?? null, availableCongregations);

      if (typedProfile.is_active === false) {
        throw new AppError("Conta bloqueada", 403, "account_blocked");
      }
    }
  }

  const access = await loadRoleAccess(user.id, congregationId);

  if (congregationId && access.roles.length === 0) {
    congregationId = null;
  }

  return {
    userId: user.id,
    profileId,
    email: user.email ?? null,
    fullName,
    congregationId,
    roleCodes:
      access.roles.length > 0
        ? access.roles
        : typeof user.user_metadata.role_code === "string"
          ? [user.user_metadata.role_code.toUpperCase()]
          : [],
    permissions: access.permissions,
  };
}

export function toAuthenticatedAppUser(context: AccessContext): AuthenticatedAppUser {
  return {
    id: context.userId,
    profileId: context.profileId,
    email: context.email,
    fullName: context.fullName,
    congregationId: context.congregationId,
    roleCodes: context.roleCodes,
    permissions: context.permissions,
  };
}

export async function requireAuthenticatedRoute(request: NextRequest): Promise<AccessRouteResult> {
  const context = await getAuthContext();

  if (!context) {
    return {
      response: NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 }),
      context: null,
    };
  }

  return { response: null, context };
}

export async function requireRouteAccess(options: {
  request: NextRequest;
  resource: PermissionResource;
  action: PermissionAction;
}): Promise<AccessRouteResult> {
  const authenticated = await requireAuthenticatedRoute(options.request);
  if (authenticated.response) {
    return authenticated;
  }

  const { context } = authenticated;
  if (!context) {
    return {
      response: NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 }),
      context: null,
    };
  }

  if (congregationScopedResources.has(options.resource) && !context.congregationId) {
    return {
      response: NextResponse.json(
        { success: false, error: "Selecione uma congregação ativa antes de continuar", code: "active_congregation_required" },
        { status: 403 },
      ),
      context: null,
    };
  }

  const permission = `${options.resource}.${options.action}` as PermissionKey;
  if (!hasPermission(context.permissions, context.roleCodes, permission)) {
    return {
      response: NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 }),
      context: null,
    };
  }

  return { response: null, context };
}

export function getRequestAuditMetadata(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  return { ipAddress, userAgent };
}
