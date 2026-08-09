import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasServerEnv } from "@/lib/env";
import type { AccessContext } from "@/types";

export interface FinanceReportFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
  congregationId?: string;
  eventId?: string;
  category?: string;
  type?: 'receita' | 'despesa';
  kind?: 'entry' | 'exit' | 'expense';
}

export interface FinanceReportPayload {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalOutputs: number;
    balance: number;
    movementCount: number;
    largestIncome: number;
    largestOutput: number;
    largestExpense: number;
  };
  congregationReport: Array<{
    congregationId: string;
    congregationName: string;
    income: number;
    output: number;
    expenses: number;
    balance: number;
    count: number;
  }>;
  categoryReport: Array<{
    category: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  eventReport: Array<{
    eventId: string;
    eventName: string;
    congregationId: string;
    occurredAt: string;
    income: number;
    output: number;
    expenses: number;
    balance: number;
  }>;
  detailRows: Array<{
    id: string;
    occurredAt: string;
    congregationId: string;
    congregationName: string;
    eventId?: string | null;
    eventName?: string | null;
    type: 'receita' | 'despesa';
    category: string;
    description?: string | null;
    amount: number;
    origin?: string | null;
    reference?: string | null;
    documentReference?: string | null;
    createdBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

export const financeReportsService = {
  async getFinanceReport(filters: FinanceReportFilters, context: AccessContext): Promise<FinanceReportPayload> {
    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    if (!context.congregationId) {
      return {
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          totalOutputs: 0,
          balance: 0,
          movementCount: 0,
          largestIncome: 0,
          largestOutput: 0,
          largestExpense: 0,
        },
        congregationReport: [],
        categoryReport: [],
        eventReport: [],
        detailRows: [],
      } satisfies FinanceReportPayload;
    }

    const admin = createAdminSupabaseClient();

    const baseQuery = admin
      .from("finance_transactions")
      .select(`
        id,
        congregation_id,
        event_id,
        occurred_at,
        type,
        category,
        amount,
        description,
        origin,
        reference,
        document_reference,
        created_by,
        created_at,
        updated_at,
        deleted_at,
        account:finance_accounts(name, category),
        congregations:congregations(name)
      `)
      .eq("congregation_id", context.congregationId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    let query = baseQuery;

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.eventId) {
      query = query.eq("event_id", filters.eventId);
    }

    if (filters.startDate) {
      query = query.gte("occurred_at", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("occurred_at", filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError("Não foi possível montar o relatório financeiro", 500, "finance_report_failed");
    }

    const rows = (data ?? []) as Array<any>;

    const detailRows = rows.map((row) => ({
      id: row.id,
      occurredAt: row.occurred_at,
      congregationId: row.congregation_id,
      congregationName: row.congregations?.name ?? "Congregação",
      eventId: row.event_id,
      eventName: row.event_id ?? null,
      type: row.type,
      category: row.category,
      description: row.description,
      amount: Number(row.amount),
      origin: row.origin,
      reference: row.reference,
      documentReference: row.document_reference,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const totalIncome = detailRows
      .filter((row) => row.type === "receita")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const totalExpenses = detailRows
      .filter((row) => row.type === "despesa")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const totalOutputs = detailRows
      .filter((row) => row.type === "despesa")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const largestIncome = detailRows
      .filter((row) => row.type === "receita")
      .reduce((max, row) => Math.max(max, Number(row.amount)), 0);

    const largestOutput = detailRows
      .filter((row) => row.type === "despesa")
      .reduce((max, row) => Math.max(max, Number(row.amount)), 0);

    const largestExpense = largestOutput;

    const categoryMap = new Map<string, { count: number; total: number }>();
    detailRows.forEach((row) => {
      const previous = categoryMap.get(row.category) ?? { count: 0, total: 0 };
      previous.count += 1;
      previous.total += Number(row.amount);
      categoryMap.set(row.category, previous);
    });

    const totalCategory = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.total, 0) || 1;

    const categoryReport = Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      count: value.count,
      total: value.total,
      percentage: totalCategory === 0 ? 0 : (value.total / totalCategory) * 100,
    }));

    const congregationNames = new Map<string, string>();
    for (const item of detailRows) {
      congregationNames.set(item.congregationId, item.congregationName);
    }

    const congregationReport = Array.from(
      new Map(
        detailRows.map((row) => [row.congregationId, {
          congregationId: row.congregationId,
          congregationName: row.congregationName,
          income: 0,
          output: 0,
          expenses: 0,
          balance: 0,
          count: 0,
        }])
      ).values()
    );

    for (const row of detailRows) {
      const bucket = congregationReport.find((item) => item.congregationId === row.congregationId);
      if (bucket) {
        bucket.count += 1;
        if (row.type === "receita") {
          bucket.income += Number(row.amount);
        }
        if (row.type === "despesa") {
          bucket.output += Number(row.amount);
          bucket.expenses += Number(row.amount);
        }
        bucket.balance = bucket.income - bucket.output;
      }
    }

    const eventNames = new Map<string, string>();
    const eventReport = Array.from(new Map<string, any>()).values();

    const eventRows = detailRows.reduce((acc, row) => {
      if (!row.eventId) {
        return acc;
      }
      const key = row.eventId;
      const current = acc.get(key) ?? {
        eventId: row.eventId,
        eventName: row.eventName ?? row.eventId,
        congregationId: row.congregationId,
        occurredAt: row.occurredAt,
        income: 0,
        output: 0,
        expenses: 0,
        balance: 0,
      };
      if (row.type === "receita") {
        current.income += Number(row.amount);
      }
      if (row.type === "despesa") {
        current.output += Number(row.amount);
        current.expenses += Number(row.amount);
      }
      current.balance = current.income - current.output;
      acc.set(key, current);
      return acc;
    }, new Map<string, any>());

    const returnPayload: FinanceReportPayload = {
      summary: {
        totalIncome,
        totalExpenses,
        totalOutputs,
        balance: totalIncome - totalExpenses,
        movementCount: detailRows.length,
        largestIncome,
        largestOutput,
        largestExpense,
      },
      congregationReport,
      categoryReport,
      eventReport: Array.from(eventRows.values()) as any,
      detailRows,
    };

    return returnPayload;
  },

  async exportCsv(filters: FinanceReportFilters, context: AccessContext) {
    const report = await this.getFinanceReport(filters, context);

    const headers = [
      "Data",
      "Congregação",
      "Evento",
      "Tipo",
      "Categoria",
      "Descrição",
      "Entrada",
      "Saída",
      "Saldo",
      "Responsável",
    ];

    const content = [headers.join(",")]
      .concat(report.detailRows.map((row) => {
        const amount = Number(row.amount);
        const entry = row.type === "receita" ? amount : 0;
        const exit = row.type === "despesa" ? amount : 0;
        const balance = entry - exit;

        return [
          row.occurredAt,
          row.congregationName,
          row.eventName ?? "",
          row.type,
          row.category,
          row.description ?? "",
          String(entry),
          String(exit),
          String(balance),
          row.createdBy ?? "",
        ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",");
      }))
      .join("\n");

    return content;
  },
};
