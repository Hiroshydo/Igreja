"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookMarked,
  Bell,
  Church,
  Compass,
  GraduationCap,
  Images,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoonStar,
  Music,
  Radio,
  ScrollText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TabKey =
  | "dashboard"
  | "admin-dashboard"
  | "admin-membros"
  | "ministerios-musica"
  | "galeria-fotos"
  | "ebd-ensino"
  | "biblioteca-historia"
  | "centro-doutrinas"
  | "scorecard-saude"
  | "liturgia-comunicacao"
  | "mapa-discipulado";

type AdminModule = "gallery" | "events" | "members" | "books";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "admin-dashboard", label: "Painel Admin", icon: ShieldCheck },
  { key: "admin-membros", label: "Membros", icon: Users },
  { key: "ministerios-musica", label: "Louvor", icon: Music },
  { key: "galeria-fotos", label: "Galeria", icon: Images },
  { key: "ebd-ensino", label: "Escola Biblica", icon: GraduationCap },
  { key: "biblioteca-historia", label: "Biblioteca", icon: BookMarked },
  { key: "centro-doutrinas", label: "Doutrinas", icon: ScrollText },
  { key: "scorecard-saude", label: "Saude Pastoral", icon: Activity },
  { key: "liturgia-comunicacao", label: "Culto e Midia", icon: Radio },
  { key: "mapa-discipulado", label: "Discipulado", icon: Compass },
] satisfies Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }>;

const stats = [
  { label: "Membros", value: "1.248", trend: "+12%" },
  { label: "Visitantes", value: "84", trend: "+6%" },
  { label: "Pedidos de oracao", value: "24", trend: "-2%" },
];

const growthData = [
  { month: "Jan", membros: 1120 },
  { month: "Fev", membros: 1160 },
  { month: "Mar", membros: 1188 },
  { month: "Abr", membros: 1225 },
  { month: "Mai", membros: 1260 },
  { month: "Jun", membros: 1248 },
];

const attendanceData = [
  { name: "Culto", value: 38, color: "#fbbf24" },
  { name: "EBD", value: 24, color: "#38bdf8" },
  { name: "PG", value: 19, color: "#a78bfa" },
  { name: "Acao", value: 19, color: "#34d399" },
];

const socialData = [
  { month: "Jan", familias: 22 },
  { month: "Fev", familias: 24 },
  { month: "Mar", familias: 27 },
  { month: "Abr", familias: 30 },
  { month: "Mai", familias: 33 },
  { month: "Jun", familias: 38 },
];

const galleryItems = [
  {
    id: 1,
    title: "Batismo da juventude",
    category: "Batismo",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Reuniao de oracao",
    category: "Reunioes",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Louvorzao de jovens",
    category: "Louvor",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Culto de ensino",
    category: "Ensino",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
];

const members = [
  {
    id: 1,
    name: "Ana Maria Fernandes",
    status: "Membro Ativo",
    lastVisit: "8 dias",
    ministry: "Louvor",
  },
  {
    id: 2,
    name: "Ricardo Alves",
    status: "Em Alerta",
    lastVisit: "45 dias",
    ministry: "Intercessao",
  },
  {
    id: 3,
    name: "Sara Oliveira",
    status: "Novo Convertido",
    lastVisit: "2 dias",
    ministry: "EBD",
  },
];

const timeline = [
  "Visitou a igreja pela primeira vez",
  "Concluiu classe de batismo",
  "Batismo nas aguas",
  "Entrou no ministerio de acao social",
];

const books = [
  { title: "Teologia Sistematica", author: "Wayne Grudem", category: "Doutrina" },
  { title: "Discipulado Real", author: "Pr. Eduardo", category: "Discipulado" },
  { title: "Historia da Igreja", author: "Justo Gonzalez", category: "Historia" },
  { title: "Liturgia Viva", author: "Equipe CV", category: "Liturgia" },
];

const doctrineCards = [
  {
    id: "sola-scriptura",
    title: "Sola Scriptura",
    summary: "A Biblia como regra final de fe e pratica.",
    detail:
      "Toda decisao ministerial passa pela Palavra. Estrategia, ensino e aconselhamento sao alinhados ao texto biblico.",
  },
  {
    id: "sola-gratia",
    title: "Sola Gratia",
    summary: "Salvacao somente pela graca.",
    detail:
      "A igreja reforca acolhimento, discipulado e restauracao com base na graca, nao em meritocracia espiritual.",
  },
  {
    id: "sola-fide",
    title: "Sola Fide",
    summary: "Justificacao mediante a fe.",
    detail:
      "A comunicacao evangelistica enfatiza fe em Cristo e transformacao de vida como resposta ao Evangelho.",
  },
];

const worshipChecklist = [
  { item: "Escala de louvor confirmada", status: "ok" },
  { item: "Slides revisados", status: "ok" },
  { item: "Streaming testado", status: "warn" },
  { item: "Microfones checados", status: "ok" },
];

const discipleshipFlow = [
  { stage: "Conexao", count: 34 },
  { stage: "Fundamentos", count: 22 },
  { stage: "Servico", count: 15 },
  { stage: "Lideranca", count: 8 },
];

export function PremiumDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [galleryFilter, setGalleryFilter] = useState<string>("Todos");
  const [memberSearch, setMemberSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [doctrineOpen, setDoctrineOpen] = useState<string | null>("sola-scriptura");
  const [adminEmail, setAdminEmail] = useState("admin@igrejaviva.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [adminLogged, setAdminLogged] = useState(false);
  const [adminModule, setAdminModule] = useState<AdminModule>("gallery");
  const [toast, setToast] = useState("");

  const filteredGallery = useMemo(() => {
    if (galleryFilter === "Todos") return galleryItems;
    return galleryItems.filter((item) => item.category === galleryFilter);
  }, [galleryFilter]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return members.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.ministry.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  const filteredBooks = useMemo(() => {
    const q = librarySearch.toLowerCase();
    return books.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [librarySearch]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminEmail === "admin@igrejaviva.com" && adminPassword === "admin123") {
      setAdminLogged(true);
      setToast("Login administrativo realizado com sucesso.");
      window.setTimeout(() => setToast(""), 2200);
      return;
    }

    setToast("Credenciais invalidas. Use admin@igrejaviva.com / admin123");
    window.setTimeout(() => setToast(""), 2600);
  };

  const renderAdminModule = () => {
    if (adminModule === "gallery") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {galleryItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <p className="font-semibold text-slate-50">{item.title}</p>
              <p className="text-xs text-slate-400">{item.category}</p>
            </div>
          ))}
        </div>
      );
    }

    if (adminModule === "events") {
      return (
        <div className="space-y-2 text-sm text-slate-200">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">Culto de Jovens - Sexta 19h30</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">Santa Ceia - Domingo 19h</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">Seminario de Lideranca - Sabado 15h</div>
        </div>
      );
    }

    if (adminModule === "members") {
      return (
        <div className="space-y-2 text-sm text-slate-200">
          {members.map((member) => (
            <div key={member.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-slate-50">{member.name}</p>
              <p className="text-xs text-slate-400">{member.status} - {member.ministry}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 text-sm text-slate-200">
        {books.map((book) => (
          <div key={book.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-semibold text-slate-50">{book.title}</p>
            <p className="text-xs text-slate-400">{book.author} - {book.category}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === "dashboard") {
      return (
        <>
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
                Migracao completa com conteudo por modulo, filtros, fluxo admin e graficos de acompanhamento em tempo real.
              </p>
            </div>
          </motion.section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.08 }}
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
                <CardTitle>Crescimento da igreja</CardTitle>
                <CardDescription>Evolucao de membros nos ultimos meses</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="membros" stroke="#fbbf24" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequencia por ministerio</CardTitle>
                <CardDescription>Distribuicao de presenca semanal</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82}>
                      {attendanceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        </>
      );
    }

    if (activeTab === "admin-dashboard") {
      return (
        <Card>
          {!adminLogged ? (
            <>
              <CardHeader>
                <CardTitle>Acesso administrativo</CardTitle>
                <CardDescription>Use as credenciais demo para liberar os modulos de gestao.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleAdminLogin}>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="E-mail"
                    type="email"
                  />
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="Senha"
                    type="password"
                  />
                  <Button type="submit">Entrar no painel</Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Painel da igreja</CardTitle>
                <CardDescription>Gestao de galeria, eventos, membros e biblioteca.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-2">
                  {[
                    ["gallery", "Galeria"],
                    ["events", "Eventos"],
                    ["members", "Membros"],
                    ["books", "Biblioteca"],
                  ].map(([key, label]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={adminModule === key ? "default" : "subtle"}
                      onClick={() => setAdminModule(key as AdminModule)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {renderAdminModule()}
              </CardContent>
            </>
          )}
        </Card>
      );
    }

    if (activeTab === "admin-membros") {
      return (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Prontuario de membros</CardTitle>
              <CardDescription>Busca por nome, status ou ministerio.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                placeholder="Buscar membro..."
              />
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <p className="font-semibold text-slate-50">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.status} - {member.ministry}</p>
                    <p className="text-xs text-amber-200">Ultima visita: {member.lastVisit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linha do tempo espiritual</CardTitle>
              <CardDescription>Historico pastoral do membro selecionado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeline.map((step) => (
                <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  {step}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      );
    }

    if (activeTab === "ministerios-musica") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Ministerio de Louvor</CardTitle>
            <CardDescription>Escalas, repertorio e agenda de ensaios.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">Ensaio geral - Quinta 20h</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">Passagem de som - Domingo 17h30</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">Repertorio: Graca Sublime, Bondade de Deus, Eu Navegarei</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">Pendencias: 2 musicos sem confirmacao</div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "galeria-fotos") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Galeria de fotos</CardTitle>
            <CardDescription>Filtros por categoria e visual publico dos registros.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {["Todos", "Batismo", "Reunioes", "Louvor", "Ensino"].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={galleryFilter === filter ? "default" : "subtle"}
                  onClick={() => setGalleryFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredGallery.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-white/12 bg-white/5">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={900}
                    height={560}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="font-semibold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "ebd-ensino") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Escola Biblica Dominical</CardTitle>
            <CardDescription>Turmas, professores e material de ensino.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">Adultos - Sala 1 - Prof. Marcos</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">Jovens - Sala 2 - Profa. Daniela</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">Criancas - Sala Kids - Equipe Infantil</div>
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3">7 novos alunos confirmados este mes.</div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "biblioteca-historia") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Biblioteca e Historia</CardTitle>
            <CardDescription>Busca de livros, autores e categorias.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
              placeholder="Buscar livro..."
            />
            <div className="space-y-2">
              {filteredBooks.map((book) => (
                <div key={book.title} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <p className="font-semibold text-slate-50">{book.title}</p>
                  <p className="text-xs text-slate-400">{book.author} - {book.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "centro-doutrinas") {
      return (
        <div className="space-y-3">
          {doctrineCards.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setDoctrineOpen((prev) => (prev === item.id ? null : item.id))}
                >
                  {doctrineOpen === item.id ? "Ocultar detalhe" : "Ver detalhe"}
                </Button>
                {doctrineOpen === item.id ? (
                  <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">{item.detail}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (activeTab === "scorecard-saude") {
      return (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scorecard de saude pastoral</CardTitle>
              <CardDescription>Indicadores de cuidado e engajamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              {[
                ["Visitas concluidas", 72],
                ["Integracao de novos", 81],
                ["Engajamento em pequenos grupos", 64],
                ["Retencao de membros", 77],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-300 to-emerald-300" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acao social</CardTitle>
              <CardDescription>Familias assistidas por mes.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={socialData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="familias" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      );
    }

    if (activeTab === "liturgia-comunicacao") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Liturgia e comunicacao</CardTitle>
            <CardDescription>Checklist de culto e equipe de midia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-200">
            {worshipChecklist.map((item) => (
              <div key={item.item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <span>{item.item}</span>
                <Badge variant={item.status === "ok" ? "success" : "default"}>{item.status === "ok" ? "Concluido" : "Ajustar"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de discipulado</CardTitle>
          <CardDescription>Fluxo de crescimento espiritual por etapa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-200">
          {discipleshipFlow.map((item) => (
            <div key={item.stage} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <span>{item.stage}</span>
              <Badge variant="info">{item.count} pessoas</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

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
                onClick={() => handleTabChange(item.key)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition hover:-translate-y-0.5 ${
                  activeTab === item.key
                    ? "border-amber-300/40 bg-amber-300/15 text-amber-100"
                    : "border-white/10 bg-white/4 text-slate-200 hover:border-amber-300/35 hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4 text-amber-200/90" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
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
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm ${
                      activeTab === item.key
                        ? "border-amber-300/40 bg-amber-300/15 text-amber-100"
                        : "border-white/10 bg-white/5 text-slate-100"
                    }`}
                    onClick={() => handleTabChange(item.key)}
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

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-[60] rounded-xl border border-white/15 bg-slate-900/95 px-4 py-2 text-sm text-slate-100 shadow-2xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
