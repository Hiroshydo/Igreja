import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccessContext, Ministry } from "@/types";
import type { MinistryCreateInput, MinistryUpdateInput } from "@/lib/validation";

interface MinistryRow {
  id: string;
  name: string;
  description: string;
  leader_name: string | null;
  leader_profile_id: string | null;
  leader_email: string | null;
  leader_phone: string | null;
  member_count: number;
  category: string | null;
  image_url: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
}

function mapMinistry(row: MinistryRow): Ministry {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    leader: row.leader_name ?? row.leader_profile_id ?? "",
    leaderEmail: row.leader_email ?? undefined,
    leaderPhone: row.leader_phone ?? undefined,
    members: row.member_count,
    category: row.category ?? "Geral",
    image: row.image_url ?? undefined,
    meetingDay: row.meeting_day ?? undefined,
    meetingTime: row.meeting_time ?? undefined,
  };
}

export const ministriesService = {
  async list(congregationId: string | null): Promise<Ministry[]> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("ministries")
      .select("*")
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      throw new AppError("Não foi possível buscar ministérios", 500, "ministries_fetch_failed");
    }

    return ((data ?? []) as MinistryRow[]).map(mapMinistry);
  },

  async create(input: MinistryCreateInput, context: AccessContext): Promise<Ministry> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("ministries")
      .insert({
        congregation_id: context.congregationId,
        name: input.name,
        description: input.description,
        leader_name: input.leader || null,
        leader_email: input.leaderEmail || null,
        leader_phone: input.leaderPhone || null,
        member_count: input.members,
        category: input.category,
        image_url: input.image || null,
        meeting_day: input.meetingDay || null,
        meeting_time: input.meetingTime || null,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new AppError("Não foi possível criar ministério", 500, "ministry_create_failed");
    }

    return mapMinistry(data as MinistryRow);
  },

  async getById(id: string, congregationId: string | null): Promise<Ministry> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("ministries")
      .select("*")
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível buscar ministério", 500, "ministry_fetch_failed");
    }

    if (!data) {
      throw new AppError("Ministério não encontrado", 404, "ministry_not_found");
    }

    return mapMinistry(data as MinistryRow);
  },

  async update(id: string, input: MinistryUpdateInput, context: AccessContext): Promise<Ministry> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const payload: Record<string, unknown> = {
      updated_by: context.userId,
    };

    if (typeof input.name === "string") payload.name = input.name;
    if (typeof input.description === "string") payload.description = input.description;
    if (typeof input.leader === "string") payload.leader_name = input.leader || null;
    if (typeof input.leaderEmail === "string") payload.leader_email = input.leaderEmail || null;
    if (typeof input.leaderPhone === "string") payload.leader_phone = input.leaderPhone || null;
    if (typeof input.members === "number") payload.member_count = input.members;
    if (typeof input.category === "string") payload.category = input.category;
    if (typeof input.image === "string") payload.image_url = input.image || null;
    if (typeof input.meetingDay === "string") payload.meeting_day = input.meetingDay || null;
    if (typeof input.meetingTime === "string") payload.meeting_time = input.meetingTime || null;

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("ministries")
      .update(payload)
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível atualizar ministério", 500, "ministry_update_failed");
    }

    if (!data) {
      throw new AppError("Ministério não encontrado", 404, "ministry_not_found");
    }

    return mapMinistry(data as MinistryRow);
  },

  async remove(id: string, context: AccessContext): Promise<void> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("ministries")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: context.userId,
        updated_by: context.userId,
      })
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null);

    if (error) {
      throw new AppError("Não foi possível excluir ministério", 500, "ministry_delete_failed");
    }
  },
};
