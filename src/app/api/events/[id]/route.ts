import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { eventUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { eventsService } from "@/services/events.service";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "events", action: "read" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const event = await eventsService.getById(id, access.context.congregationId);
    return jsonSuccess(event);
  } catch (error) {
    return jsonError(error, "Erro ao buscar evento");
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "events", action: "update" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const beforeData = await eventsService.getById(id, access.context.congregationId);
    const body = eventUpdateSchema.parse(await request.json());
    const updatedEvent = await eventsService.update(id, body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "update",
      entityName: "events",
      entityId: String(updatedEvent.id),
      beforeData,
      afterData: updatedEvent,
    });

    return jsonSuccess(updatedEvent, { message: "Evento atualizado com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao atualizar evento");
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireRouteAccess({ request, resource: "events", action: "delete" });
    if (access.response) {
      return access.response;
    }

    const { id } = await context.params;
    const beforeData = await eventsService.getById(id, access.context.congregationId);
    await eventsService.remove(id, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "delete",
      entityName: "events",
      entityId: id,
      beforeData,
    });

    return jsonSuccess({ ok: true }, { message: "Evento excluído com sucesso" });
  } catch (error) {
    return jsonError(error, "Erro ao excluir evento");
  }
}
