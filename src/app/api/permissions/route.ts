import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { listPermissionMatrix, savePermissionMatrix } from "@/services/permissions.service";
import { writeAuditLog } from "@/services/audit.service";

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "system", action: "manage" });
    if (access.response) {
      return access.response;
    }

    const matrix = await listPermissionMatrix();
    return jsonSuccess(matrix);
  } catch (error) {
    return jsonError(error, "Erro ao buscar matriz de permissões");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "system", action: "manage" });
    if (access.response) {
      return access.response;
    }

    const body = await request.json();
    const result = await savePermissionMatrix(body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "PERMISSION_UPDATED",
      entityName: "roles_permissions",
      entityId: "matrix",
      afterData: body,
    });

    return jsonSuccess(result, { message: "Matriz de permissões salva com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao salvar matriz de permissões");
  }
}
