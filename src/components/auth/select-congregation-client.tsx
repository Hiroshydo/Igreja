"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface CongregationOption {
  id: string;
  name: string;
}

interface SelectCongregationClientProps {
  fullName: string;
}

export function SelectCongregationClient({ fullName }: SelectCongregationClientProps) {
  const router = useRouter();
  const [congregations, setCongregations] = useState<CongregationOption[]>([]);
  const [selectedCongregationId, setSelectedCongregationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCongregations() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/me/congregations", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Não foi possível carregar suas congregações.");
        }

        const items = Array.isArray(payload.data) ? (payload.data as CongregationOption[]) : [];
        if (!isMounted) {
          return;
        }

        setCongregations(items);
        setSelectedCongregationId(items[0]?.id ?? "");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Não foi possível carregar suas congregações.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCongregations();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedCongregationId) {
      setError("Selecione uma congregação para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session/congregation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ congregationId: selectedCongregationId }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível ativar a congregação selecionada.");
      }

      router.replace("/");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível ativar a congregação selecionada.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Ecclesia One</p>
        <h1 className="text-3xl font-semibold text-white">Selecione sua igreja</h1>
        <p className="text-sm text-slate-300">{fullName}, escolha uma congregação vinculada para carregar seu contexto seguro.</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {isLoading ? <p className="text-sm text-slate-300">Carregando congregações vinculadas...</p> : null}

        {!isLoading && congregations.length === 0 ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Seu usuário está autenticado, mas ainda não possui vínculo ativo com nenhuma congregação. Solicite o vínculo a um administrador.
          </div>
        ) : null}

        {!isLoading && congregations.length > 0 ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Congregação</span>
            <select
              value={selectedCongregationId}
              onChange={(event) => setSelectedCongregationId(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/60"
            >
              {congregations.map((congregation) => (
                <option key={congregation.id} value={congregation.id}>
                  {congregation.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <Button type="submit" disabled={isLoading || isSubmitting || congregations.length === 0} className="w-full">
          {isSubmitting ? "Ativando contexto..." : "Continuar"}
        </Button>
      </form>
    </section>
  );
}