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
  AuthenticatedAppUser,
  PermissionKey,
  PermissionResource,
  PermissionAction,
} from "@/types";

function normalizePermission(resource: string, action: string): PermissionKey {
  return `${resource}.${action}` as PermissionKey;
}

async function loadRoleAccess(profileId: string) {
  if (!hasServerEnv()) {
    return {
      roles: [] as string[],
      permissions: ["dashboard.read"] as string[],
    };
  }

  const admin = createAdminSupabaseClient();
  const { data: roleRows, error: roleError } = await admin
    .from("profile_roles")
    .select("role_id, role:roles(code, name)")
    .eq("profile_id", profileId);

  if (roleError) {
    throw new AppError("Não foi possível carregar os papéis do usuário", 500, "roles_fetch_failed");
  }

  const typedRoles = (roleRows ?? []) as Array<{
    role_id: string;
    role: Database["public"]["Tables"]["roles"]["Row"] | null;
  }>;

  const roleIds = typedRoles.map((item) => item.role_id);
  if (roleIds.length === 0) {
    return {
      roles: [] as string[],
      permissions: ["dashboard.read"] as string[],
    };
  }

  const { data: permissionRows, error: permissionError } = await admin
    .from("role_permissions")
    .select("role_id, permission:permissions(resource, action)")
    .in("role_id", roleIds);

  if (permissionError) {
    throw new AppError("Não foi possível carregar as permissões do usuário", 500, "permissions_fetch_failed");
  }

  const permissions = ((permissionRows ?? []) as Array<{
    permission: { resource: string; action: string } | null;
  }>)
    .flatMap((item) => (item.permission ? [normalizePermission(item.permission.resource, item.permission.action)] : []));

  return {
    roles: typedRoles.flatMap((item) => (item.role?.code ? [item.role.code] : [])),
    permissions: permissions.length > 0 ? Array.from(new Set(permissions)) : ["dashboard.read"],
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

  if (hasServerEnv()) {
    const admin = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, congregation_id, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new AppError("Não foi possível carregar o perfil do usuário", 500, "profile_fetch_failed");
    }

    const typedProfile = profile as Database["public"]["Tables"]["profiles"]["Row"] | null;

    if (typedProfile) {
      fullName = typedProfile.full_name ?? fullName;
      congregationId = typedProfile.congregation_id ?? null;
    }
  }

  const access = await loadRoleAccess(user.id);

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName,
    congregationId,
    roleCodes: access.roles,
    permissions: access.permissions,
  };
}

export function toAuthenticatedAppUser(context: AccessContext): AuthenticatedAppUser {
  return {
    id: context.userId,
    email: context.email,
    fullName: context.fullName,
    congregationId: context.congregationId,
    roleCodes: context.roleCodes,
    permissions: context.permissions,
  };
}

export async function requireRouteAccess(options: {
  request: NextRequest;
  resource: PermissionResource;
  action: PermissionAction;
}) {
  const context = await getAuthContext();

  if (!context) {
    return {
      response: NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 }),
    };
  }

  const permission = `${options.resource}.${options.action}` as PermissionKey;
  if (!hasPermission(context.permissions, context.roleCodes, permission)) {
    return {
      response: NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 }),
    };
  }

  return { context };
}

export function getRequestAuditMetadata(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  return { ipAddress, userAgent };
}
