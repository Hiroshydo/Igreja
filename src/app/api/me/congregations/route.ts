import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/http";
import { listAuthenticatedCongregations, requireAuthenticatedRoute } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const access = await requireAuthenticatedRoute(request);
    if (access.response) {
      return access.response;
    }

    const congregations = await listAuthenticatedCongregations(access.context.profileId);
    return jsonSuccess(
      congregations.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    );
  } catch (error) {
    return jsonError(error, "Erro ao buscar congregações vinculadas");
  }
}