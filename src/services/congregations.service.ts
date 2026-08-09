import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccessContext } from "@/types";

export interface CongregationRecord {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  legalName: string | null;
  taxId: string | null;
  isActive: boolean;
}

function mapCongregation(row: any): CongregationRecord {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    city: row.city ?? null,
    state: row.state ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    legalName: row.legal_name ?? null,
    taxId: row.tax_id ?? null,
    isActive: row.is_active ?? true,
  };
}

export const congregationsService = {
  async list(): Promise<CongregationRecord[]> {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("congregations")
      .select("id, name, code, city, state, email, phone, legal_name, tax_id, is_active")
      .order("name", { ascending: true });

    if (error) {
      throw new AppError("Não foi possível buscar congregações", 500, "congregations_fetch_failed");
    }

    return (data ?? []).map(mapCongregation);
  },

  async create(input: Partial<CongregationRecord>, context: AccessContext): Promise<CongregationRecord> {
    const admin = createAdminSupabaseClient();
    const payload = {
      name: input.name ?? "Nova congregação",
      code: input.code ?? (input.name ?? "nova-congregacao").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      city: input.city ?? null,
      state: input.state ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      legal_name: input.legalName ?? null,
      tax_id: input.taxId ?? null,
      is_active: input.isActive ?? true,
    };

    const { data, error } = await admin
      .from("congregations")
      .insert(payload)
      .select("id, name, code, city, state, email, phone, legal_name, tax_id, is_active")
      .single();

    if (error) {
      throw new AppError("Não foi possível criar congregação", 500, "congregation_create_failed");
    }

    return mapCongregation(data);
  },

  async update(id: string, input: Partial<CongregationRecord>, context: AccessContext): Promise<CongregationRecord> {
    const admin = createAdminSupabaseClient();
    const payload: Record<string, unknown> = {};

    if (typeof input.name === "string") payload.name = input.name;
    if (typeof input.code === "string") payload.code = input.code;
    if (typeof input.city === "string" || input.city === null) payload.city = input.city;
    if (typeof input.state === "string" || input.state === null) payload.state = input.state;
    if (typeof input.email === "string" || input.email === null) payload.email = input.email;
    if (typeof input.phone === "string" || input.phone === null) payload.phone = input.phone;
    if (typeof input.legalName === "string" || input.legalName === null) payload.legal_name = input.legalName;
    if (typeof input.taxId === "string" || input.taxId === null) payload.tax_id = input.taxId;
    if (typeof input.isActive === "boolean") payload.is_active = input.isActive;

    const { data, error } = await admin
      .from("congregations")
      .update(payload)
      .eq("id", id)
      .select("id, name, code, city, state, email, phone, legal_name, tax_id, is_active")
      .single();

    if (error) {
      throw new AppError("Não foi possível atualizar congregação", 500, "congregation_update_failed");
    }

    return mapCongregation(data);
  },
};
