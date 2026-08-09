import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasPermission, isDeveloper, canGrantDeveloperRole, canRemoveDeveloperRole } from "@/lib/auth/permissions";
import type { AccessContext } from "@/types";

export const profileService = {
  async assignRole(profileId: string, roleCode: string, context: AccessContext) {
    if (!context.congregationId) {
      return;
    }

    if (!context.roleCodes.includes("DEV") && roleCode === "DEV") {
      throw new AppError("Usuário comum não pode conceder perfil DEV", 403, "dev_role_assignment_denied");
    }

    const admin = createAdminSupabaseClient();
    const { data: roleRow, error: roleError } = await admin
      .from("roles")
      .select("id")
      .eq("code", roleCode)
      .maybeSingle();

    if (roleError || !roleRow) {
      throw new AppError("Perfil não encontrado", 404, "role_not_found");
    }

    const { error } = await admin
      .from("profile_roles")
      .upsert({
        profile_id: profileId,
        role_id: roleRow.id,
        congregation_id: context.congregationId,
      }, { onConflict: "profile_id,role_id,congregation_id" });

    if (error) {
      throw new AppError("Não foi possível vincular o perfil", 500, "profile_role_assignment_failed");
    }
  },

  async removeRole(profileId: string, roleCode: string, context: AccessContext) {
    if (!context.congregationId) {
      return;
    }

    const roleCodes = context.roleCodes;
    const devUserTarget = roleCode === "DEV" && profileId === context.userId;
    const actorIsDev = isDeveloper(roleCodes);

    if (devUserTarget && actorIsDev) {
      throw new AppError("DEV não pode remover o próprio perfil DEV", 403, "self_dev_role_remove_denied");
    }

    if (roleCode === "DEV" && !actorIsDev) {
      throw new AppError("Usuário sem permissão para alterar perfil DEV", 403, "dev_access_denied");
    }

    const admin = createAdminSupabaseClient();
    const { data: roleRow, error: roleFetchError } = await admin
      .from("roles")
      .select("id")
      .eq("code", roleCode)
      .maybeSingle();

    if (roleFetchError || !roleRow) {
      throw new AppError("Perfil não encontrado", 404, "role_not_found");
    }

    const { error } = await admin
      .from("profile_roles")
      .delete()
      .eq("profile_id", profileId)
      .eq("role_id", roleRow.id)
      .eq("congregation_id", context.congregationId);

    if (error) {
      throw new AppError("Não foi possível remover o perfil", 500, "profile_role_removal_failed");
    }
  },

  validateProfileMutations(input: { actorRoleCodes: string[]; requestedRoleCodes: string[]; actorUserId: string; targetProfileId: string }) {
    if (input.requestedRoleCodes.includes("DEV") && !isDeveloper(input.actorRoleCodes)) {
      throw new AppError("Usuário comum não pode conceder perfil DEV", 403, "dev_role_assignment_denied");
    }

    if (input.requestedRoleCodes.includes("DEV") && input.targetProfileId === input.actorUserId) {
      throw new AppError("DEV não pode remover o próprio perfil DEV", 403, "self_dev_role_remove_denied");
    }

    if (input.actorRoleCodes.includes("DEV") && canRemoveDeveloperRole(input.actorRoleCodes, input.actorRoleCodes)) {
      return true;
    }

    return true;
  },
};
