"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  Church,
  Compass,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoonStar,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Painel Admin", icon: ShieldCheck },
  { label: "Membros", icon: Users },
  { label: "Discipulado", icon: Compass },
  { label: "Saude Pastoral", icon: Activity },
];

const stats = [
  { label: "Membros", value: "1.248", trend: "+12%" },
  { label: "Visitantes", value: "84", trend: "+6%" },
  { label: "Pedidos de oracao", value: "24", trend: "-2%" },
];

export function PremiumDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app-base text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-20%,rgba(251,191,36,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_50%_110%,rgba(244,63,94,0.16),transparent_28%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              size="icon"
              variant="subtle"
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 text-slate-950 shadow-[0_15px_30px_-18px_rgba(251,191,36,0.85)]">
              <Church className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Comunidade Viva
              </p>
              <h1 className="truncate text-sm font-semibold text-slate-50 sm:text-base">
                Ecossistema Pastoral Premium
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificacoes">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Mensagens">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Tema">
              <MoonStar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-4 pb-10 pt-4 sm:px-6 md:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden rounded-3xl border border-white/12 bg-slate-900/65 p-4 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.95)] backdrop-blur-xl md:block">
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.08 }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-amber-300/35 hover:bg-white/10"
              >
                <item.icon className="h-4 w-4 text-amber-200/90" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/62 p-[1px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(251,191,36,0.45),rgba(14,165,233,0.1),rgba(244,63,94,0.25))] opacity-55" />
            <div className="relative rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-6 backdrop-blur-2xl">
              <Badge variant="info" className="mb-3">Dashboard Executivo</Badge>
              <h2 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                Visao inteligente da saude, crescimento e cuidado pastoral.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Interface inspirada nas startups mais modernas, com leitura rapida de indicadores, foco em tomada de decisao e animacoes fluidas sem perder performance.
              </p>
            </div>
          </motion.section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="success">{item.trend} no mes</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agenda inteligente</CardTitle>
                <CardDescription>
                  Priorizacao de eventos e equipes com status em tempo real.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">Culto de Jovens - Sexta 19h30</div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">Intercessao Semanal - Sabado 09h</div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">Reuniao do Diaconato - Domingo 17h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de cuidado</CardTitle>
                <CardDescription>
                  Sinais de atencao para acao pastoral imediata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <div className="rounded-xl border border-rose-300/25 bg-rose-400/10 p-3">3 familias aguardam visita pastoral.</div>
                <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 p-3">Escala de louvor incompleta para o domingo.</div>
                <div className="rounded-xl border border-sky-300/25 bg-sky-400/10 p-3">7 novos alunos confirmados na EBD.</div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              aria-label="Fechar menu"
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 z-50 h-full w-[84vw] max-w-[320px] border-r border-white/10 bg-slate-950/96 p-4 md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Navegacao</p>
                <Button size="icon" variant="ghost" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-slate-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-amber-200" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
