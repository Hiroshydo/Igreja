import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    const supabase = await createServerSupabaseClient();
    const congregationId = access.context.congregationId;

    if (!congregationId) {
      throw new Error("Congregação ativa ausente para o dashboard");
    }

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
      supabase
        .from("congregations")
        .select("id, name")
        .eq("id", congregationId)
        .order("name", { ascending: true }),
      supabase
        .from("members")
        .select("id, congregation_id, status, role_label")
        .eq("congregation_id", congregationId)
        .is("deleted_at", null),
      supabase
        .from("finance_transactions")
        .select("id, congregation_id, type, amount")
        .eq("congregation_id", congregationId)
        .is("deleted_at", null),
      supabase
        .from("media_assets")
        .select("id, congregation_id")
        .eq("congregation_id", congregationId),
      supabase
        .from("events")
        .select("id, congregation_id, category")
        .eq("congregation_id", congregationId)
        .eq("category", "estudo")
        .is("deleted_at", null),
      supabase
        .from("prayer_requests")
        .select("id, congregation_id")
        .eq("congregation_id", congregationId)
        .is("deleted_at", null),
      supabase
        .from("schedules")
        .select("id, congregation_id")
        .eq("congregation_id", congregationId)
        .eq("status", "pendente"),
      supabase
        .from("events")
        .select("id, congregation_id, category")
        .eq("congregation_id", congregationId)
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

    const allowedCongregations = congregationRows;

    const scopedMembers = memberRows;
    const scopedFinances = financeRows;
    const scopedMedia = mediaRows;
    const scopedEducation = educationRows;
    const scopedPrayer = prayerRows;
    const scopedSchedules = scheduleRows;
    const scopedDiscipleship = discipleshipRows;

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
