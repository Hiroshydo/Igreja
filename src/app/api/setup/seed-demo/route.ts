import { NextRequest } from "next/server";

import { requireRouteAccess } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function referenceByIndex(index: number) {
  return `2026-08-09-${String(index).padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireRouteAccess({ request, resource: "system", action: "manage" });
    if (access.response) {
      return access.response;
    }

    const admin = createAdminSupabaseClient();

    const congregationsSeed = [
      {
        name: "Assembleia de Deus - Sede",
        code: "ad-sede",
        city: "São Paulo",
        state: "SP",
        legal_name: "Assembleia de Deus - Sede Central",
        phone: "(11) 3000-1000",
        email: "sede@assembleia.local",
      },
      {
        name: "Assembleia de Deus - Subsede Norte",
        code: "ad-subsede-norte",
        city: "São Paulo",
        state: "SP",
        legal_name: "Assembleia de Deus - Subsede Norte",
        phone: "(11) 3000-1001",
        email: "norte@assembleia.local",
      },
      {
        name: "Assembleia de Deus - Subsede Sul",
        code: "ad-subsede-sul",
        city: "São Paulo",
        state: "SP",
        legal_name: "Assembleia de Deus - Subsede Sul",
        phone: "(11) 3000-1002",
        email: "sul@assembleia.local",
      },
      {
        name: "Congregação Vila Esperança",
        code: "ad-vila-esperanca",
        city: "Osasco",
        state: "SP",
        legal_name: "Assembleia de Deus - Congregação Vila Esperança",
        phone: "(11) 3000-1003",
        email: "vila.esperanca@assembleia.local",
      },
      {
        name: "Congregação Jardim da Paz",
        code: "ad-jardim-da-paz",
        city: "Guarulhos",
        state: "SP",
        legal_name: "Assembleia de Deus - Congregação Jardim da Paz",
        phone: "(11) 3000-1004",
        email: "jardim.paz@assembleia.local",
      },
    ];

    const { data: upsertedCongregations, error: congregationError } = await admin
      .from("congregations")
      .upsert(congregationsSeed, { onConflict: "code" })
      .select("id, name, code")
      .order("name", { ascending: true });

    if (congregationError || !upsertedCongregations) {
      throw new Error("Não foi possível cadastrar congregações de demonstração");
    }

    const congregationByCode = new Map(
      upsertedCongregations.map((item) => [
        (item as { code: string }).code,
        item as { id: string; name: string; code: string },
      ])
    );

    const membersSeed = [
      { name: "Daniel Rocha", role: "Pastor", congregationCode: "ad-sede", email: "daniel.rocha@demo.ecclesia" },
      { name: "Mariana Souza", role: "Músico - Louvor", congregationCode: "ad-sede", email: "mariana.souza@demo.ecclesia" },
      { name: "Lucas Nascimento", role: "Músico - Teclado", congregationCode: "ad-sede", email: "lucas.nascimento@demo.ecclesia" },
      { name: "Fernanda Lima", role: "Membro", congregationCode: "ad-sede", email: "fernanda.lima@demo.ecclesia" },
      { name: "Paulo Mendes", role: "Pastor", congregationCode: "ad-subsede-norte", email: "paulo.mendes@demo.ecclesia" },
      { name: "Aline Costa", role: "Músico - Voz", congregationCode: "ad-subsede-norte", email: "aline.costa@demo.ecclesia" },
      { name: "João Pedro Alves", role: "Membro", congregationCode: "ad-subsede-norte", email: "joao.alves@demo.ecclesia" },
      { name: "Renata Campos", role: "Pastora", congregationCode: "ad-subsede-sul", email: "renata.campos@demo.ecclesia" },
      { name: "Rafael Duarte", role: "Músico - Bateria", congregationCode: "ad-subsede-sul", email: "rafael.duarte@demo.ecclesia" },
      { name: "Silvia Ramos", role: "Membro", congregationCode: "ad-subsede-sul", email: "silvia.ramos@demo.ecclesia" },
      { name: "Mateus Oliveira", role: "Líder de discipulado", congregationCode: "ad-vila-esperanca", email: "mateus.oliveira@demo.ecclesia" },
      { name: "Bruna Freitas", role: "Membro", congregationCode: "ad-vila-esperanca", email: "bruna.freitas@demo.ecclesia" },
      { name: "Thiago Martins", role: "Músico - Violão", congregationCode: "ad-jardim-da-paz", email: "thiago.martins@demo.ecclesia" },
      { name: "Camila Rezende", role: "Membro", congregationCode: "ad-jardim-da-paz", email: "camila.rezende@demo.ecclesia" },
    ];

    const demoEmails = membersSeed.map((item) => item.email);
    await admin.from("members").delete().in("email", demoEmails);

    const membersInsertPayload: Array<{
      congregation_id: string;
      full_name: string;
      email: string;
      phone: string;
      join_date: string;
      status: "ativo";
      role_label: string;
      created_by: string;
      updated_by: string;
    }> = [];

    for (const item of membersSeed) {
      const congregation = congregationByCode.get(item.congregationCode);
      if (!congregation) continue;
      membersInsertPayload.push({
        congregation_id: congregation.id,
        full_name: item.name,
        email: item.email,
        phone: "(11) 98888-0000",
        join_date: "2026-08-09",
        status: "ativo",
        role_label: item.role,
        created_by: access.context.userId,
        updated_by: access.context.userId,
      });
    }

    const { error: memberInsertError } = await admin.from("members").insert(membersInsertPayload);
    if (memberInsertError) {
      throw new Error("Não foi possível cadastrar membros de demonstração");
    }

    const ministriesSeed = [
      { congregationCode: "ad-sede", name: "Ministério de Louvor - Sede", members: 18, category: "Louvor" },
      { congregationCode: "ad-subsede-norte", name: "Ministério de Louvor - Norte", members: 10, category: "Louvor" },
      { congregationCode: "ad-subsede-sul", name: "Ministério de Louvor - Sul", members: 11, category: "Louvor" },
      { congregationCode: "ad-vila-esperanca", name: "Escola Bíblica Vila Esperança", members: 24, category: "EBD" },
      { congregationCode: "ad-jardim-da-paz", name: "Discipulado Jardim da Paz", members: 19, category: "Discipulado" },
    ];

    const ministryNames = ministriesSeed.map((item) => item.name);
    await admin.from("ministries").delete().in("name", ministryNames);

    const ministriesInsertPayload: Array<{
      congregation_id: string;
      name: string;
      description: string;
      category: string;
      leader_name: string;
      member_count: number;
      meeting_day: string;
      meeting_time: string;
      created_by: string;
      updated_by: string;
    }> = [];

    for (const item of ministriesSeed) {
      const congregation = congregationByCode.get(item.congregationCode);
      if (!congregation) continue;
      ministriesInsertPayload.push({
        congregation_id: congregation.id,
        name: item.name,
        description: `Cadastro completo de ${item.category}`,
        category: item.category,
        leader_name: "Equipe local",
        member_count: item.members,
        meeting_day: "Quarta",
        meeting_time: "19:30",
        created_by: access.context.userId,
        updated_by: access.context.userId,
      });
    }

    const { error: ministryInsertError } = await admin.from("ministries").insert(ministriesInsertPayload);
    if (ministryInsertError) {
      throw new Error("Não foi possível cadastrar ministérios de demonstração");
    }

    const seedChurch = congregationByCode.get("ad-sede");
    if (!seedChurch) {
      throw new Error("Congregação sede não encontrada");
    }

    const { data: accountRow, error: accountError } = await admin
      .from("finance_accounts")
      .upsert(
        {
          congregation_id: seedChurch.id,
          name: "Caixa principal",
          category: "caixa",
          is_active: true,
          created_by: access.context.userId,
          updated_by: access.context.userId,
        },
        { onConflict: "congregation_id,name" }
      )
      .select("id")
      .single();

    if (accountError || !accountRow?.id) {
      throw new Error("Não foi possível preparar conta financeira da demonstração");
    }

    await admin
      .from("finance_transactions")
      .delete()
      .eq("congregation_id", seedChurch.id)
      .eq("origin", "Carga demo Supabase 2026");

    const financeEntries: Array<{ type: "receita" | "despesa"; category: string; amount: number; description: string }> = [
      { type: "receita", category: "Dízimo", amount: 5236.0, description: "Entrada de dízimos" },
      { type: "receita", category: "Doação", amount: 1234.0, description: "Entrada de doações" },
      { type: "receita", category: "Oferta", amount: 980.0, description: "Oferta de culto" },
      { type: "despesa", category: "Despesa", amount: 389.5, description: "Água" },
      { type: "despesa", category: "Despesa", amount: 742.9, description: "Luz" },
      { type: "despesa", category: "Despesa", amount: 418.75, description: "Telefone e internet" },
      { type: "despesa", category: "Despesa", amount: 520.0, description: "Segurança" },
      { type: "despesa", category: "Despesa", amount: 347.2, description: "Gasolina" },
      { type: "despesa", category: "Despesa", amount: 468.4, description: "Comida" },
      { type: "despesa", category: "Despesa", amount: 612.85, description: "Viagem" },
    ];

    const financeInsertPayload = financeEntries.map((entry, index) => {
      const reference = referenceByIndex(index + 1);
      return {
        congregation_id: seedChurch.id,
        account_id: accountRow.id,
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        occurred_at: `2026-08-09T${String(9 + (index % 10)).padStart(2, "0")}:30:00-03:00`,
        description: entry.description,
        origin: "Carga demo Supabase 2026",
        reference,
        document_reference: reference,
        observations: "Autorizado por: Pr. Daniel Rocha | Senha validada no seed",
        created_by: access.context.userId,
        updated_by: access.context.userId,
      };
    });

    const { error: financeInsertError } = await admin.from("finance_transactions").insert(financeInsertPayload);
    if (financeInsertError) {
      throw new Error("Não foi possível cadastrar movimentações financeiras da demonstração");
    }

    await admin
      .from("announcements")
      .delete()
      .eq("congregation_id", seedChurch.id)
      .in("title", ["Letra | Graça Sublime", "Letra | Bondade de Deus", "Letra | Te Agradeço"]);

    const lyricsRows = [
      {
        congregation_id: seedChurch.id,
        title: "Letra | Graça Sublime",
        body: "Graça sublime, quão doce som, que salvou um pecador como eu...",
        visibility: "members",
        created_by: access.context.userId,
        updated_by: access.context.userId,
      },
      {
        congregation_id: seedChurch.id,
        title: "Letra | Bondade de Deus",
        body: "Tua bondade me seguirá todos os dias da minha vida...",
        visibility: "members",
        created_by: access.context.userId,
        updated_by: access.context.userId,
      },
      {
        congregation_id: seedChurch.id,
        title: "Letra | Te Agradeço",
        body: "Te agradeço, ó Deus, por tudo que tens feito por nós...",
        visibility: "members",
        created_by: access.context.userId,
        updated_by: access.context.userId,
      },
    ];

    const { error: lyricsError } = await admin.from("announcements").insert(lyricsRows as any);
    if (lyricsError) {
      throw new Error("Não foi possível cadastrar letras de demonstração");
    }

    return jsonSuccess(
      {
        congregations: upsertedCongregations.length,
        members: membersInsertPayload.length,
        ministries: ministriesInsertPayload.length,
        financeMovements: financeInsertPayload.length,
        lyrics: lyricsRows.length,
      },
      { message: "Carga completa de demonstração aplicada com sucesso" }
    );
  } catch (error) {
    return jsonError(error, "Erro ao aplicar carga de demonstração");
  }
}
