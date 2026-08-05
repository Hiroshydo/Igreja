import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccessContext, Ministry } from "@/types";
import type { MinistryCreateInput } from "@/lib/validation";

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
};
