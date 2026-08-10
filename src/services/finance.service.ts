import { AppError } from "@/lib/http";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";
import type { AccessContext, FinanceTransaction, FinanceAccount, FinanceCategory, FinanceMovementInput } from "@/types";

const legacyFinanceCategoryMap: Record<string, string> = {
  dizimo: "dizimos",
  dizimos: "dizimos",
  oferta: "ofertas",
  ofertas: "ofertas",
  doacao: "doacoes",
  doacoes: "doacoes",
  despesa: "outras_despesas",
  despesas: "outras_despesas",
  evento: "eventos",
  eventos: "eventos",
};

const normalizeMoney = (value: number | string) => {
  const normalizedValue = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const numeric = typeof normalizedValue === "number" ? normalizedValue : Number(normalizedValue);
  if (!Number.isFinite(numeric)) {
    throw new AppError("Valor financeiro inválido", 400, "invalid_finance_amount");
  }

  if (numeric <= 0) {
    throw new AppError("Valor financeiro deve ser maior que zero", 400, "invalid_finance_amount");
  }

  if (Math.abs(Math.round(numeric * 100) - numeric * 100) > 0.000001) {
    throw new AppError("Valor financeiro deve respeitar duas casas decimais", 400, "invalid_finance_amount");
  }

  return Number(numeric.toFixed(2));
};

async function resolveFinanceAccountId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  congregationId: string,
  userId: string,
  requestedAccountId?: string,
) {
  if (requestedAccountId) {
    const { data: requestedAccount, error: requestedAccountError } = await supabase
      .from("finance_accounts")
      .select("id")
      .eq("id", requestedAccountId)
      .eq("congregation_id", congregationId)
      .eq("is_active", true)
      .maybeSingle();

    if (requestedAccountError) {
      throw new AppError("Não foi possível validar a conta financeira informada", 500, "finance_account_fetch_failed");
    }

    if (!requestedAccount?.id) {
      throw new AppError("Conta financeira não pertence à congregação ativa", 403, "finance_account_scope_denied");
    }

    return requestedAccount.id;
  }

  const { data: existingAccount, error: existingError } = await supabase
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

  const { data: createdAccount, error: createError } = await supabase
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

async function validateFinanceReferences(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  congregationId: string,
  input: Pick<FinanceMovementInput, "type" | "category" | "eventId">,
) {
  const { data: categoryRow, error: categoryError } = await supabase
    .from("finance_categories")
    .select("code, type")
    .eq("congregation_id", congregationId)
    .eq("code", input.category)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    throw new AppError("Não foi possível validar a categoria financeira", 500, "finance_category_fetch_failed");
  }

  if (!categoryRow) {
    throw new AppError("Categoria financeira não pertence à congregação ativa", 403, "finance_category_scope_denied");
  }

  if (categoryRow.type !== "ambos" && categoryRow.type !== input.type) {
    throw new AppError("Categoria financeira incompatível com o tipo da movimentação", 400, "finance_category_type_mismatch");
  }

  if (!input.eventId) {
    return;
  }

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", input.eventId)
    .eq("congregation_id", congregationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (eventError) {
    throw new AppError("Não foi possível validar o evento financeiro", 500, "finance_event_fetch_failed");
  }

  if (!eventRow?.id) {
    throw new AppError("Evento não pertence à congregação ativa", 403, "finance_event_scope_denied");
  }
}

function requireCongregationContext(congregationId: string | null, message: string) {
  if (!congregationId) {
    throw new AppError(message, 403, "active_congregation_required");
  }

  return congregationId;
}

function normalizeFinanceCategoryValue(category: string) {
  const normalizedKey = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return legacyFinanceCategoryMap[normalizedKey] ?? normalizedKey;
}

export const financeService = {
  async list(congregationId: string | null): Promise<FinanceTransaction[]> {
    if (!congregationId) {
      return [];
    }

    if (!hasServerEnv()) {
      return [];
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
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
    const activeCongregationId = requireCongregationContext(congregationId, "Selecione uma congregação ativa antes de consultar o financeiro");

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("finance_transactions")
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, deleted_by, deleted_reason, account:finance_accounts(name, category)`
      )
      .eq("id", id)
      .eq("congregation_id", activeCongregationId)
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
    const congregationId = requireCongregationContext(context.congregationId, "Selecione uma congregação ativa antes de criar lançamentos financeiros");
    const category = normalizeFinanceCategoryValue(input.category);

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const supabase = await createServerSupabaseClient();
    await validateFinanceReferences(supabase, congregationId, { ...input, category });
    const accountId = await resolveFinanceAccountId(supabase, congregationId, context.userId, input.accountId);

    const payload = {
      congregation_id: congregationId,
      account_id: accountId,
      type: input.type,
      category,
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
    const { data, error } = await supabase
      .from("finance_transactions")
      .insert(payload)
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, deleted_by, deleted_reason, account:finance_accounts(name, category)`
      )
      .single();

    if (error) {
      throw new AppError("Não foi possível criar a movimentação financeira", 500, "finance_create_failed");
    }

    return data as FinanceTransaction;
  },

  async update(id: string, input: Partial<FinanceMovementInput>, context: AccessContext): Promise<FinanceTransaction> {
    const congregationId = requireCongregationContext(context.congregationId, "Selecione uma congregação ativa antes de editar lançamentos financeiros");

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const updatePayload: Database["public"]["Tables"]["finance_transactions"]["Update"] = {
      updated_by: context.userId,
    };

    const beforeData = await this.getById(id, congregationId);
    const nextType = input.type ?? beforeData.type;
    const nextCategory = typeof input.category === "string" ? normalizeFinanceCategoryValue(input.category) : beforeData.category;

    if (typeof input.type !== "undefined") updatePayload.type = input.type as "receita" | "despesa";
    if (typeof input.category !== "undefined") updatePayload.category = nextCategory;
    if (typeof input.amount !== "undefined") updatePayload.amount = normalizeMoney(input.amount);
    if (typeof input.occurredAt !== "undefined") updatePayload.occurred_at = input.occurredAt;
    if (typeof input.description !== "undefined") updatePayload.description = input.description ?? null;
    if (typeof input.origin !== "undefined") updatePayload.origin = input.origin ?? null;
    if (typeof input.reference !== "undefined") updatePayload.reference = input.reference ?? null;
    if (typeof input.documentReference !== "undefined") updatePayload.document_reference = input.documentReference ?? null;
    if (typeof input.observations !== "undefined") updatePayload.observations = input.observations ?? null;
    if (typeof input.eventId !== "undefined") updatePayload.event_id = input.eventId ?? null;

    const supabase = await createServerSupabaseClient();
    const accountId = await resolveFinanceAccountId(
      supabase,
      congregationId,
      context.userId,
      typeof input.accountId === "string" && input.accountId.length > 0 ? input.accountId : beforeData.accountId,
    );

    updatePayload.account_id = accountId;

    await validateFinanceReferences(supabase, congregationId, {
      type: nextType,
      category: nextCategory,
      eventId: typeof input.eventId === "undefined" ? beforeData.eventId ?? undefined : input.eventId || undefined,
    });

    const { data, error } = await supabase
      .from("finance_transactions")
      .update(updatePayload)
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .select(
        `id, congregation_id, account_id, type, category, amount, occurred_at, description, origin, reference, document_reference, observations, event_id, created_by, updated_by, created_at, updated_at, deleted_at, deleted_by, deleted_reason, account:finance_accounts(name, category)`
      )
      .single();

    if (error) {
      throw new AppError("Não foi possível atualizar a movimentação financeira", 500, "finance_update_failed");
    }

    return data as FinanceTransaction;
  },

  async remove(id: string, context: AccessContext, deletedReason: string): Promise<void> {
    const congregationId = requireCongregationContext(context.congregationId, "Selecione uma congregação ativa antes de excluir lançamentos financeiros");

    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("finance_transactions")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: context.userId,
        deleted_reason: deletedReason,
        updated_by: context.userId,
      })
      .eq("id", id)
      .eq("congregation_id", congregationId)
      .is("deleted_at", null);

    if (error) {
      throw new AppError("Não foi possível excluir logicamente a movimentação financeira", 500, "finance_delete_failed");
    }
  },
};

export async function listFinanceAccounts(congregationId: string | null): Promise<FinanceAccount[]> {
  if (!congregationId) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
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
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
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
