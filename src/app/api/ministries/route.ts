import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { ministryCreateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { ministriesService } from "@/services/ministries.service";

/**
 * GET /api/ministries
 * Retorna lista de ministérios
 */
export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "ministries", action: "read" });
    if (access.response) {
      return access.response;
    }

    const ministries = await ministriesService.list(access.context.congregationId);

    return jsonSuccess(ministries);
  } catch (error) {
    return jsonError(error, "Erro ao buscar ministérios");
  }
}

/**
 * POST /api/ministries
 * Cria novo ministério
 */
export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "ministries", action: "create" });
    if (access.response) {
      return access.response;
    }

    const body = ministryCreateSchema.parse(await request.json());
    const newMinistry = await ministriesService.create(body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "create",
      entityName: "ministries",
      entityId: String(newMinistry.id),
      afterData: newMinistry,
    });

    return jsonSuccess(newMinistry, { message: "Ministério criado com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar ministério");
  }
}
