"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Calculator,
  FileSpreadsheet,
  History,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

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

interface CashClosureRecord {
  id: string;
  kind: "fechamento" | "planilha";
  occurredAt: string;
  openingBalance: number;
  closingBalance: number;
  receipts: number;
  expenses: number;
  movements: number;
  notes: string;
  workbookName?: string;
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
  const [openingBalance, setOpeningBalance] = useState("0");
  const [cashHistory, setCashHistory] = useState<CashClosureRecord[]>([]);
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

  const currency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedHistory = window.localStorage.getItem("ecclesia-finance-cash-history");
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory) as CashClosureRecord[];
        setCashHistory(parsed);
      } catch {
        window.localStorage.removeItem("ecclesia-finance-cash-history");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("ecclesia-finance-cash-history", JSON.stringify(cashHistory));
  }, [cashHistory]);

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

  const workbookHref = "/api/reports/finance/export";

  const financeSummary = useMemo(() => {
    const income = movements.filter((item) => item.type === "receita").reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const expenses = movements.filter((item) => item.type === "despesa").reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const balance = income - expenses;
    const average = movements.length > 0 ? balance / movements.length : 0;

    return {
      income,
      expenses,
      balance,
      average,
      movements: movements.length,
    };
  }, [movements]);

  const projectedClosing = useMemo(() => {
    const openingValue = Number(String(openingBalance).replace(/[^0-9,.-]/g, "")) || 0;
    return openingValue + financeSummary.balance;
  }, [financeSummary.balance, openingBalance]);

  const financeHighlights = useMemo(() => {
    const expenses = report?.summary.totalExpenses ?? financeSummary.expenses;
    const income = report?.summary.totalIncome ?? financeSummary.income;
    const balance = report?.summary.balance ?? financeSummary.balance;
    const topCategory = report?.categoryReport?.reduce((current, item) => (item.total > current.total ? item : current), report.categoryReport[0] ?? { category: "—", total: 0, count: 0, percentage: 0 });
    const efficiency = income > 0 ? Math.round((balance / income) * 100) : 0;
    const goalProgress = Math.min(100, Math.round((Math.max(0, balance) / 50000) * 100));

    return {
      expenses,
      income,
      balance,
      topCategory: topCategory?.category ?? "—",
      topCategoryValue: topCategory?.total ?? 0,
      efficiency: Math.max(0, Math.min(100, efficiency)),
      goalProgress,
    };
  }, [financeSummary.balance, financeSummary.expenses, financeSummary.income, report]);

  const weekFlow = useMemo(() => {
    const sourceRows = movements.length > 0 ? movements : report?.detailRows ?? [];
    const lastDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    });

    return lastDays.map((day) => {
      const total = sourceRows.reduce((sum, row) => {
        const rowDay = row.occurredAt?.slice(0, 10);
        if (rowDay !== day) {
          return sum;
        }
        return sum + Number(row.amount ?? 0) * (row.type === "despesa" ? -1 : 1);
      }, 0);

      return {
        day: day.slice(5),
        total: Math.max(0, total),
      };
    });
  }, [movements, report]);

  function handleGenerateWorkbook() {
    const workbookName = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const link = document.createElement("a");
    link.href = workbookHref;
    link.download = workbookName;
    link.click();

    const newRecord: CashClosureRecord = {
      id: `planilha-${Date.now()}`,
      kind: "planilha",
      occurredAt: new Date().toISOString(),
      openingBalance: Number(String(openingBalance).replace(/[^0-9,.-]/g, "")) || 0,
      closingBalance: projectedClosing,
      receipts: financeSummary.income,
      expenses: financeSummary.expenses,
      movements: financeSummary.movements,
      notes: "Planilha em Excel gerada e pronta para documentação financeira.",
      workbookName,
    };

    setCashHistory((prev) => [newRecord, ...prev].slice(0, 8));
      setClosingMessage("Planilha profissional gerada com sucesso. O arquivo foi preparado para download.");
  }

  function handleCloseCash() {
    if (closingPassword.trim() !== "pastor2026") {
      setClosingMessage("Senha incorreta. Solicite o acesso correto ao pastor.");
      return;
    }

    const newRecord: CashClosureRecord = {
      id: `fechamento-${Date.now()}`,
      kind: "fechamento",
      occurredAt: new Date().toISOString(),
      openingBalance: Number(String(openingBalance).replace(/[^0-9,.-]/g, "")) || 0,
      closingBalance: projectedClosing,
      receipts: financeSummary.income,
      expenses: financeSummary.expenses,
      movements: financeSummary.movements,
      notes: "Fechamento de caixa aprovado pelo pastor com saldo consolidado.",
    };

    setCashHistory((prev) => [newRecord, ...prev].slice(0, 8));
    setClosingPassword("");
    setClosingMessage("Caixa fechado com sucesso. O histórico foi atualizado.");
  }

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
          <p className="text-sm text-slate-400">Resumo operacional e movimentações financeiras.</p>
        </div>
        <div className="flex gap-3">
          <a
            href={workbookHref}
            className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
          >
            Exportar planilha
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
            <p className="text-sm text-slate-400">Informe o dia, o valor, o tipo e a categoria para registrar entradas e saídas.</p>
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
              <button type="button" onClick={handleCloseCash} className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950">
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
          <button type="button" onClick={() => handleGenerateWorkbook()} className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            Abrir planilha
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
          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.92))] p-5 shadow-[0_20px_60px_-25px_rgba(16,185,129,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Gestão financeira premium
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-50">Visão executiva do tesouraria e do fluxo de caixa</h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Indicadores estratégicos, metas operacionais e ações rápidas para decisões mais seguras.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <span className="text-slate-500">Saldo projetado:</span> <span className="ml-2 font-semibold text-white">{currency(projectedClosing)}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Receitas", value: currency(financeHighlights.income), icon: ArrowUpRight, tone: "emerald" },
                    { label: "Despesas", value: currency(financeHighlights.expenses), icon: ArrowDownLeft, tone: "rose" },
                    { label: "Saldo líquido", value: currency(financeHighlights.balance), icon: Wallet, tone: "amber" },
                    { label: "Movimentações", value: `${report.summary.movementCount}`, icon: ReceiptText, tone: "cyan" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const toneClasses = item.tone === "emerald" ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100" : item.tone === "rose" ? "border-rose-300/20 bg-rose-500/10 text-rose-100" : item.tone === "amber" ? "border-amber-300/20 bg-amber-500/10 text-amber-100" : "border-cyan-300/20 bg-cyan-500/10 text-cyan-100";

                    return (
                      <article key={item.label} className={`rounded-2xl border p-4 ${toneClasses}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">{item.label}</p>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Resumo estratégico</p>
                      <p className="text-sm text-slate-400">Foco operacional e saúde do fluxo do mês.</p>
                    </div>
                    <div className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                      {financeHighlights.efficiency}% de eficiência
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Maior categoria</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{financeHighlights.topCategory}</p>
                      <p className="mt-1 text-xs text-slate-400">{currency(financeHighlights.topCategoryValue)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Meta de fechamento</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">R$ 50.000</p>
                      <p className="mt-1 text-xs text-slate-400">{financeHighlights.goalProgress}% da meta</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Média por movimento</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{currency(financeSummary.average)}</p>
                      <p className="mt-1 text-xs text-slate-400">Indicador diário</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400" style={{ width: `${financeHighlights.goalProgress}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <BarChart3 className="h-4 w-4" />
                    Fluxo da semana
                  </div>
                  <div className="mt-4 flex h-36 items-end gap-2">
                    {weekFlow.map((item) => (
                      <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-24 w-full items-end rounded-xl bg-slate-950/60 p-1">
                          <div className="w-full rounded-lg bg-gradient-to-t from-emerald-500 via-amber-400 to-cyan-400" style={{ height: `${Math.max(12, Math.min(100, item.total / 180))}%` }} />
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Calculator className="h-4 w-4" />
                    Ações profissionais
                  </div>
                  <div className="mt-3 space-y-2">
                    <button type="button" onClick={() => handleGenerateWorkbook()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100">
                      <FileSpreadsheet className="h-4 w-4" />
                      Gerar planilha CSV
                    </button>
                    <button type="button" onClick={() => setClosingMessage("Informe a senha do pastor para fechar o caixa.")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100">
                      <ShieldCheck className="h-4 w-4" />
                      Solicitar fechamento
                    </button>
                    <button type="button" onClick={() => setOpeningBalance("0") } className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200">
                      <History className="h-4 w-4" />
                      Reiniciar saldo inicial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Operações de caixa</h3>
                <p className="mt-1 text-sm text-slate-400">Saldo inicial, projeção de fechamento e abertura de planilha em um painel mais profissional.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <span className="text-slate-500">Saldo projetado:</span> <span className="ml-2 font-semibold text-white">{currency(projectedClosing)}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">Saldo inicial</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currency(Number(String(openingBalance).replace(/[^0-9,.-]/g, "") || 0))}</p>
                  </div>
                  <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200">Soma líquida</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currency(financeSummary.balance)}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200">Média por movimento</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currency(financeSummary.average)}</p>
                  </div>
                </div>
                <label className="mt-4 block text-sm text-slate-300">
                  <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Saldo inicial do caixa</span>
                  <input type="text" inputMode="decimal" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value.replace(/[^0-9,.-]/g, ""))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="0,00" />
                </label>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Novas possibilidades</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                    <Banknote className="h-4 w-4 text-amber-200" />
                    Acompanhamento premium para entradas e saídas.
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    Fluxo visual com metas e projeções para o próximo fechamento.
                  </div>
                </div>
              </div>
            </div>
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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Histórico de fechamento e planilhas</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">Últimos registros</span>
            </div>
            <div className="mt-4 space-y-3">
              {cashHistory.length > 0 ? cashHistory.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{entry.kind === "fechamento" ? "Fechamento de caixa" : "Planilha aberta"}</p>
                      <p className="text-xs text-slate-400">{new Date(entry.occurredAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${entry.kind === "fechamento" ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100" : "border border-cyan-300/30 bg-cyan-500/10 text-cyan-100"}`}>
                      {entry.kind === "fechamento" ? "Fechado" : "Planilha"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">Saldo inicial: R$ {entry.openingBalance.toLocaleString("pt-BR")}</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">Saldo final: R$ {entry.closingBalance.toLocaleString("pt-BR")}</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">{entry.movements} movimentos</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{entry.notes}</p>
                  {entry.workbookName ? <p className="mt-2 text-xs text-cyan-200">Arquivo: {entry.workbookName}</p> : null}
                </div>
              )) : <p className="text-sm text-slate-400">Ainda não há histórico de fechamento ou abertura de planilhas.</p>}
            </div>
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
