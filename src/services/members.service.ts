import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Member } from "@/types";
import type { AccessContext } from "@/types";
import type { MemberCreateInput } from "@/lib/validation";

interface MemberRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  join_date: string;
  status: 'ativo' | 'inativo' | 'pendente';
  role_label: string | null;
  avatar_url: string | null;
}

function mapMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? "",
    phone: row.phone ?? undefined,
    birthDate: row.birth_date ?? undefined,
    joinDate: row.join_date,
    status: row.status,
    role: row.role_label ?? undefined,
    avatar: row.avatar_url ?? undefined,
  };
}

export const membersService = {
  async list(congregationId: string | null): Promise<Member[]> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("members")
      .select("*")
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .order("full_name", { ascending: true });

    if (error) {
      throw new AppError("Não foi possível buscar membros", 500, "members_fetch_failed");
    }

    return ((data ?? []) as MemberRow[]).map(mapMember);
  },

  async create(input: MemberCreateInput, context: AccessContext): Promise<Member> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("members")
      .insert({
        congregation_id: context.congregationId,
        full_name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        birth_date: input.birthDate || null,
        join_date: input.joinDate || new Date().toISOString().slice(0, 10),
        status: input.status,
        role_label: input.role || null,
        avatar_url: input.avatar || null,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new AppError("Não foi possível criar membro", 500, "member_create_failed");
    }

    return mapMember(data as MemberRow);
  },
};
