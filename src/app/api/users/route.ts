import { NextRequest } from "next/server";
import { z } from "zod";

import { requireRouteAccess } from "@/lib/auth/session";
import { AppError, jsonError, jsonSuccess } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { profileService } from "@/services/profile.service";
import { writeAuditLog } from "@/services/audit.service";

const createUserSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6),
  fullName: z.string().trim().min(2).optional().or(z.literal("")),
  roleCode: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "system", action: "manage" });
    if (access.response) {
      return access.response;
    }

    const body = createUserSchema.parse(await request.json());
    const admin = createAdminSupabaseClient();

    const normalizedUsername = body.username
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/(^\.)|(\.$)/g, "");
    const email = `${normalizedUsername || "usuario"}.${Date.now()}@church.local`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName || body.username,
      },
    });

    if (authError || !authUser?.user) {
      throw new AppError("Não foi possível criar o usuário de acesso", 500, "user_creation_failed");
    }

    const { error: profileError } = await admin
      .from("profiles")
      .upsert(
        {
          id: authUser.user.id,
          congregation_id: access.context.congregationId,
          active_congregation_id: access.context.congregationId,
          full_name: body.fullName || body.username,
          email,
          is_active: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      throw new AppError("Não foi possível criar o perfil do usuário", 500, "profile_creation_failed");
    }

    if (access.context.congregationId) {
      const { error: congregationLinkError } = await admin
        .from("profile_congregations")
        .upsert(
          {
            profile_id: authUser.user.id,
            congregation_id: access.context.congregationId,
            is_active: true,
            is_default: true,
          },
          { onConflict: "profile_id,congregation_id" },
        );

      if (congregationLinkError) {
        throw new AppError("Não foi possível vincular o usuário à congregação", 500, "profile_congregation_creation_failed");
      }
    }

    await profileService.assignRole(authUser.user.id, body.roleCode, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "create",
      entityName: "profiles",
      entityId: authUser.user.id,
      afterData: {
        roleCode: body.roleCode,
        email,
      },
    });

    return jsonSuccess({ userId: authUser.user.id, email, roleCode: body.roleCode }, { message: "Usuário criado com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar usuário");
  }
}
