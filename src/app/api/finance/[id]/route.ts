import { NextRequest } from "next/server";
import { z } from "zod";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { financeMovementUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { financeService } from "@/services/finance.service";

const financeDeleteSchema = z.object({
  reason: z.string().trim().min(3).optional().or(z.literal("")),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "read" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const movement = await financeService.getById(id, access.context.congregationId);
    return jsonSuccess(movement);
  } catch (error) {
    return jsonError(error, "Erro ao buscar movimentação financeira");
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "update" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const beforeData = await financeService.getById(id, access.context.congregationId);
    const body = financeMovementUpdateSchema.parse(await request.json());
    const updated = await financeService.update(id, body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "finance_update",
      entityName: "finance_transactions",
      entityId: String(updated.id),
      beforeData,
      afterData: updated,
    });

    return jsonSuccess(updated, { message: "Movimentação atualizada com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao atualizar movimentação financeira");
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "delete" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const beforeData = await financeService.getById(id, access.context.congregationId);
    const parsedBody = request.headers.get("content-length") === "0"
      ? { reason: "Exclusão lógica solicitada pelo usuário autenticado" }
      : financeDeleteSchema.parse(await request.json().catch(() => ({ reason: "Exclusão lógica solicitada pelo usuário autenticado" })));
    const deletedReason = parsedBody.reason || "Exclusão lógica solicitada pelo usuário autenticado";

    await financeService.remove(id, access.context, deletedReason);

    await writeAuditLog({
      request,
      context: access.context,
      action: "finance_delete",
      entityName: "finance_transactions",
      entityId: id,
      beforeData,
      afterData: {
        deletedReason,
      },
    });

    return jsonSuccess({ ok: true }, { message: "Movimentação excluída com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao excluir movimentação financeira");
  }
}
