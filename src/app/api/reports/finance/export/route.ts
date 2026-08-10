import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { writeAuditLog } from "@/services/audit.service";
import { financeReportsService } from "@/services/reports.service";

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "export" });
    if (access.response) {
      return access.response;
    }

    const { searchParams } = new URL(request.url);

    const filters = {
      period: searchParams.get("period") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      eventId: searchParams.get("eventId") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      type: (searchParams.get("type") as "receita" | "despesa" | undefined) ?? undefined,
      kind: (searchParams.get("kind") as "entry" | "exit" | "expense" | undefined) ?? undefined,
    };

    const report = await financeReportsService.getFinanceReport(filters, access.context);
    const workbook = await financeReportsService.exportWorkbook(filters, access.context);

    await writeAuditLog({
      request,
      context: access.context,
      action: "finance_export",
      entityName: "finance_reports",
      afterData: {
        period: filters.period ?? null,
        startDate: filters.startDate ?? null,
        endDate: filters.endDate ?? null,
        type: filters.type ?? null,
        category: filters.category ?? null,
        eventId: filters.eventId ?? null,
        movementCount: report.summary.movementCount,
      },
    });

    return new Response(new Uint8Array(workbook), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=relatorio-financeiro.xlsx",
      },
    });
  } catch (error) {
    return jsonError(error, "Erro ao exportar relatório financeiro");
  }
}
