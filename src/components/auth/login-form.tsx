"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface LoginFormProps {
  isConfigured: boolean;
}

export function LoginForm({ isConfigured }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isConfigured) {
      setError("Configure as variáveis do Supabase antes de autenticar.");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch {
      setError("Não foi possível iniciar a sessão.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-white/12 bg-slate-900/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Acesso seguro</CardTitle>
        <CardDescription>
          Autenticação centralizada com Supabase Auth e controle por papéis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
              placeholder="voce@igreja.org"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
