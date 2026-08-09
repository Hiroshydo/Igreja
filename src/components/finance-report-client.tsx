"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReport() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/finance");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível gerar o relatório");
      }

      const payload = await response.json();
      setReport(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const csvHref = useMemo(() => {
    return "/api/reports/finance/export";
  }, []);

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
                  </tr>
                </thead>
                <tbody>
                  {report.detailRows.map((row) => (
                    <tr key={row.id} className="border-t border-white/10 text-slate-300">
                      <td className="py-3 pr-4">{new Date(row.occurredAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4">{row.congregationName}</td>
                      <td className="py-3 pr-4">{row.type}</td>
                      <td className="py-3 pr-4">{row.category}</td>
                      <td className="py-3 pr-4">{row.description ?? "—"}</td>
                      <td className="py-3 pr-4 font-medium text-slate-100">R$ {Number(row.amount).toLocaleString("pt-BR")}</td>
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
