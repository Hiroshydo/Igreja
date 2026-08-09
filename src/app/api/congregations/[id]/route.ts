import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { congregationsService } from "@/services/congregations.service";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "congregations", action: "update" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const body = await request.json();
    const congregation = await congregationsService.update(id, body, access.context);
    return jsonSuccess(congregation, { message: "Congregação atualizada com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao atualizar congregação");
  }
}
