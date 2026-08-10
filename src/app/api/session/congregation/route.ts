import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonSuccess } from "@/lib/http";
import { requireAuthenticatedRoute, setAuthenticatedActiveCongregation } from "@/lib/auth/session";
import { writeAuditLog } from "@/services/audit.service";

const sessionCongregationSchema = z.object({
  congregationId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const access = await requireAuthenticatedRoute(request);
    if (access.response) {
      return access.response;
    }

    const body = sessionCongregationSchema.parse(await request.json());
    const selected = await setAuthenticatedActiveCongregation(access.context.profileId, body.congregationId);

    await writeAuditLog({
      request,
      context: {
        ...access.context,
        congregationId: selected.congregation.id,
        roleCodes: selected.roleCodes,
        permissions: selected.permissions,
      },
      action: "congregation_change",
      entityName: "profiles",
      entityId: access.context.profileId,
      afterData: {
        congregationId: selected.congregation.id,
      },
    });

    return jsonSuccess(
      {
        congregationId: selected.congregation.id,
        roleCodes: selected.roleCodes,
        permissions: selected.permissions,
      },
      { message: "Congregação ativa atualizada com sucesso" },
    );
  } catch (error) {
    return jsonError(error, "Erro ao selecionar congregação ativa");
  }
}