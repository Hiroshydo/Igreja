import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
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
      congregationId: searchParams.get("congregationId") ?? undefined,
      eventId: searchParams.get("eventId") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      type: (searchParams.get("type") as "receita" | "despesa" | undefined) ?? undefined,
      kind: (searchParams.get("kind") as "entry" | "exit" | "expense" | undefined) ?? undefined,
    };

    const csv = await financeReportsService.exportCsv(filters, access.context);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=finance-report.csv",
      },
    });
  } catch (error) {
    return jsonError(error, "Erro ao exportar relatório financeiro");
  }
}
