"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Church,
  Eye,
  EyeOff,
  FolderKanban,
  Gem,
  HandHeart,
  Headset,
  Lock,
  Loader2,
  Mail,
  Megaphone,
  Palette,
  Music2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Wallet,
  Waves,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface LoginFormProps {
  isConfigured: boolean;
}

const benefitCards = [
  { label: "Cadastro Inteligente de Membros", icon: UserPlus },
  { label: "Gestao de Ministerios", icon: Church },
  { label: "Escalas de Servico", icon: Music2 },
  { label: "Agenda Congregacional", icon: CalendarDays },
  { label: "Financeiro Completo", icon: Wallet },
  { label: "Patrimonio", icon: ShieldCheck },
  { label: "Pedidos de Oracao", icon: HandHeart },
  { label: "Comunicacao Interna", icon: Megaphone },
  { label: "Relatorios Gerenciais", icon: FolderKanban },
  { label: "Dashboard em Tempo Real", icon: BarChart3 },
];

const sampleIndicators = [
  { value: "+2.500", label: "Membros Gerenciados" },
  { value: "+320", label: "Eventos Organizados" },
  { value: "100%", label: "Controle Financeiro" },
  { value: "24h", label: "Disponibilidade" },
];

const verses = [
  {
    text: "Servi uns aos outros, cada um conforme o dom que recebeu.",
    reference: "1 Pedro 4:10",
  },
  {
    text: "Tudo deve ser feito com decencia e ordem.",
    reference: "1 Corintios 14:40",
  },
  {
    text: "Confiem no Senhor de todo o coracao.",
    reference: "Proverbios 3:5",
  },
  {
    text: "O Senhor e a minha forca e o meu escudo.",
    reference: "Salmos 28:7",
  },
];

const brandName = "Ecclesia One";
const rememberedEmailStorageKey = "ecclesia_one_remembered_email";
const verseRotationStorageKey = "ecclesia_one_verse_rotation";
const visualModeStorageKey = "ecclesia_one_visual_mode";
const selectedRoleStorageKey = "ecclesia_one_selected_role";
const motionPreferenceStorageKey = "ecclesia_one_motion_enabled";
const lastRoleUsedStorageKey = "ecclesia_one_last_role_used";
const quickTags = ["Acesso seguro", "Experiencia premium", "Suporte pastoral"];
const onboardingSteps = [
  "1/3: Comece no Dashboard para ver a saude geral da igreja.",
  "2/3: Em Membros, acompanhe visitantes, aniversariantes e integracao.",
  "3/3: Finalize em Agenda e Comunicacao para alinhar a semana ministerial.",
];

const roleQuickAccess = [
  { code: "DEV", label: "Desenvolvedor", hint: "monitoramento, logs e operacao global" },
  { code: "PASTOR", label: "Pastor", hint: "cuidado pastoral, agenda e oracao" },
  { code: "CORPO", label: "Corpo Eclesiastico", hint: "integracao, discipulado e classes" },
  { code: "MIDIA", label: "Midia", hint: "transmissoes, escala e publicacoes" },
  { code: "MUSICOS", label: "Musicos", hint: "repertorio, ensaios e escalas" },
  { code: "TESOURARIA", label: "Tesouraria", hint: "entradas, despesas e pendencias" },
] as const;

function resolvePasswordStrength(passwordValue: string) {
  if (passwordValue.length === 0) {
    return { label: "Digite sua senha", tone: "text-slate-400", progress: "0%" };
  }

  if (passwordValue.length < 6) {
    return { label: "Senha curta", tone: "text-rose-200", progress: "35%" };
  }

  if (passwordValue.length < 10) {
    return { label: "Senha media", tone: "text-amber-200", progress: "65%" };
  }

  return { label: "Senha forte", tone: "text-emerald-200", progress: "100%" };
}

export function LoginForm({ isConfigured }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(rememberedEmailStorageKey) ?? "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [activeField, setActiveField] = useState<"email" | "password" | null>(null);
  const [visualMode, setVisualMode] = useState<"luxe" | "viva">(() => {
    if (typeof window === "undefined") {
      return "luxe";
    }

    return window.localStorage.getItem(visualModeStorageKey) === "viva" ? "viva" : "luxe";
  });
  const [selectedRole, setSelectedRole] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "PASTOR";
    }

    return window.localStorage.getItem(selectedRoleStorageKey) ?? "PASTOR";
  });
  const [lastRoleUsed] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(lastRoleUsedStorageKey) ?? "";
  });
  const [motionEnabled, setMotionEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem(motionPreferenceStorageKey) !== "off";
  });
  const [tourStep, setTourStep] = useState(0);
  const [themeTransitionToken, setThemeTransitionToken] = useState(0);
  const [rememberAccess, setRememberAccess] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return Boolean(window.localStorage.getItem(rememberedEmailStorageKey));
  });
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [verseIndex] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const rawRotation = Number(window.localStorage.getItem(verseRotationStorageKey) ?? "0");
    const normalizedRotation = Number.isFinite(rawRotation) ? rawRotation : 0;
    const nextRotation = normalizedRotation + 1;

    window.localStorage.setItem(verseRotationStorageKey, String(nextRotation));
    return normalizedRotation % verses.length;
  });
  const verse = verses[verseIndex] ?? verses[0];

  const handleParallax = (event: React.MouseEvent<HTMLElement>) => {
    if (!motionEnabled) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    setParallaxOffset({
      x: normalizedX * 10,
      y: normalizedY * 10,
    });
  };

  const resetParallax = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

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

    window.localStorage.setItem(lastRoleUsedStorageKey, selectedRole);

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

  const systemVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "v0.1.0";
  const environment = process.env.NODE_ENV ?? "development";
  const currentYear = new Date().getFullYear();
  const isViva = visualMode === "viva";
  const passwordStrength = useMemo(() => resolvePasswordStrength(password), [password]);
  const selectedRoleMeta = useMemo(
    () => roleQuickAccess.find((role) => role.code === selectedRole) ?? roleQuickAccess[1],
    [selectedRole]
  );
  const contextualGreeting = useMemo(() => {
    const hour = new Date().getHours();
    const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return `${period}, contexto ${selectedRoleMeta.label} ativo.`;
  }, [selectedRoleMeta.label]);

  const handleQuickTour = () => {
    setError(null);
    const nextStep = (tourStep + 1) % onboardingSteps.length;
    setInfo(onboardingSteps[tourStep] ?? onboardingSteps[0]);
    setTourStep(nextStep);
  };

  const handleSupport = () => {
    setError(null);
    setInfo("Suporte pronto para ajudar: use o e-mail ministerial e informe sua congregacao.");
  };

  const handleVisualModeChange = (mode: "luxe" | "viva") => {
    setVisualMode(mode);
    window.localStorage.setItem(visualModeStorageKey, mode);
    setThemeTransitionToken((prev) => prev + 1);
  };

  const handleRoleSelect = (roleCode: string, roleLabel: string, roleHint: string) => {
    setSelectedRole(roleCode);
    window.localStorage.setItem(selectedRoleStorageKey, roleCode);
    setInfo(`Contexto ${roleLabel} selecionado: ${roleHint}.`);
  };

  const handleMotionToggle = () => {
    const nextValue = !motionEnabled;
    setMotionEnabled(nextValue);
    window.localStorage.setItem(motionPreferenceStorageKey, nextValue ? "on" : "off");

    if (!nextValue) {
      setParallaxOffset({ x: 0, y: 0 });
    }
  };

  const handlePasswordKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState("CapsLock"));
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] text-slate-100 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
      <section
        className="relative isolate overflow-hidden px-5 py-8 sm:px-8 lg:min-h-screen lg:px-10 lg:py-10"
        onMouseMove={handleParallax}
        onMouseLeave={resetParallax}
      >
        <motion.div
          className="absolute inset-0"
          animate={motionEnabled ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={motionEnabled ? { duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 0 }}
          style={{ x: parallaxOffset.x, y: parallaxOffset.y }}
        >
          <Image
            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=2200&q=80"
            alt="Igreja reunida em momento de adoracao"
            fill
            priority
            className="object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,8,20,0.86),rgba(6,16,40,0.56),rgba(7,19,45,0.84))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(250,204,21,0.2),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.16),transparent_26%)]" />

        <div className="relative flex h-full flex-col justify-between">
          <div>
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-100 backdrop-blur-md"
            >
              Bem-vindo
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
            >
              A tecnologia servindo ao Reino.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base"
            >
              Uma plataforma inteligente desenvolvida para fortalecer a administracao da igreja,
              conectar ministerios, organizar pessoas e permitir que lideres dediquem mais tempo ao
              cuidado com vidas.
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              href="#beneficios"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Conheca a plataforma
              <Waves className="h-4 w-4" />
            </motion.a>

            <div id="beneficios" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {benefitCards.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 + index * 0.03 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="group rounded-2xl border border-white/22 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-3 backdrop-blur-xl transition hover:border-amber-200/45"
                >
                  <div className="flex items-center gap-2 text-amber-100">
                    <div className="rounded-lg border border-amber-200/30 bg-amber-200/15 p-1.5 text-amber-100 transition group-hover:scale-105 group-hover:bg-amber-200/22">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs leading-snug text-slate-50">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sampleIndicators.map((indicator, index) => (
                <motion.div
                  key={indicator.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.38 + index * 0.05 }}
                  className="rounded-2xl border border-white/22 bg-slate-950/36 p-3 backdrop-blur-lg"
                >
                  <p className="text-xl font-semibold text-amber-100">{indicator.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{indicator.label}</p>
                </motion.div>
              ))}
            </div>

            <p className="max-w-3xl text-xs leading-relaxed text-slate-300">
              Desenvolvido para fortalecer a gestao da igreja e permitir que lideres foquem no que
              realmente importa. Pessoas.
            </p>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:min-h-screen lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${visualMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionEnabled ? 0.5 : 0 }}
            className={`absolute inset-0 ${
              isViva
                ? "bg-[linear-gradient(180deg,#111827_0%,#172554_48%,#0f172a_100%)]"
                : "bg-[linear-gradient(180deg,#0a1429_0%,#101e3e_54%,#0f2342_100%)]"
            }`}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={`overlay-${visualMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionEnabled ? 0.5 : 0 }}
            className={`pointer-events-none absolute inset-0 ${
              isViva
                ? "bg-[radial-gradient(circle_at_16%_15%,rgba(217,119,6,0.2),transparent_35%),radial-gradient(circle_at_82%_86%,rgba(59,130,246,0.2),transparent_35%)]"
                : "bg-[radial-gradient(circle_at_20%_18%,rgba(250,204,21,0.14),transparent_35%),radial-gradient(circle_at_82%_86%,rgba(56,189,248,0.18),transparent_35%)]"
            }`}
          />
        </AnimatePresence>
        <AnimatePresence>
          <motion.div
            key={`flash-${themeTransitionToken}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: motionEnabled ? 0.18 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionEnabled ? 0.35 : 0 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-amber-200/10 to-sky-200/10"
          />
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={`relative w-full max-w-md overflow-hidden rounded-[30px] border p-6 text-slate-100 shadow-[0_45px_110px_-56px_rgba(8,12,28,1)] backdrop-blur-2xl sm:p-8 ${
            isViva
              ? "border-blue-200/20 bg-[linear-gradient(155deg,rgba(20,34,68,0.95),rgba(23,37,84,0.92))]"
              : "border-white/18 bg-[linear-gradient(160deg,rgba(17,31,59,0.95),rgba(14,42,75,0.9))]"
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 ${
              isViva
                ? "bg-[radial-gradient(circle_at_5%_0%,rgba(245,158,11,0.2),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(96,165,250,0.2),transparent_28%)]"
                : "bg-[radial-gradient(circle_at_10%_0%,rgba(250,204,21,0.14),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(14,165,233,0.16),transparent_28%)]"
            }`}
          />

          <motion.div
            animate={motionEnabled ? { y: [0, -6, 0], opacity: [0.35, 0.5, 0.35] } : { y: 0, opacity: 0.32 }}
            transition={motionEnabled ? { duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 0 }}
            className="pointer-events-none absolute -right-10 top-16 h-32 w-32 rounded-full bg-amber-300/16 blur-2xl"
          />
          <motion.div
            animate={motionEnabled ? { y: [0, 8, 0], opacity: [0.3, 0.46, 0.3] } : { y: 0, opacity: 0.28 }}
            transition={motionEnabled ? { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 } : { duration: 0 }}
            className="pointer-events-none absolute -left-10 bottom-24 h-28 w-28 rounded-full bg-sky-300/16 blur-2xl"
          />

          <div className="mb-7 space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173e67] via-[#21588f] to-[#cba44e] text-white shadow-[0_18px_36px_-18px_rgba(203,164,78,0.72)]">
              <Church className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{brandName}</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">Portal Ministerial</h2>
            <p className="text-sm text-slate-300">Sua central de gestao ministerial.</p>
            <p className="text-xs text-slate-400">{contextualGreeting}</p>
            {lastRoleUsed ? (
              <p className="text-[11px] text-slate-500">Ultimo contexto usado: {lastRoleUsed}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleVisualModeChange("luxe")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  !isViva
                    ? "border-amber-300/45 bg-amber-300/16 text-amber-100"
                    : "border-white/25 bg-white/8 text-slate-200 hover:bg-white/12"
                }`}
                aria-pressed={!isViva}
              >
                <Gem className="h-3 w-3" />
                Luxo
              </button>
              <button
                type="button"
                onClick={() => handleVisualModeChange("viva")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  isViva
                    ? "border-sky-300/45 bg-sky-300/16 text-sky-100"
                    : "border-white/25 bg-white/8 text-slate-200 hover:bg-white/12"
                }`}
                aria-pressed={isViva}
              >
                <Palette className="h-3 w-3" />
                Viva
              </button>
              <button
                type="button"
                onClick={handleMotionToggle}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/8 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-white/12"
                aria-pressed={motionEnabled}
              >
                <Sparkles className="h-3 w-3" />
                {motionEnabled ? "Animacao on" : "Animacao off"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {quickTags.map((tag, index) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] ${
                    index === 0
                      ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                      : index === 1
                        ? "border-amber-300/35 bg-amber-300/15 text-amber-100"
                        : "border-sky-300/35 bg-sky-300/15 text-sky-100"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
            {!isConfigured ? (
              <p className="rounded-xl border border-amber-300/45 bg-amber-200/15 px-3 py-2 text-xs text-amber-100">
                Configure .env.local com as chaves Supabase para liberar o acesso.
              </p>
            ) : null}
          </div>

          <form className="relative space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200" htmlFor="email">
                Email
              </label>
              <motion.div
                animate={activeField === "email" ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`relative rounded-xl ${
                  activeField === "email" ? "ring-2 ring-amber-300/38" : "ring-0"
                }`}
              >
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField((prev) => (prev === "email" ? null : prev))}
                  className="w-full rounded-xl border border-white/22 bg-white/8 px-9 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-300/65 focus:ring-2 focus:ring-amber-300/22"
                  placeholder="voce@igreja.org"
                  autoComplete="email"
                  required
                />
              </motion.div>
              <p className="text-xs text-slate-400">Use o e-mail principal da sua conta ministerial.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200" htmlFor="password">
                Senha
              </label>
              <motion.div
                animate={activeField === "password" ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`relative rounded-xl ${
                  activeField === "password" ? "ring-2 ring-amber-300/38" : "ring-0"
                }`}
              >
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => {
                    setActiveField((prev) => (prev === "password" ? null : prev));
                    setCapsLockOn(false);
                  }}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  className="w-full rounded-xl border border-white/22 bg-white/8 px-9 py-2.5 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-300/65 focus:ring-2 focus:ring-amber-300/22"
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
              </motion.div>
              <p className="text-xs text-slate-400">Clique no icone para mostrar ou ocultar sua senha.</p>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      passwordStrength.progress === "100%"
                        ? "bg-emerald-300"
                        : passwordStrength.progress === "65%"
                          ? "bg-amber-300"
                          : passwordStrength.progress === "35%"
                            ? "bg-rose-300"
                            : "bg-white/0"
                    }`}
                    style={{ width: passwordStrength.progress }}
                  />
                </div>
                <p className={`text-xs ${passwordStrength.tone}`}>{passwordStrength.label}</p>
              </div>
              {capsLockOn ? (
                <p className="inline-flex items-center gap-1 rounded-lg border border-amber-300/40 bg-amber-300/12 px-2 py-1 text-xs text-amber-100">
                  <AlertTriangle className="h-3 w-3" />
                  Caps Lock ativado
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="inline-flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberAccess}
                  onChange={(event) => setRememberAccess(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white/10 text-amber-300 focus:ring-amber-300/35"
                />
                Lembrar acesso
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSendingReset}
                className="font-medium text-amber-200 transition hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingReset ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-300/45 bg-rose-400/14 px-3 py-2 text-sm text-rose-100">{error}</p>
            ) : null}
            {info ? (
              <p className="rounded-xl border border-emerald-300/45 bg-emerald-300/14 px-3 py-2 text-sm text-emerald-100">{info}</p>
            ) : null}

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.995 }}>
              <Button
                type="submit"
                disabled={isPending}
                className={`group relative h-11 w-full overflow-hidden rounded-xl border text-white shadow-[0_24px_48px_-30px_rgba(15,35,64,0.9)] transition ${
                  isViva
                    ? "border-sky-200/40 bg-gradient-to-r from-[#1b3566] via-[#345fe0] to-[#d49a2f] hover:from-[#23427d] hover:via-[#3c67eb] hover:to-[#e0ab42]"
                    : "border-[#e7c26b]/45 bg-gradient-to-r from-[#183f6a] via-[#26649e] to-[#c49c41] hover:from-[#1a4a7c] hover:via-[#2c71b0] hover:to-[#d2ac55]"
                } hover:shadow-[0_26px_50px_-26px_rgba(196,156,65,0.78)]`}
              >
                <span className="pointer-events-none absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/24 to-transparent transition duration-700 group-hover:translate-x-[110%]" />
                {isPending ? (
                  <span className="relative inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="relative inline-flex items-center gap-2">
                    Entrar no painel
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleQuickTour}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/8 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/14 hover:text-white"
              >
                <PlayCircle className="h-3.5 w-3.5 text-amber-200" />
                Tour rapido
              </button>
              <button
                type="button"
                onClick={handleSupport}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/8 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/14 hover:text-white"
              >
                <Headset className="h-3.5 w-3.5 text-sky-200" />
                Falar com suporte
              </button>
            </div>

            <div className="rounded-xl border border-white/14 bg-white/6 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Acesso rapido por perfil
              </p>
              <div className="flex flex-wrap gap-2">
                {roleQuickAccess.map((role) => (
                  <button
                    key={role.code}
                    type="button"
                    onClick={() => handleRoleSelect(role.code, role.label, role.hint)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
                      selectedRole === role.code
                        ? "border-emerald-300/45 bg-emerald-300/16 text-emerald-100"
                        : "border-white/16 bg-white/8 text-slate-200 hover:bg-white/14"
                    }`}
                    aria-pressed={selectedRole === role.code}
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    {role.code}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Foco ativo: {selectedRoleMeta.label}</p>
            </div>

            <p className="text-center text-xs text-slate-400">
              Dica: use seu email ministerial para acesso rapido e recuperacao segura.
            </p>
          </form>

          <div className="mt-7 rounded-2xl border border-white/18 bg-white/8 px-4 py-3">
            <p className="text-sm italic leading-relaxed text-slate-200">&quot;{verse.text}&quot;</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {verse.reference}
            </p>
          </div>

          <div className="mt-6 space-y-1 text-xs text-slate-400">
            <p>Versao: {systemVersion}</p>
            <p>Ambiente: {environment}</p>
            <p>Copyright {currentYear} {brandName}</p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
