import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerEnv } from "@/lib/env";
import type { AccessContext } from "@/types";
import ExcelJS from "exceljs";

function formatBrasiliaDateTime(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(parsed);
}

function extractAuthorizedBy(observations?: string | null) {
  if (!observations) return "";
  const match = observations.match(/Autorizado por:\s*([^|\n]+)/i);
  return match?.[1]?.trim() ?? "";
}

export interface FinanceReportFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
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
    authorizedBy?: string | null;
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
      throw new AppError("Selecione uma congregação ativa antes de consultar relatórios financeiros", 403, "active_congregation_required");
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();

    const baseQuery = supabase
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
        observations,
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

    const createdByIds = Array.from(
      new Set(
        rows
          .map((row) => row.created_by as string | null)
          .filter((value): value is string => Boolean(value))
      )
    );

    const createdByMap = new Map<string, string>();
    if (createdByIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", createdByIds);

      for (const profile of profiles ?? []) {
        const typedProfile = profile as { id: string; full_name: string | null; email: string | null };
        createdByMap.set(typedProfile.id, typedProfile.full_name ?? typedProfile.email ?? typedProfile.id);
      }
    }

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
      createdBy: createdByMap.get(row.created_by) ?? row.created_by,
      authorizedBy: extractAuthorizedBy(row.observations),
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

  async exportWorkbook(filters: FinanceReportFilters, context: AccessContext): Promise<Buffer> {
    const report = await this.getFinanceReport(filters, context);
    const uniqueCongregations = Array.from(new Set(report.detailRows.map((row) => row.congregationName)));
    const churchHeader = uniqueCongregations.length === 1 ? uniqueCongregations[0] : "Consolidação de Congregações";
    const generatedAt = formatBrasiliaDateTime(new Date().toISOString());

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Ecclesia One";
    workbook.lastModifiedBy = "Ecclesia One";
    workbook.created = new Date();
    workbook.modified = new Date();

    const summarySheet = workbook.addWorksheet("Resumo");
    summarySheet.columns = [
      { header: "Indicador", key: "indicator", width: 34 },
      { header: "Valor", key: "value", width: 22 },
    ];

    summarySheet.addRow(["Relatório financeiro", "Ecclesia One"]);
    summarySheet.addRow(["Igreja", churchHeader]);
    summarySheet.addRow(["Gerado em (Brasília)", generatedAt]);
    summarySheet.addRow(["Período", filters.period ?? "Personalizado"]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total de receitas", report.summary.totalIncome]);
    summarySheet.addRow(["Total de despesas", report.summary.totalExpenses]);
    summarySheet.addRow(["Saldo", report.summary.balance]);
    summarySheet.addRow(["Quantidade de movimentações", report.summary.movementCount]);
    summarySheet.addRow(["Maior receita", report.summary.largestIncome]);
    summarySheet.addRow(["Maior despesa", report.summary.largestExpense]);

    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };

    summarySheet.getRow(6).font = { bold: true };
    for (const rowIndex of [6, 7, 8, 10, 11]) {
      summarySheet.getCell(`B${rowIndex}`).numFmt = '"R$" #,##0.00';
    }

    summarySheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "22364759" } },
          left: { style: "thin", color: { argb: "22364759" } },
          bottom: { style: "thin", color: { argb: "22364759" } },
          right: { style: "thin", color: { argb: "22364759" } },
        };
      });
    });

    const detailsSheet = workbook.addWorksheet("Lançamentos");
    detailsSheet.columns = [
      { header: "Data e hora (Brasília)", key: "dateTime", width: 24 },
      { header: "Congregação", key: "congregation", width: 28 },
      { header: "Evento", key: "event", width: 28 },
      { header: "Tipo de documento", key: "documentType", width: 20 },
      { header: "Tipo", key: "type", width: 14 },
      { header: "Categoria", key: "category", width: 20 },
      { header: "Descrição", key: "description", width: 34 },
      { header: "Entrada", key: "income", width: 16 },
      { header: "Saída", key: "expense", width: 16 },
      { header: "Saldo", key: "balance", width: 16 },
      { header: "Nº referência", key: "referenceNumber", width: 20 },
      { header: "Origem", key: "origin", width: 22 },
      { header: "Referência", key: "reference", width: 26 },
      { header: "Lançado por", key: "createdBy", width: 24 },
      { header: "Autorizado por", key: "authorizedBy", width: 24 },
    ];

    for (const row of report.detailRows) {
      const amount = Number(row.amount ?? 0);
      const income = row.type === "receita" ? amount : 0;
      const expense = row.type === "despesa" ? amount : 0;

      detailsSheet.addRow({
        dateTime: formatBrasiliaDateTime(row.occurredAt),
        congregation: row.congregationName ?? "",
        event: row.eventName ?? "",
        documentType: row.category ?? "",
        type: row.type,
        category: row.category ?? "",
        description: row.type === "despesa" ? (row.description ?? "Despesa sem detalhamento") : (row.description ?? ""),
        income,
        expense,
        balance: income - expense,
        referenceNumber: row.documentReference ?? row.reference ?? "",
        origin: row.origin ?? "",
        reference: row.reference ?? "",
        createdBy: row.createdBy ?? "",
        authorizedBy: row.authorizedBy ?? "",
      });
    }

    const headerRow = detailsSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" },
    };

    detailsSheet.views = [{ state: "frozen", ySplit: 1 }];

    detailsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "22364759" } },
          left: { style: "thin", color: { argb: "22364759" } },
          bottom: { style: "thin", color: { argb: "22364759" } },
          right: { style: "thin", color: { argb: "22364759" } },
        };
      });

      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });

    for (let index = 2; index <= detailsSheet.rowCount; index += 1) {
      detailsSheet.getCell(`H${index}`).numFmt = '"R$" #,##0.00';
      detailsSheet.getCell(`I${index}`).numFmt = '"R$" #,##0.00';
      detailsSheet.getCell(`J${index}`).numFmt = '"R$" #,##0.00';
    }

    const workbookBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(workbookBuffer);
  },
};
