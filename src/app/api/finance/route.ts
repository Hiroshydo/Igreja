import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { financeMovementCreateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { financeService } from "@/services/finance.service";

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "read" });
    if (access.response) {
      return access.response;
    }

    const movements = await financeService.list(access.context.congregationId);
    return jsonSuccess(movements);
  } catch (error) {
    return jsonError(error, "Erro ao buscar movimentações financeiras");
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "create" });
    if (access.response) {
      return access.response;
    }

    const body = financeMovementCreateSchema.parse(await request.json());
    const created = await financeService.create(body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "finance_create",
      entityName: "finance_transactions",
      entityId: String(created.id),
      afterData: created,
    });

    return jsonSuccess(created, { message: "Movimentação criada com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar movimentação financeira");
  }
}
