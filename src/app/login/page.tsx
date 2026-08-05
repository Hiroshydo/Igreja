import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth/session";
import { hasPublicEnv } from "@/lib/env";

export default async function LoginPage() {
  const authContext = hasPublicEnv() ? await getAuthContext().catch(() => null) : null;
  if (authContext) {
    redirect("/");
  }

  const isConfigured = hasPublicEnv();

  return (
    <main className="relative min-h-screen overflow-hidden bg-app-base px-4 py-10 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_75%_15%,rgba(14,165,233,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(244,63,94,0.14),transparent_24%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.2fr_420px]">
        <section className="rounded-3xl border border-white/12 bg-slate-900/62 p-8 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">Comunidade Viva</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-50">
            Plataforma de gestão eclesiástica preparada para autenticação, auditoria e múltiplas congregações.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Esta etapa remove o acesso demonstrativo e passa a exigir sessão real via Supabase Auth,
            preservando o dashboard atual para a próxima migração dos módulos para dados totalmente dinâmicos.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Controle de acesso</CardTitle>
                <CardDescription>DEV, Pastor, Corpo Eclesiástico, Tesouraria, Mídia e demais perfis.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                Menus e APIs passam a obedecer permissões reais em vez de credenciais fixas no frontend.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Base para produção</CardTitle>
                <CardDescription>Schema SQL normalizado, auditoria e serviços centralizados.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                A aplicação fica pronta para evoluir os CRUDs restantes sem duplicar regras de negócio.
              </CardContent>
            </Card>
          </div>

          {!isConfigured ? (
            <div className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
              Configure as variáveis de ambiente em .env.local a partir de .env.example antes de usar a autenticação.
            </div>
          ) : null}
        </section>

        <LoginForm isConfigured={isConfigured} />
      </div>
    </main>
  );
}
