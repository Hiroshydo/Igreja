import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/session";
import { hasPublicEnv } from "@/lib/env";

export default async function PermissionsSettingsPage() {
  if (!hasPublicEnv()) {
    redirect("/login");
  }

  const authContext = await getAuthContext();
  if (!authContext) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Ecclesia One</p>
            <h1 className="mt-2 text-3xl font-semibold">Configurações de permissões</h1>
          </div>
          <Link href="/" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Voltar ao dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Matriz de permissões</h2>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              DEV / Sistema
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-4 pr-4">Perfil</th>
                  <th className="pb-4 pr-4">Dashboard</th>
                  <th className="pb-4 pr-4">Membros</th>
                  <th className="pb-4 pr-4">Financeiro</th>
                  <th className="pb-4 pr-4">Relatórios</th>
                  <th className="pb-4 pr-4">Sistema</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10 text-slate-300">
                  <td className="py-4 pr-4 font-medium text-slate-100">DEV</td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                </tr>
                <tr className="border-t border-white/10 text-slate-300">
                  <td className="py-4 pr-4 font-medium text-slate-100">Financeiro</td>
                  <td className="py-4 pr-4"><input type="checkbox" readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" checked readOnly /></td>
                  <td className="py-4 pr-4"><input type="checkbox" readOnly /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              Salvar
            </button>
            <button className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Cancelar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
