import Link from "next/link";
import { redirect } from "next/navigation";

import { FinanceReportClient } from "@/components/finance-report-client";
import { getAuthContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { hasPublicEnv } from "@/lib/env";

export default async function FinanceReportsPage() {
  if (!hasPublicEnv()) {
    redirect("/login");
  }

  const authContext = await getAuthContext();
  if (!authContext) {
    redirect("/login");
  }

  if (!authContext.congregationId) {
    redirect("/selecionar-congregacao");
  }

  const canReadFinance = hasPermission(authContext.permissions, authContext.roleCodes, "finance.read");
  if (!canReadFinance) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
            <h1 className="text-2xl font-semibold">Acesso restrito</h1>
            <p className="mt-2 text-slate-300">Você não possui permissão para consultar relatórios financeiros.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Ecclesia One</p>
            <h1 className="mt-2 text-3xl font-semibold">Relatórios financeiros</h1>
          </div>
          <Link href="/" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Voltar ao dashboard
          </Link>
        </div>

        <FinanceReportClient />
      </section>
    </main>
  );
}
