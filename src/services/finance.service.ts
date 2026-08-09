import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasServerEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";
import type { AccessContext, FinanceTransaction, FinanceAccount, FinanceCategory, FinanceMovementInput } from "@/types";

const normalizeMoney = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    throw new AppError("Valor financeiro inválido", 400, "invalid_finance_amount");
  }

  return numeric;
};

async function resolveFinanceAccountId(admin: ReturnType<typeof createAdminSupabaseClient>, congregationId: string, userId: string, requestedAccountId?: string) {
  if (requestedAccountId) {
    return requestedAccountId;
  }

  const { data: existingAccount, error: existingError } = await admin
    .from("finance_accounts")
    .select("id")
    .eq("congregation_id", congregationId)
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new AppError("Não foi possível localizar a conta financeira", 500, "finance_account_fetch_failed");
  }

  if (existingAccount?.id) {
    return existingAccount.id;
  }

  const { data: createdAccount, error: createError } = await admin
    .from("finance_accounts")
    .insert({
      congregation_id: congregationId,
      name: "Caixa principal",
      category: "caixa",
      is_active: true,
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (createError || !createdAccount?.id) {
    throw new AppError("Não foi possível criar a conta financeira padrão", 500, "finance_account_create_failed");
  }

  return createdAccount.id;
}

export const financeService = {
  async list(congregationId: string | null): Promise<FinanceTransaction[]> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!hasServerEnv()) {
      return [];
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("finance_transactions")
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, account:finance_accounts(name, category)`
      )
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    if (error) {
      throw new AppError("Não foi possível buscar movimentações financeiras", 500, "finance_fetch_failed");
    }

    return (data ?? []) as FinanceTransaction[];
  },

  async getById(id: string, congregationId: string | null): Promise<FinanceTransaction> {
    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("finance_transactions")
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, account:finance_accounts(name, category)`
      )
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new AppError("Não foi possível buscar o registro financeiro", 500, "finance_fetch_failed");
    }

    if (!data) {
      throw new AppError("Movimentação financeira não encontrada", 404, "finance_not_found");
    }

    return data as FinanceTransaction;
  },

  async create(input: FinanceMovementInput, context: AccessContext): Promise<FinanceTransaction> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const admin = createAdminSupabaseClient();
    const accountId = await resolveFinanceAccountId(admin, context.congregationId, context.userId, input.accountId);
    const targetCongregationId = input.congregationId || context.congregationId;

    const payload = {
      congregation_id: targetCongregationId,
      account_id: accountId,
      type: input.type,
      category: input.category,
      amount: normalizeMoney(input.amount),
      occurred_at: input.occurredAt,
      description: input.description ?? null,
      origin: input.origin ?? null,
      reference: input.reference ?? null,
      document_reference: input.documentReference ?? null,
      observations: input.observations ?? null,
      event_id: input.eventId ?? null,
      created_by: context.userId,
      updated_by: context.userId,
    };
    const { data, error } = await admin
      .from("finance_transactions")
      .insert(payload)
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, account:finance_accounts(name, category)`
      )
      .single();

    if (error) {
      throw new AppError("Não foi possível criar a movimentação financeira", 500, "finance_create_failed");
    }

    return data as FinanceTransaction;
  },

  async update(id: string, input: Partial<FinanceMovementInput>, context: AccessContext): Promise<FinanceTransaction> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const updatePayload: Database["public"]["Tables"]["finance_transactions"]["Update"] = {
      updated_by: context.userId,
    };

    if (typeof input.accountId !== "undefined") updatePayload.account_id = input.accountId;
    if (typeof input.type !== "undefined") updatePayload.type = input.type as "receita" | "despesa";
    if (typeof input.category !== "undefined") updatePayload.category = input.category;
    if (typeof input.amount !== "undefined") updatePayload.amount = normalizeMoney(input.amount);
    if (typeof input.occurredAt !== "undefined") updatePayload.occurred_at = input.occurredAt;
    if (typeof input.description !== "undefined") updatePayload.description = input.description ?? null;
    if (typeof input.origin !== "undefined") updatePayload.origin = input.origin ?? null;
    if (typeof input.reference !== "undefined") updatePayload.reference = input.reference ?? null;
    if (typeof input.documentReference !== "undefined") updatePayload.document_reference = input.documentReference ?? null;
    if (typeof input.observations !== "undefined") updatePayload.observations = input.observations ?? null;
    if (typeof input.eventId !== "undefined") updatePayload.event_id = input.eventId ?? null;

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("finance_transactions")
      .update(updatePayload)
      .eq("id", id)
      .eq("congregation_id", context.congregationId)
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, account:finance_accounts(name, category)`
      )
      .single();

    if (error) {
      throw new AppError("Não foi possível atualizar a movimentação financeira", 500, "finance_update_failed");
    }

    return data as FinanceTransaction;
  },

  async remove(id: string, context: AccessContext): Promise<void> {
    if (!context.congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("finance_transactions")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", id)
      .eq("congregation_id", context.congregationId);

    if (error) {
      throw new AppError("Não foi possível excluir logicamente a movimentação financeira", 500, "finance_delete_failed");
    }
  },
};

export async function listFinanceAccounts(congregationId: string | null): Promise<FinanceAccount[]> {
  if (!congregationId) {
    throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("finance_accounts")
    .select("id, congregation_id, name, category, is_active, created_at, updated_at")
    .eq("congregation_id", congregationId)
    .order("name");

  if (error) {
    throw new AppError("Não foi possível buscar contas financeiras", 500, "finance_accounts_fetch_failed");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    congregationId: row.congregation_id,
    name: row.name,
    category: row.category,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function listFinanceCategories(congregationId: string | null): Promise<FinanceCategory[]> {
  if (!congregationId) {
    throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("finance_categories")
    .select("id, congregation_id, code, name, type, description, is_active, created_at, updated_at")
    .eq("congregation_id", congregationId)
    .order("name");

  if (error) {
    throw new AppError("Não foi possível buscar categorias financeiras", 500, "finance_categories_fetch_failed");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    congregationId: row.congregation_id,
    code: row.code,
    name: row.name,
    type: row.type,
    description: row.description ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
