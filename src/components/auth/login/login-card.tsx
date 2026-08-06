"use client";

import { motion } from "framer-motion";
import { Church, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import { loginTheme } from "./theme";
import { getVerseForAccess } from "./verses";

interface LoginCardProps {
  isConfigured: boolean;
}

const rememberedEmailStorageKey = "ecclesia_one_remembered_email";

export function LoginCard({ isConfigured }: LoginCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(rememberedEmailStorageKey) ?? "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccess, setRememberAccess] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return Boolean(window.localStorage.getItem(rememberedEmailStorageKey));
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [verse] = useState(() => getVerseForAccess());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!isConfigured) {
      setError("Configure as variaveis do Supabase antes de autenticar.");
      return;
    }

    if (rememberAccess) {
      window.localStorage.setItem(rememberedEmailStorageKey, email);
    } else {
      window.localStorage.removeItem(rememberedEmailStorageKey);
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
      setError("Nao foi possivel iniciar a sessao.");
    } finally {
      setIsPending(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);

    if (!isConfigured) {
      setError("Configure as variaveis do Supabase antes de recuperar senha.");
      return;
    }

    if (!email) {
      setError("Informe o e-mail para receber o link de recuperacao.");
      return;
    }

    setIsSendingReset(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/login`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setInfo("Enviamos um link de recuperacao para o e-mail informado.");
    } catch {
      setError("Nao foi possivel enviar o link de recuperacao agora.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/22 bg-white/10 p-6 shadow-[0_30px_90px_-48px_rgba(6,10,20,0.95)] backdrop-blur-2xl sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(199,160,74,0.18),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(112,169,231,0.2),transparent_28%)]" />

      <div className="relative">
        <div className="mb-7 space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173e67] via-[#2a5f95] to-[#c7a04a] text-white">
            <Church className="h-4.5 w-4.5" />
          </div>
          <p className="text-sm font-medium tracking-[0.18em] text-slate-200">{loginTheme.brandName}</p>
          <p className="text-xs text-slate-300">{loginTheme.brandSubtitle}</p>
          {!isConfigured ? (
            <p className="rounded-xl border border-amber-300/45 bg-amber-300/14 px-3 py-2 text-xs text-amber-100">
              Configure .env.local com as chaves Supabase para liberar o acesso.
            </p>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/9 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-[#c7a04a]/75 focus:ring-2 focus:ring-[#c7a04a]/25"
              placeholder="voce@igreja.org"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/9 px-3 py-3 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-[#c7a04a]/75 focus:ring-2 focus:ring-[#c7a04a]/25"
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 transition hover:bg-white/12 hover:text-white"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={rememberAccess}
                onChange={(event) => setRememberAccess(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white/10 text-[#c7a04a] focus:ring-[#c7a04a]/35"
              />
              Lembrar acesso
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSendingReset}
              className="font-medium text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingReset ? "Enviando..." : "Esqueci minha senha"}
            </button>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-400/14 px-3 py-2 text-sm text-rose-100">{error}</p>
          ) : null}
          {info ? (
            <p className="rounded-xl border border-emerald-300/40 bg-emerald-300/14 px-3 py-2 text-sm text-emerald-100">{info}</p>
          ) : null}

          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.995 }}>
            <Button
              type="submit"
              disabled={isPending}
              className="group relative h-12 w-full overflow-hidden rounded-xl border border-[#c7a04a]/45 bg-gradient-to-r from-[#173e67] via-[#2a5f95] to-[#c7a04a] text-white shadow-[0_26px_56px_-34px_rgba(9,20,40,0.95)] transition hover:from-[#1c4a7a] hover:via-[#2f6da8] hover:to-[#d6b364]"
            >
              <span className="pointer-events-none absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/26 to-transparent transition duration-700 group-hover:translate-x-[110%]" />
              {isPending ? (
                <span className="relative inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="relative">Entrar</span>
              )}
            </Button>
          </motion.div>
        </form>

        <div className="mt-7 rounded-2xl border border-white/18 bg-white/8 px-4 py-3">
          <p className="text-sm italic leading-relaxed text-slate-200">&quot;{verse.text}&quot;</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{verse.reference}</p>
        </div>
      </div>
    </motion.section>
  );
}
