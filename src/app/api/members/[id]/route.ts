import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { memberUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { membersService } from "@/services/members.service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "members", action: "read" });
    if (access.response) {
      return access.response;
    }

    const member = await membersService.getById(params.id, access.context.congregationId);
    return jsonSuccess(member);
  } catch (error) {
    return jsonError(error, "Erro ao buscar membro");
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "members", action: "update" });
    if (access.response) {
      return access.response;
    }

    const beforeData = await membersService.getById(params.id, access.context.congregationId);
    const body = memberUpdateSchema.parse(await request.json());
    const updatedMember = await membersService.update(params.id, body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "update",
      entityName: "members",
      entityId: String(updatedMember.id),
      beforeData,
      afterData: updatedMember,
    });

    return jsonSuccess(updatedMember, { message: "Membro atualizado com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao atualizar membro");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireRouteAccess({ request, resource: "members", action: "delete" });
    if (access.response) {
      return access.response;
    }

    const beforeData = await membersService.getById(params.id, access.context.congregationId);
    await membersService.remove(params.id, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "delete",
      entityName: "members",
      entityId: params.id,
      beforeData,
    });

    return jsonSuccess({ ok: true }, { message: "Membro excluído com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao excluir membro");
  }
}
