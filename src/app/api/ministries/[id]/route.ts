import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { ministryUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { ministriesService } from "@/services/ministries.service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "ministries", action: "read" });
    if (access.response) {
      return access.response;
    }

    const ministry = await ministriesService.getById(params.id, access.context.congregationId);
    return jsonSuccess(ministry);
  } catch (error) {
    return jsonError(error, "Erro ao buscar ministério");
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "ministries", action: "update" });
    if (access.response) {
      return access.response;
    }

    const beforeData = await ministriesService.getById(params.id, access.context.congregationId);
    const body = ministryUpdateSchema.parse(await request.json());
    const updatedMinistry = await ministriesService.update(params.id, body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "update",
      entityName: "ministries",
      entityId: String(updatedMinistry.id),
      beforeData,
      afterData: updatedMinistry,
    });

    return jsonSuccess(updatedMinistry, { message: "Ministério atualizado com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao atualizar ministério");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "ministries", action: "delete" });
    if (access.response) {
      return access.response;
    }

    const beforeData = await ministriesService.getById(params.id, access.context.congregationId);
    await ministriesService.remove(params.id, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "delete",
      entityName: "ministries",
      entityId: params.id,
      beforeData,
    });

    return jsonSuccess({ ok: true }, { message: "Ministério excluído com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao excluir ministério");
  }
}
