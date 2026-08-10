import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { financeReportsService } from "@/services/reports.service";

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "finance", action: "read" });
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
    return jsonSuccess(report);
  } catch (error) {
    return jsonError(error, "Erro ao gerar relatório financeiro");
  }
}
