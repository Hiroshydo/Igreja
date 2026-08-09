"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

interface FinanceMovementItem {
  id: string;
  occurredAt: string;
  congregationId: string;
  congregationName: string;
  type: "receita" | "despesa";
  category: string;
  description?: string | null;
  amount: number;
  origin?: string | null;
  reference?: string | null;
  documentReference?: string | null;
  observations?: string | null;
}

interface CongregationOption {
  id: string;
  name: string;
}

interface FinanceReportPayload {
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
    type: "receita" | "despesa";
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

export function FinanceReportClient() {
  const [report, setReport] = useState<FinanceReportPayload | null>(null);
  const [movements, setMovements] = useState<FinanceMovementItem[]>([]);
  const [congregations, setCongregations] = useState<CongregationOption[]>([]);
  const [draftPreview, setDraftPreview] = useState<{ label: string; value: number }[]>([]);
  const [closingPassword, setClosingPassword] = useState("");
  const [closingMessage, setClosingMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    occurredAt: new Date().toISOString().slice(0, 10),
    type: "receita" as "receita" | "despesa",
    category: "Oferta",
    description: "",
    amount: "",
    origin: "",
    congregationId: "",
    reference: "",
    documentReference: "",
    observations: "",
    attachmentUrl: "",
    attachmentName: "",
  });

  async function loadReport() {
    setLoading(true);
    setError(null);

    try {
      const [reportResponse, movementResponse, congregationsResponse] = await Promise.all([
        fetch("/api/reports/finance"),
        fetch("/api/finance"),
        fetch("/api/congregations"),
      ]);

      if (!reportResponse.ok) {
        const body = await reportResponse.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível gerar o relatório");
      }

      const reportPayload = await reportResponse.json();
      setReport(reportPayload.data);

      if (movementResponse.ok) {
        const movementPayload = await movementResponse.json();
        const nextMovements = Array.isArray(movementPayload.data)
          ? movementPayload.data.map((row: any) => ({
              id: row.id,
              occurredAt: row.occurred_at ?? row.occurredAt,
              congregationId: row.congregation_id ?? row.congregationId,
              congregationName: row.congregationName ?? "Congregação",
              type: row.type,
              category: row.category,
              description: row.description,
              amount: Number(row.amount ?? 0),
              origin: row.origin,
              reference: row.reference,
              documentReference: row.document_reference ?? row.documentReference,
              observations: row.observations,
            }))
          : [];
        setMovements(nextMovements);
      }

      if (congregationsResponse.ok) {
        const congregationPayload = await congregationsResponse.json();
        const nextCongregations = Array.isArray(congregationPayload.data)
          ? congregationPayload.data.map((row: any) => ({ id: row.id, name: row.name }))
          : [];
        setCongregations(nextCongregations);
        setForm((prev) => ({
          ...prev,
          congregationId: prev.congregationId || nextCongregations[0]?.id || "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  function handleAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({
        ...prev,
        attachmentUrl: result,
        attachmentName: file.name,
        documentReference: prev.documentReference || file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.description.trim() || !form.amount) {
      setError("Informe a descrição, valor e categoria para lançar a movimentação.");
      return;
    }

    const normalizedAmount = Number(String(form.amount).replace(",", "."));
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError("Informe um valor válido para a movimentação.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        occurredAt: form.occurredAt,
        congregationId: form.congregationId || undefined,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: normalizedAmount,
        origin: form.origin || "Painel administrativo",
        reference: form.reference || undefined,
        documentReference: form.documentReference || undefined,
        observations: form.observations || undefined,
      };

      const response = editingId
        ? await fetch(`/api/finance/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/finance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível salvar a movimentação");
      }

      setForm({
        occurredAt: new Date().toISOString().slice(0, 10),
        type: "receita",
        category: "Oferta",
        description: "",
        amount: "",
        origin: "",
        congregationId: form.congregationId || congregations[0]?.id || "",
        reference: "",
        documentReference: "",
        observations: "",
        attachmentUrl: "",
        attachmentName: "",
      });
      setEditingId(null);
      await loadReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar movimentação");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja excluir esta movimentação?")) {
      return;
    }

    try {
      const response = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível excluir a movimentação");
      }
      await loadReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir movimentação");
    }
  }

  function handleEdit(entry: FinanceMovementItem) {
    setEditingId(entry.id);
    setForm({
      occurredAt: entry.occurredAt.slice(0, 10),
      type: entry.type,
      category: entry.category,
      description: entry.description ?? "",
      amount: String(entry.amount),
      origin: entry.origin ?? "",
      congregationId: entry.congregationId || "",
      reference: entry.reference ?? "",
      documentReference: entry.documentReference ?? "",
      observations: entry.observations ?? "",
      attachmentUrl: "",
      attachmentName: "",
    });
  }

  const csvHref = useMemo(() => {
    return "/api/reports/finance/export";
  }, []);

  useEffect(() => {
    if (!form.amount) {
      setDraftPreview([]);
      return;
    }

    const amount = Number(String(form.amount).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setDraftPreview([]);
      return;
    }

    const preview = [
      { label: "Lançamento", value: amount },
      { label: form.type === "receita" ? "Saldo esperado" : "Saída prevista", value: form.type === "receita" ? amount : amount * -1 },
    ];
    setDraftPreview(preview);
  }, [form.amount, form.type]);

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Carregando relatório financeiro...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Relatório financeiro</h2>
          <p className="text-sm text-slate-400">Resumo operacional e movimentações</p>
        </div>
        <div className="flex gap-3">
          <a
            href={csvHref}
            className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
          >
            Exportar CSV
          </a>
          <button
            type="button"
            onClick={() => void loadReport()}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Recarregar
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Lançar movimentação</h3>
            <p className="text-sm text-slate-400">Informe o dia, valor, tipo e categoria para registrar entradas e saídas.</p>
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            {editingId ? "Editando" : "Novo lançamento"}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Dia</span>
            <input type="date" value={form.occurredAt} onChange={(event) => setForm((prev) => ({ ...prev, occurredAt: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Congregação</span>
            <select value={form.congregationId} onChange={(event) => setForm((prev) => ({ ...prev, congregationId: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100">
              {congregations.map((congregation) => (
                <option key={congregation.id} value={congregation.id}>{congregation.name}</option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {congregations.map((congregation) => (
                <button key={congregation.id} type="button" onClick={() => setForm((prev) => ({ ...prev, congregationId: congregation.id }))} className={`rounded-full border px-2.5 py-1 text-xs ${form.congregationId === congregation.id ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                  {congregation.name}
                </button>
              ))}
            </div>
          </label>
          <label className="text-sm text-slate-300 md:col-span-2 xl:col-span-1">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Tipo</span>
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
              {([
                { value: "receita", label: "Receita", accent: "bg-emerald-400/20 text-emerald-100" },
                { value: "despesa", label: "Despesa", accent: "bg-rose-400/20 text-rose-100" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: option.value as "receita" | "despesa" }))}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${form.type === option.value ? option.accent : "text-slate-300 hover:bg-white/10"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Categoria</span>
            <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Oferta, despesas, etc." />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Valor</span>
            <input type="text" inputMode="decimal" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value.replace(/[^0-9,.-]/g, "") }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0,00" />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2 xl:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Descrição</span>
            <input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Ex: Oferta do domingo ou compra de material" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Referência</span>
            <input value={form.reference} onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Ex: pedido 101" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Comprovante / imagem</span>
            <input type="file" accept="image/*" onChange={handleAttachmentUpload} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" />
            <p className="mt-2 text-xs text-slate-400">{form.attachmentName ? `Anexo: ${form.attachmentName}` : "Envie uma imagem do comprovante ou recibo."}</p>
            {form.attachmentUrl ? <img src={form.attachmentUrl} alt="Pré-visualização do comprovante" className="mt-3 h-24 w-full rounded-xl object-cover" /> : null}
          </label>
          <label className="text-sm text-slate-300 md:col-span-2 xl:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Origem / observações</span>
            <input value={form.origin} onChange={(event) => setForm((prev) => ({ ...prev, origin: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Ex: Tesouraria, culto, viagem" />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2 xl:col-span-4">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Observações</span>
            <textarea value={form.observations} onChange={(event) => setForm((prev) => ({ ...prev, observations: event.target.value }))} className="min-h-24 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Detalhes adicionais do lançamento" />
          </label>
        </div>
        {closingMessage ? (
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3">
            <p className="text-sm font-semibold text-amber-100">{closingMessage}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input type="password" value={closingPassword} onChange={(event) => setClosingPassword(event.target.value)} className="w-full max-w-sm rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Senha do pastor" />
              <button type="button" onClick={() => {
                if (closingPassword.trim() === "pastor2026") {
                  setClosingMessage("Caixa fechado com sucesso. O fluxo foi aprovado pelo pastor.");
                  setClosingPassword("");
                } else {
                  setClosingMessage("Senha incorreta. Solicite o acesso correto ao pastor.");
                }
              }} className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950">
                Confirmar fechamento
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200 disabled:opacity-60">
            {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Lançar valor"}
          </button>
          <button type="button" onClick={() => {
            setClosingMessage("Informe a senha do pastor para fechar o caixa.");
          }} className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100">
            Fechar caixa
          </button>
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm({ occurredAt: new Date().toISOString().slice(0, 10), type: "receita", category: "Oferta", description: "", amount: "", origin: "", congregationId: form.congregationId || congregations[0]?.id || "", reference: "", documentReference: "", observations: "", attachmentUrl: "", attachmentName: "" });
          }} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Limpar
          </button>
        </div>
      </section>

      {draftPreview.length > 0 ? (
        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Pré-visualização</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {draftPreview.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">R$ {item.value.toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {report ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <article className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-200">Receitas</div>
              <div className="mt-2 text-2xl font-semibold text-white">R$ {report.summary.totalIncome.toLocaleString("pt-BR")}</div>
            </article>
            <article className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-rose-200">Despesas</div>
              <div className="mt-2 text-2xl font-semibold text-white">R$ {report.summary.totalExpenses.toLocaleString("pt-BR")}</div>
            </article>
            <article className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Movimentações</div>
              <div className="mt-2 text-2xl font-semibold text-white">{report.summary.movementCount}</div>
            </article>
            <article className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Saldo</div>
              <div className="mt-2 text-2xl font-semibold text-white">R$ {report.summary.balance.toLocaleString("pt-BR")}</div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Por categoria</h3>
              <div className="mt-4 space-y-3">
                {report.categoryReport.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{category.category}</span>
                      <span className="text-slate-100">R$ {category.total.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-amber-300" style={{ width: `${Math.max(4, category.percentage)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Por congregação</h3>
              <div className="mt-4 space-y-3">
                {report.congregationReport.map((row) => (
                  <div key={row.congregationId} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                    <span className="text-slate-300">{row.congregationName}</span>
                    <span className="text-slate-100">{row.count} mov.</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Detalhes</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-3 pr-4">Data</th>
                    <th className="pb-3 pr-4">Congregação</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Categoria</th>
                    <th className="pb-3 pr-4">Descrição</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length > 0 ? movements.map((row) => (
                    <tr key={row.id} className="border-t border-white/10 text-slate-300">
                      <td className="py-3 pr-4">{new Date(row.occurredAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4">{row.congregationName}</td>
                      <td className="py-3 pr-4">{row.type}</td>
                      <td className="py-3 pr-4">{row.category}</td>
                      <td className="py-3 pr-4">{row.description ?? "—"}</td>
                      <td className="py-3 pr-4 font-medium text-slate-100">R$ {Number(row.amount).toLocaleString("pt-BR")}</td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(row)} className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10">Editar</button>
                          <button type="button" onClick={() => void handleDelete(row.id)} className="rounded-lg border border-rose-300/40 px-2 py-1 text-xs text-rose-100 hover:bg-rose-300/10">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  )) : report.detailRows.map((row) => (
                    <tr key={row.id} className="border-t border-white/10 text-slate-300">
                      <td className="py-3 pr-4">{new Date(row.occurredAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4">{row.congregationName}</td>
                      <td className="py-3 pr-4">{row.type}</td>
                      <td className="py-3 pr-4">{row.category}</td>
                      <td className="py-3 pr-4">{row.description ?? "—"}</td>
                      <td className="py-3 pr-4 font-medium text-slate-100">R$ {Number(row.amount).toLocaleString("pt-BR")}</td>
                      <td className="py-3 pr-4">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
