import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface DashboardStatsPayload {
  totalMembers: number;
  activeMembers: number;
  musicians: number;
  congregations: number;
  headquarters: number;
  subheadquarters: number;
  localCongregations: number;
  financeIncome: number;
  financeExpenses: number;
  financeBalance: number;
  membersByCongregation: Array<{
    congregationId: string;
    congregationName: string;
    members: number;
    musicians: number;
    kind: "sede" | "subsede" | "congregacao";
  }>;
  modules: {
    gallery: number;
    education: number;
    pastoralCare: number;
    worshipMedia: number;
    discipleship: number;
    financeMovements: number;
  };
}

function resolveCongregationKind(name: string): "sede" | "subsede" | "congregacao" {
  const normalized = name.toLowerCase();
  if (normalized.includes("subsede") || normalized.includes("sub-sede")) return "subsede";
  if (normalized.includes("sede")) return "sede";
  return "congregacao";
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "dashboard", action: "read" });
    if (access.response) {
      return access.response;
    }

    const admin = createAdminSupabaseClient();
    const canSeeAllCongregations = access.context.roleCodes.includes("DEV") || access.context.permissions.includes("system.manage");

    const [
      congregationsResponse,
      membersResponse,
      financesResponse,
      mediaResponse,
      educationResponse,
      prayerResponse,
      schedulesResponse,
      discipleshipResponse,
    ] = await Promise.all([
      admin
        .from("congregations")
        .select("id, name")
        .order("name", { ascending: true }),
      admin
        .from("members")
        .select("id, congregation_id, status, role_label")
        .is("deleted_at", null),
      admin
        .from("finance_transactions")
        .select("id, congregation_id, type, amount")
        .is("deleted_at", null),
      admin
        .from("media_assets")
        .select("id, congregation_id")
        .is("deleted_at", null),
      admin
        .from("events")
        .select("id, congregation_id, category")
        .eq("category", "estudo")
        .is("deleted_at", null),
      admin
        .from("prayer_requests")
        .select("id, congregation_id")
        .is("deleted_at", null),
      admin
        .from("schedules")
        .select("id, congregation_id")
        .eq("status", "pendente"),
      admin
        .from("events")
        .select("id, congregation_id, category")
        .or("category.eq.estudo,category.eq.reuniao")
        .is("deleted_at", null),
    ]);

    const congregationRows = (congregationsResponse.data ?? []) as Array<{ id: string; name: string }>;
    const memberRows = (membersResponse.data ?? []) as Array<{ id: string; congregation_id: string; status: string; role_label: string | null }>;
    const financeRows = (financesResponse.data ?? []) as Array<{ id: string; congregation_id: string; type: string; amount: number }>;
    const mediaRows = (mediaResponse.data ?? []) as Array<{ id: string; congregation_id: string }>;
    const educationRows = (educationResponse.data ?? []) as Array<{ id: string; congregation_id: string }>;
    const prayerRows = (prayerResponse.data ?? []) as Array<{ id: string; congregation_id: string }>;
    const scheduleRows = (schedulesResponse.data ?? []) as Array<{ id: string; congregation_id: string }>;
    const discipleshipRows = (discipleshipResponse.data ?? []) as Array<{ id: string; congregation_id: string }>;

    if (congregationsResponse.error || membersResponse.error || financesResponse.error) {
      throw new Error("Falha ao carregar estatísticas do dashboard");
    }

    const allowedCongregations = canSeeAllCongregations
      ? congregationRows
      : congregationRows.filter((item) => item.id === access.context.congregationId);

    const allowedCongregationIdSet = new Set(allowedCongregations.map((item) => item.id));

    const scopedMembers = memberRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedFinances = financeRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedMedia = mediaRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedEducation = educationRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedPrayer = prayerRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedSchedules = scheduleRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));
    const scopedDiscipleship = discipleshipRows.filter((row) => allowedCongregationIdSet.has(row.congregation_id));

    const membersByCongregation = allowedCongregations.map((congregation) => {
      const members = scopedMembers.filter((member) => member.congregation_id === congregation.id);
      const musicians = members.filter((member) => {
        const role = (member.role_label ?? "").toLowerCase();
        return role.includes("louvor") || role.includes("músic") || role.includes("music");
      }).length;

      return {
        congregationId: congregation.id,
        congregationName: congregation.name,
        members: members.length,
        musicians,
        kind: resolveCongregationKind(congregation.name),
      };
    });

    const financeIncome = scopedFinances
      .filter((row) => row.type === "receita")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const financeExpenses = scopedFinances
      .filter((row) => row.type === "despesa")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const payload: DashboardStatsPayload = {
      totalMembers: scopedMembers.length,
      activeMembers: scopedMembers.filter((member) => member.status === "ativo").length,
      musicians: scopedMembers.filter((member) => {
        const role = (member.role_label ?? "").toLowerCase();
        return role.includes("louvor") || role.includes("músic") || role.includes("music");
      }).length,
      congregations: allowedCongregations.length,
      headquarters: membersByCongregation.filter((item) => item.kind === "sede").length,
      subheadquarters: membersByCongregation.filter((item) => item.kind === "subsede").length,
      localCongregations: membersByCongregation.filter((item) => item.kind === "congregacao").length,
      financeIncome,
      financeExpenses,
      financeBalance: financeIncome - financeExpenses,
      membersByCongregation,
      modules: {
        gallery: scopedMedia.length,
        education: scopedEducation.length,
        pastoralCare: scopedPrayer.length,
        worshipMedia: scopedSchedules.length,
        discipleship: scopedDiscipleship.length,
        financeMovements: scopedFinances.length,
      },
    };

    return jsonSuccess(payload);
  } catch (error) {
    return jsonError(error, "Erro ao montar estatísticas do dashboard");
  }
}
