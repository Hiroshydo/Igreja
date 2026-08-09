import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccessContext } from "@/types";

export interface PermissionMatrixRow {
  roleCode: string;
  roleName: string;
  permissions: string[];
}

export interface PermissionMatrixPayload {
  roleCode: string;
  permissions: string[];
}

export async function listPermissionMatrix() {
  const admin = createAdminSupabaseClient();

  const { data: roles, error: rolesError } = await admin
    .from("roles")
    .select("id, code, name")
    .order("name");

  if (rolesError) {
    throw new AppError("Não foi possível listar os perfis", 500, "roles_fetch_failed");
  }

  const { data: permissions, error: permissionsError } = await admin
    .from("permissions")
    .select("id, resource, action")
    .order("resource");

  if (permissionsError) {
    throw new AppError("Não foi possível listar as permissões", 500, "permissions_fetch_failed");
  }

  const { data: rolePermissions, error: rolePermissionsError } = await admin
    .from("role_permissions")
    .select("role_id, permission_id");

  if (rolePermissionsError) {
    throw new AppError("Não foi possível listar a matriz de acesso", 500, "matrix_fetch_failed");
  }

  const roleRows = (roles ?? []) as Array<{ id: string; code: string; name: string }>;
  const permissionRows = (permissions ?? []) as Array<{ id: string; resource: string; action: string }>;
  const relationRows = (rolePermissions ?? []) as Array<{ role_id: string; permission_id: string }>;

  const permissionById = new Map(permissionRows.map((item) => [item.id, `${item.resource}.${item.action}`]));

  const matrix = roleRows.map((role) => {
    const permissionSet = new Set<string>();

    relationRows
      .filter((relation) => relation.role_id === role.id)
      .forEach((relation) => {
        const permissionKey = permissionById.get(relation.permission_id);
        if (permissionKey) {
          permissionSet.add(permissionKey);
        }
      });

    return {
      roleCode: role.code,
      roleName: role.name,
      permissions: Array.from(permissionSet),
    };
  });

  return {
    roles: roleRows.map((role) => role.code),
    permissions: permissionRows.map((permission) => `${permission.resource}.${permission.action}`),
    matrix,
  };
}

export async function savePermissionMatrix(input: { matrix: PermissionMatrixPayload[] }, context: AccessContext) {
  if (!context.congregationId) {
    return { ok: true };
  }

  const admin = createAdminSupabaseClient();

  const { data: roles, error: rolesError } = await admin
    .from("roles")
    .select("id, code")
    .order("code");

  if (rolesError) {
    throw new AppError("Não foi possível localizar perfis para atualização", 500, "roles_fetch_failed");
  }

  const { data: permissions, error: permissionsError } = await admin
    .from("permissions")
    .select("id, resource, action");

  if (permissionsError) {
    throw new AppError("Não foi possível localizar permissões para atualização", 500, "permissions_fetch_failed");
  }

  const permissionMap = new Map<string, string>();
  for (const item of permissions ?? []) {
    permissionMap.set(`${(item as { resource: string; action: string }).resource}.${(item as { resource: string; action: string }).action}`, (item as { id: string }).id);
  }

  const roleMap = new Map<string, string>();
  for (const item of roles ?? []) {
    roleMap.set((item as { code: string }).code, (item as { id: string }).id);
  }

  for (const entry of input.matrix) {
    const roleId = roleMap.get(entry.roleCode);
    if (!roleId) {
      throw new AppError(`Perfil não encontrado: ${entry.roleCode}`, 404, "role_not_found");
    }

    const desiredPermissionIds = (entry.permissions ?? []).map((key) => permissionMap.get(key)).filter(Boolean) as string[];

    const { data: existingRows, error: existingError } = await admin
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", roleId);

    if (existingError) {
      throw new AppError("Não foi possível ler vínculos atuais", 500, "role_permissions_fetch_failed");
    }

    const existingIds = new Set((existingRows ?? []).map((row) => (row as { permission_id: string }).permission_id));
    const desiredSet = new Set(desiredPermissionIds);

    const toDelete = Array.from(existingIds).filter((permissionId) => !desiredSet.has(permissionId));
    const toInsert = Array.from(desiredSet).filter((permissionId) => !existingIds.has(permissionId));

    if (toDelete.length > 0) {
      const { error: deleteError } = await admin
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .in("permission_id", toDelete);

      if (deleteError) {
        throw new AppError("Não foi possível remover permissões do perfil", 500, "role_permissions_update_failed");
      }
    }

    if (toInsert.length > 0) {
      const inserts = toInsert.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      const { error: insertError } = await admin
        .from("role_permissions")
        .insert(inserts);

      if (insertError) {
        throw new AppError("Não foi possível aplicar permissões do perfil", 500, "role_permissions_update_failed");
      }
    }
  }

  return { ok: true };
}
