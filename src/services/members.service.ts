import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
import type { Member } from "@/types";
import type { AccessContext } from "@/types";
import type { MemberCreateInput, MemberUpdateInput } from "@/lib/validation";

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

  async getById(id: string, congregationId: string | null): Promise<Member> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("members")
      .select("*")
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível buscar membro", 500, "member_fetch_failed");
    }

    if (!data) {
      throw new AppError("Membro não encontrado", 404, "member_not_found");
    }

    return mapMember(data as MemberRow);
  },

  async update(id: string, input: MemberUpdateInput, context: AccessContext): Promise<Member> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const payload: Database["public"]["Tables"]["members"]["Update"] = {
      updated_by: context.userId,
    };

    if (typeof input.name === "string") payload.full_name = input.name;
    if (typeof input.email === "string") payload.email = input.email || null;
    if (typeof input.phone === "string") payload.phone = input.phone || null;
    if (typeof input.birthDate === "string") payload.birth_date = input.birthDate || null;
    if (typeof input.joinDate === "string") payload.join_date = input.joinDate;
    if (typeof input.status === "string") payload.status = input.status as "ativo" | "inativo" | "pendente";
    if (typeof input.role === "string") payload.role_label = input.role || null;
    if (typeof input.avatar === "string") payload.avatar_url = input.avatar || null;

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("members")
      .update(payload)
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível atualizar membro", 500, "member_update_failed");
    }

    if (!data) {
      throw new AppError("Membro não encontrado", 404, "member_not_found");
    }

    return mapMember(data as MemberRow);
  },

  async remove(id: string, context: AccessContext): Promise<void> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("members")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null);

    if (error) {
      throw new AppError("Não foi possível excluir membro", 500, "member_delete_failed");
    }
  },
};
