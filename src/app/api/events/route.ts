import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { eventCreateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/services/audit.service";
import { eventsService } from "@/services/events.service";

/**
 * GET /api/events
 * Retorna lista de eventos/cultos
 */
export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "events", action: "read" });
    if (access.response) {
      return access.response;
    }

    const events = await eventsService.list(access.context.congregationId);

    return jsonSuccess(events);
  } catch (error) {
    return jsonError(error, "Erro ao buscar eventos");
  }
}

/**
 * POST /api/events
 * Cria novo evento
 */
export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "events", action: "create" });
    if (access.response) {
      return access.response;
    }

    const body = eventCreateSchema.parse(await request.json());
    const newEvent = await eventsService.create(body, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "create",
      entityName: "events",
      entityId: String(newEvent.id),
      afterData: newEvent,
    });

    return jsonSuccess(newEvent, { message: "Evento criado com sucesso", status: 201 });
  } catch (error) {
    return jsonError(error, "Erro ao criar evento");
  }
}
