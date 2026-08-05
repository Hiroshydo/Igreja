import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { memberCreateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { membersService } from "@/services/members.service";

/**
 * GET /api/members
 * Retorna lista de membros da igreja
 */
export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "members", action: "read" });
    if (access.response) {
      return access.response;
    }

    const members = await membersService.list(access.context.congregationId);

    return jsonSuccess(members);
  } catch (error) {
    return jsonError(error, "Erro ao buscar membros");
  }
}

/**
 * POST /api/members
 * Cria novo membro
 */
export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "members", action: "create" });
    if (access.response) {
      return access.response;
    }

    const body = memberCreateSchema.parse(await request.json());
    const newMember = await membersService.create(body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "create",
      entityName: "members",
      entityId: String(newMember.id),
      afterData: newMember,
    });

    return jsonSuccess(newMember, { message: "Membro criado com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar membro");
  }
}
