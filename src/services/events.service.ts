import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Event, AccessContext } from "@/types";
import type { EventCreateInput } from "@/lib/validation";

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
};
