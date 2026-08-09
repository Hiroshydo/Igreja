import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
import type { Event, AccessContext } from "@/types";
import type { EventCreateInput, EventUpdateInput } from "@/lib/validation";

function toIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string;
  category: Event['category'];
  attendees: number | null;
  organizer_name: string | null;
}

function mapEvent(row: EventRow): Event {
  const startDate = new Date(row.start_at);
  const endDate = row.end_at ? new Date(row.end_at) : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: startDate.toISOString().slice(0, 10),
    time: startDate.toISOString().slice(11, 16),
    endTime: endDate ? endDate.toISOString().slice(11, 16) : undefined,
    location: row.location,
    category: row.category,
    attendees: row.attendees ?? undefined,
    organizer: row.organizer_name ?? undefined,
  };
}

export const eventsService = {
  async list(congregationId: string | null): Promise<Event[]> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("events")
      .select("*")
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .order("start_at", { ascending: true });

    if (error) {
      throw new AppError("Não foi possível buscar eventos", 500, "events_fetch_failed");
    }

    return ((data ?? []) as EventRow[]).map(mapEvent);
  },

  async create(input: EventCreateInput, context: AccessContext): Promise<Event> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("events")
      .insert({
        congregation_id: context.congregationId,
        title: input.title,
        description: input.description || null,
        category: input.category,
        start_at: toIsoDateTime(input.date, input.time),
        end_at: input.endTime ? toIsoDateTime(input.date, input.endTime) : null,
        location: input.location,
        attendees: input.attendees ?? null,
        organizer_name: input.organizer || null,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new AppError("Não foi possível criar evento", 500, "event_create_failed");
    }

    return mapEvent(data as EventRow);
  },

  async getById(id: string, congregationId: string | null): Promise<Event> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível buscar evento", 500, "event_fetch_failed");
    }

    if (!data) {
      throw new AppError("Evento não encontrado", 404, "event_not_found");
    }

    return mapEvent(data as EventRow);
  },

  async update(id: string, input: EventUpdateInput, context: AccessContext): Promise<Event> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const payload: Database["public"]["Tables"]["events"]["Update"] = {
      updated_by: context.userId,
    };

    if (typeof input.title === "string") payload.title = input.title;
    if (typeof input.description === "string") payload.description = input.description || null;
    if (typeof input.category === "string") payload.category = input.category as "culto" | "reuniao" | "evento" | "estudo" | "outro";
    if (typeof input.location === "string") payload.location = input.location;
    if (typeof input.attendees === "number") payload.attendees = input.attendees;
    if (typeof input.organizer === "string") payload.organizer_name = input.organizer || null;

    const effectiveDate = input.date;
    const effectiveTime = input.time;
    if (typeof effectiveDate === "string" && typeof effectiveTime === "string") {
      payload.start_at = toIsoDateTime(effectiveDate, effectiveTime);
    }
    if (typeof input.date === "string" && typeof input.endTime === "string") {
      payload.end_at = input.endTime ? toIsoDateTime(input.date, input.endTime) : null;
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("events")
      .update(payload)
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível atualizar evento", 500, "event_update_failed");
    }

    if (!data) {
      throw new AppError("Evento não encontrado", 404, "event_not_found");
    }

    return mapEvent(data as EventRow);
  },

  async remove(id: string, context: AccessContext): Promise<void> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("events")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null);

    if (error) {
      throw new AppError("Não foi possível excluir evento", 500, "event_delete_failed");
    }
  },
};
