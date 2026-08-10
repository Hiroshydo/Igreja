import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { congregationsService } from "@/services/congregations.service";

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "congregations", action: "read" });
    if (access.response) {
      return access.response;
    }

    const congregations = await congregationsService.list(access.context);
    return jsonSuccess(congregations);
  } catch (error) {
    return jsonError(error, "Erro ao buscar congregações");
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "congregations", action: "create" });
    if (access.response) {
      return access.response;
    }

    const body = await request.json();
    const congregation = await congregationsService.create(body, access.context);
    return jsonSuccess(congregation, { message: "Congregação criada com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar congregação");
  }
}
