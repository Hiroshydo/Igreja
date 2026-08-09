"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookMarked,
  Bell,
  Church,
  Compass,
  Download,
  Edit3,
  GraduationCap,
  Images,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageSquare,
  MoonStar,
  Music,
  Save,
  Radio,
  ScrollText,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FinanceReportClient } from "@/components/finance-report-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardPermissionByTab, hasPermission } from "@/lib/auth/permissions";
import { congregationService, memberService } from "@/services/api";
import type { AuthenticatedAppUser, Member, PermissionKey } from "@/types";

type TabKey =
  | "dashboard"
  | "admin-dashboard"
  | "admin-membros"
  | "congregacoes"
  | "ministerios-musica"
  | "galeria-fotos"
  | "ebd-ensino"
  | "biblioteca-historia"
  | "centro-doutrinas"
  | "scorecard-saude"
  | "liturgia-comunicacao"
  | "mapa-discipulado"
  | "relatorios-financeiros";

type AdminModule = "gallery" | "events" | "members" | "books";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "admin-dashboard", label: "Painel DEV", icon: ShieldCheck },
  { key: "admin-membros", label: "Membros", icon: Users },
  { key: "congregacoes", label: "Congregações", icon: Church },
  { key: "ministerios-musica", label: "Louvor", icon: Music },
  { key: "galeria-fotos", label: "Galeria", icon: Images },
  { key: "ebd-ensino", label: "Escola Biblica", icon: GraduationCap },
  { key: "biblioteca-historia", label: "Biblioteca", icon: BookMarked },
  { key: "centro-doutrinas", label: "Doutrinas", icon: ScrollText },
  { key: "scorecard-saude", label: "Saude Pastoral", icon: Activity },
  { key: "liturgia-comunicacao", label: "Culto e Midia", icon: Radio },
  { key: "mapa-discipulado", label: "Discipulado", icon: Compass },
  { key: "relatorios-financeiros", label: "Financeiro", icon: Activity },
] satisfies Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }>;

const stats = [
  { label: "Membros", value: "1.248", trend: "+12%" },
  { label: "Visitantes", value: "84", trend: "+6%" },
  { label: "Pedidos de oracao", value: "24", trend: "-2%" },
];

const congregationsData = [
  {
    id: "cg-001",
    name: "Sede Vida Nova",
    city: "São Paulo",
    leader: "Pr. Daniel Silva",
    members: 348,
    attendance: 89,
    status: "Ativa",
  },
  {
    id: "cg-002",
    name: "Congregação Jardim Esperança",
    city: "Osasco",
    leader: "Pr. Gabriela Martins",
    members: 124,
    attendance: 78,
    status: "Ativa",
  },
  {
    id: "cg-003",
    name: "Comunidade Nova Aliança",
    city: "Guarulhos",
    leader: "Pr. Samuel Costa",
    members: 106,
    attendance: 76,
    status: "Em crescimento",
  },
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

const seedMembers: Member[] = [
  {
    id: "seed-1",
    name: "Ana Maria Fernandes",
    email: "ana@igreja.org",
    phone: "(11) 98888-1111",
    joinDate: "2023-02-15",
    status: "ativo",
    role: "Louvor",
  },
  {
    id: "seed-2",
    name: "Ricardo Alves",
    email: "ricardo@igreja.org",
    phone: "(11) 97777-2222",
    joinDate: "2022-11-09",
    status: "pendente",
    role: "Intercessao",
  },
  {
    id: "seed-3",
    name: "Sara Oliveira",
    email: "sara@igreja.org",
    phone: "(11) 96666-3333",
    joinDate: "2024-01-20",
    status: "ativo",
    role: "EBD",
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
  { item: "Escala de louvor confirmada", status: "ok", owner: "Luan", channel: "Palco", notes: "Abertura do culto pronta" },
  { item: "Slides revisados", status: "ok", owner: "Maria", channel: "Tecnologia", notes: "Versículos e ordem alinhados" },
  { item: "Streaming testado", status: "warn", owner: "Rafael", channel: "Streaming", notes: "Checar conexão do segundo ponto" },
  { item: "Microfones checados", status: "ok", owner: "Nina", channel: "Áudio", notes: "Todos os bolsos com bateria" },
];

const pastoralHealthSeries = [
  { name: "Visitas", value: 72, color: "#f59e0b" },
  { name: "Acompanhamento", value: 81, color: "#38bdf8" },
  { name: "Cuidado", value: 64, color: "#a78bfa" },
  { name: "Retenção", value: 77, color: "#34d399" },
];

const pastoralCareTrend = [
  { month: "Jan", visitas: 58, cuidado: 48 },
  { month: "Fev", visitas: 61, cuidado: 52 },
  { month: "Mar", visitas: 66, cuidado: 56 },
  { month: "Abr", visitas: 72, cuidado: 61 },
  { month: "Mai", visitas: 74, cuidado: 64 },
  { month: "Jun", visitas: 78, cuidado: 68 },
];

const pastoralDemandData = [
  { name: "Orações", value: 38, color: "#fb923c" },
  { name: "Apoio", value: 27, color: "#38bdf8" },
  { name: "Aconselhamento", value: 21, color: "#a78bfa" },
  { name: "Visitas", value: 14, color: "#34d399" },
];

const mediaTasksSeed = [
  { id: 1, title: "Capa do culto", owner: "Davi", status: "Pronto" },
  { id: 2, title: "Preparar playlist", owner: "Lia", status: "Em revisão" },
  { id: 3, title: "Checklist de streaming", owner: "Marcos", status: "Pendente" },
];

const discipleshipFlow = [
  { stage: "Conexao", count: 34 },
  { stage: "Fundamentos", count: 22 },
  { stage: "Servico", count: 15 },
  { stage: "Lideranca", count: 8 },
];

interface PremiumDashboardProps {
  access: AuthenticatedAppUser;
}

interface RoleWelcomeContent {
  roleCode: string;
  headline: string;
  items: string[];
}

interface MemberFormState {
  name: string;
  email: string;
  phone: string;
  status: Member["status"];
  role: string;
  joinDate: string;
  avatar: string;
  congregationId: string;
}

function createEmptyMemberForm(defaultCongregationId = ""): MemberFormState {
  return {
    name: "",
    email: "",
    phone: "",
    status: "ativo",
    role: "",
    joinDate: new Date().toISOString().slice(0, 10),
    avatar: "",
    congregationId: defaultCongregationId,
  };
}

const roleWelcomePriority = [
  "DEV",
  "PASTOR",
  "CORPO_ECLESIASTICO",
  "MUSICOS",
  "MIDIA",
  "TESOURARIA",
  "MEMBROS",
  "VISITANTES",
] as const;

const roleWelcomeMap: Record<string, RoleWelcomeContent> = {
  DEV: {
    roleCode: "DEV",
    headline: "Painel completo do sistema com visao tecnica e operacao avancada.",
    items: ["Resumo geral", "Alertas tecnicos", "Usuarios ativos", "Logs"],
  },
  PASTOR: {
    roleCode: "PASTOR",
    headline: "Visao pastoral para cuidado de pessoas e direcionamento ministerial.",
    items: ["Pedidos de oracao", "Novos visitantes", "Aniversariantes", "Agenda pastoral"],
  },
  CORPO_ECLESIASTICO: {
    roleCode: "CORPO_ECLESIASTICO",
    headline: "Acompanhamento de crescimento e integracao da comunidade.",
    items: ["Novos membros", "Batismos", "Discipulados", "Classes"],
  },
  MUSICOS: {
    roleCode: "MUSICOS",
    headline: "Organizacao de louvor e preparacao das escalas ministeriais.",
    items: ["Proxima escala", "Repertorio", "Ensaios", "Arquivos"],
  },
  MIDIA: {
    roleCode: "MIDIA",
    headline: "Coordenacao de comunicacao e entregas para a congregacao.",
    items: ["Transmissoes", "Eventos", "Escalas", "Publicacoes"],
  },
  TESOURARIA: {
    roleCode: "TESOURARIA",
    headline: "Controle financeiro com rastreabilidade e acompanhamento continuo.",
    items: ["Entradas", "Despesas", "Saldo", "Pendencias"],
  },
  MEMBROS: {
    roleCode: "MEMBROS",
    headline: "Espaco pessoal para participar, acompanhar avisos e manter conexao.",
    items: ["Agenda", "Avisos", "Pedidos de oracao", "Eventos"],
  },
  VISITANTES: {
    roleCode: "VISITANTES",
    headline: "Recepcao inicial com informacoes para conhecer a igreja.",
    items: ["Mensagem de boas-vindas", "Proximos cultos", "Como conhecer a igreja"],
  },
};

function resolveWelcomeRole(roleCodes: string[]) {
  for (const code of roleWelcomePriority) {
    if (roleCodes.includes(code)) {
      return roleWelcomeMap[code];
    }
  }

  return {
    roleCode: "AUTENTICADO",
    headline: "Sua visao inicial esta pronta para acompanhar a vida da igreja.",
    items: ["Dashboard", "Agenda", "Comunicacao"],
  } satisfies RoleWelcomeContent;
}

function getGreetingName(access: AuthenticatedAppUser, resolvedRole: string) {
  if (resolvedRole === "PASTOR") {
    return "Pastor";
  }

  const firstName = access.fullName?.trim().split(" ")[0];
  return firstName && firstName.length > 0 ? firstName : "Usuario";
}

export function PremiumDashboard({ access }: PremiumDashboardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [galleryFilter, setGalleryFilter] = useState<string>("Todos");
  const [memberSearch, setMemberSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [doctrineOpen, setDoctrineOpen] = useState<string | null>("sola-scriptura");
  const [adminModule, setAdminModule] = useState<AdminModule>("gallery");
  const [membersData, setMembersData] = useState<Member[]>(seedMembers);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [congregationsList, setCongregationsList] = useState<Array<{ id: string; name: string; city: string | null; leader: string; members: number; attendance: number; status: string }>>(congregationsData);
  const [memberForm, setMemberForm] = useState<MemberFormState>(() => createEmptyMemberForm(access.congregationId ?? ""));
  const [congregationDraft, setCongregationDraft] = useState({ id: "", name: "", city: "", leader: "", members: 0, attendance: 0, status: "Ativa" });
  const [editingCongregationId, setEditingCongregationId] = useState<string | null>(null);
  const [isSavingCongregation, setIsSavingCongregation] = useState(false);
  const [congregationMessage, setCongregationMessage] = useState<string | null>(null);
  const [galleryItemsState, setGalleryItemsState] = useState(galleryItems);
  const [worshipChecklistItems, setWorshipChecklistItems] = useState(worshipChecklist);
  const [newWorshipItem, setNewWorshipItem] = useState("");
  const [newWorshipOwner, setNewWorshipOwner] = useState("");
  const [newWorshipChannel, setNewWorshipChannel] = useState("Palco");
  const [newWorshipNotes, setNewWorshipNotes] = useState("");
  const [mediaTasksState, setMediaTasksState] = useState(mediaTasksSeed);
  const [newMediaTask, setNewMediaTask] = useState("");
  const [newMediaOwner, setNewMediaOwner] = useState("");
  const [booksState, setBooksState] = useState(books);
  const [doctrineCardsState, setDoctrineCardsState] = useState(doctrineCards);
  const [discipleshipFlowState, setDiscipleshipFlowState] = useState(discipleshipFlow);
  const [ebdClassesState, setEbdClassesState] = useState([
    { title: "Adultos - Sala 1", leader: "Prof. Marcos" },
    { title: "Jovens - Sala 2", leader: "Profa. Daniela" },
    { title: "Crianças - Sala Kids", leader: "Equipe Infantil" },
  ]);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState("");
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | number | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isDeletingMemberId, setIsDeletingMemberId] = useState<string | number | null>(null);

  const filteredGallery = useMemo(() => {
    if (galleryFilter === "Todos") return galleryItemsState;
    return galleryItemsState.filter((item) => item.category === galleryFilter);
  }, [galleryFilter, galleryItemsState]);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) =>
        hasPermission(access.permissions, access.roleCodes, dashboardPermissionByTab[item.key])
      ),
    [access.permissions, access.roleCodes]
  );

  const resolvedActiveTab = visibleNavItems.some((item) => item.key === activeTab)
    ? activeTab
    : visibleNavItems[0]?.key ?? "dashboard";

  const canCreateMember = hasPermission(access.permissions, access.roleCodes, "members.create" as PermissionKey);
  const canUpdateMember = hasPermission(access.permissions, access.roleCodes, "members.update" as PermissionKey);
  const canDeleteMember = hasPermission(access.permissions, access.roleCodes, "members.delete" as PermissionKey);

  const roleWelcome = useMemo(() => resolveWelcomeRole(access.roleCodes), [access.roleCodes]);
  const greetingName = useMemo(
    () => getGreetingName(access, roleWelcome.roleCode),
    [access, roleWelcome.roleCode]
  );

  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      if (!hasPermission(access.permissions, access.roleCodes, "members.read" as PermissionKey)) {
        return;
      }

      setMembersLoading(true);
      setMembersError(null);
      const result = await memberService.getAll();

      if (!mounted) {
        return;
      }

      if (!result.success || !result.data) {
        setMembersError(result.error ?? "Nao foi possivel carregar membros.");
        setMembersLoading(false);
        return;
      }

      setMembersData(result.data);
      setMembersLoading(false);
    }

    async function loadCongregations() {
      const result = await congregationService.getAll();
      if (!mounted) {
        return;
      }
      if (result.success && result.data) {
        setCongregationsList(result.data.map((item) => ({
          id: item.id,
          name: item.name,
          city: item.city,
          leader: item.name.includes("Sede") ? "Pr. Daniel Silva" : "Líder da congregação",
          members: 0,
          attendance: 0,
          status: "Ativa",
        })));
      }
    }

    void loadMembers();
    void loadCongregations();
    return () => {
      mounted = false;
    };
  }, [access.permissions, access.roleCodes]);

  const startMemberCreate = () => {
    setEditingMemberId(null);
    setMemberForm(createEmptyMemberForm(access.congregationId ?? ""));
  };

  const startMemberEdit = (member: Member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone ?? "",
      status: member.status,
      role: member.role ?? "",
      joinDate: member.joinDate,
      avatar: member.avatar ?? "",
      congregationId: access.congregationId ?? "",
    });
  };

  const handleMemberPhotoUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setMemberForm((prev) => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMemberSave = async () => {
    if (!canCreateMember && !canUpdateMember) {
      return;
    }

    setIsSavingMember(true);
    setMembersError(null);

    const payload = {
      name: memberForm.name,
      email: memberForm.email,
      phone: memberForm.phone,
      status: memberForm.status,
      role: memberForm.role,
      joinDate: memberForm.joinDate,
      avatar: memberForm.avatar,
      congregationId: memberForm.congregationId || undefined,
    };

    const response = editingMemberId
      ? await memberService.update(editingMemberId, payload)
      : await memberService.create(payload);

    if (!response.success || !response.data) {
      setMembersError(response.error ?? "Nao foi possivel salvar membro.");
      setIsSavingMember(false);
      return;
    }

    setMembersData((prev) => {
      if (!editingMemberId) {
        return [response.data as Member, ...prev];
      }

      return prev.map((item) => (item.id === editingMemberId ? (response.data as Member) : item));
    });

    setMemberForm(createEmptyMemberForm(access.congregationId ?? ""));
    setEditingMemberId(null);
    setIsSavingMember(false);
  };

  const handleCongregationSave = async () => {
    setIsSavingCongregation(true);
    setCongregationMessage(null);

    try {
      const payload = {
        name: congregationDraft.name,
        code: congregationDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        city: congregationDraft.city,
        state: "SP",
        phone: "",
        email: "",
        legalName: congregationDraft.name,
        taxId: "",
        isActive: true,
      };

      const response = editingCongregationId
        ? await congregationService.update(editingCongregationId, payload)
        : await congregationService.create(payload);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Não foi possível salvar a congregação");
      }

      const nextCongregation = {
        id: response.data.id,
        name: response.data.name,
        city: response.data.city,
        leader: congregationDraft.leader || "Líder da congregação",
        members: congregationDraft.members,
        attendance: congregationDraft.attendance,
        status: congregationDraft.status,
      };

      setCongregationsList((current) => {
        if (editingCongregationId) {
          return current.map((item) => (item.id === editingCongregationId ? nextCongregation : item));
        }
        return [nextCongregation, ...current];
      });

      setCongregationDraft({ id: "", name: "", city: "", leader: "", members: 0, attendance: 0, status: "Ativa" });
      setEditingCongregationId(null);
      setCongregationMessage("Congregação salva com sucesso.");
    } catch (error) {
      setCongregationMessage(error instanceof Error ? error.message : "Erro ao salvar congregação");
    } finally {
      setIsSavingCongregation(false);
    }
  };

  const handleCongregationEdit = (item: { id: string; name: string; city: string | null; leader: string; members: number; attendance: number; status: string }) => {
    setEditingCongregationId(item.id);
    setCongregationDraft({
      id: item.id,
      name: item.name,
      city: item.city ?? "",
      leader: item.leader,
      members: item.members,
      attendance: item.attendance,
      status: item.status,
    });
  };

  const handleMemberDelete = async (memberId: string | number) => {
    if (!canDeleteMember) {
      return;
    }

    if (!window.confirm("Confirma a exclusao deste membro?")) {
      return;
    }

    setIsDeletingMemberId(memberId);
    setMembersError(null);

    const response = await memberService.delete(memberId);
    if (!response.success) {
      setMembersError(response.error ?? "Nao foi possivel excluir membro.");
      setIsDeletingMemberId(null);
      return;
    }

    setMembersData((prev) => prev.filter((item) => item.id !== memberId));
    setIsDeletingMemberId(null);
  };

  const handleGalleryCreate = () => {
    const title = window.prompt("Título do álbum", "Novo álbum");
    if (!title) {
      return;
    }

    const category = window.prompt("Categoria", "Outros");
    if (category === null) {
      return;
    }

    setGalleryItemsState((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        category: category || "Outros",
        image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
      },
    ]);
  };

  const handleGalleryEdit = (item: { id: number; title: string; category: string; image: string }) => {
    const nextTitle = window.prompt("Editar título do álbum", item.title);
    if (!nextTitle) {
      return;
    }

    const nextCategory = window.prompt("Editar categoria", item.category);
    if (nextCategory === null) {
      return;
    }

    setGalleryItemsState((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, title: nextTitle, category: nextCategory || item.category } : entry)));
  };

  const handleGalleryDelete = (id: number) => {
    if (!window.confirm("Excluir este álbum da galeria?")) {
      return;
    }

    setGalleryItemsState((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWorshipAdd = () => {
    const item = window.prompt("Novo item do checklist de louvor");
    if (!item) {
      return;
    }

    setWorshipChecklistItems((prev) => [...prev, { item, status: "warn" }]);
  };

  const handleWorshipEdit = (entry: { item: string; status: string }) => {
    const nextValue = window.prompt("Editar item", entry.item);
    if (!nextValue) {
      return;
    }

    setWorshipChecklistItems((prev) => prev.map((item) => (item.item === entry.item ? { ...item, item: nextValue } : item)));
  };

  const handleWorshipDelete = (item: string) => {
    if (!window.confirm("Excluir este item do checklist?")) {
      return;
    }

    setWorshipChecklistItems((prev) => prev.filter((entry) => entry.item !== item));
  };

  const handleBookAdd = () => {
    const title = window.prompt("Título do livro");
    if (!title) {
      return;
    }

    const author = window.prompt("Autor", "Equipe Ecclesia");
    if (author === null) {
      return;
    }

    const category = window.prompt("Categoria", "Doutrina");
    if (category === null) {
      return;
    }

    setBooksState((prev) => [...prev, { title, author, category }]);
  };

  const handleBookEdit = (book: { title: string; author: string; category: string }) => {
    const nextTitle = window.prompt("Editar título", book.title);
    if (!nextTitle) {
      return;
    }

    const nextAuthor = window.prompt("Editar autor", book.author);
    if (nextAuthor === null) {
      return;
    }

    const nextCategory = window.prompt("Editar categoria", book.category);
    if (nextCategory === null) {
      return;
    }

    setBooksState((prev) => prev.map((entry) => (entry.title === book.title && entry.author === book.author ? { ...entry, title: nextTitle, author: nextAuthor, category: nextCategory } : entry)));
  };

  const handleBookDelete = (title: string) => {
    if (!window.confirm("Excluir este livro da biblioteca?")) {
      return;
    }

    setBooksState((prev) => prev.filter((book) => book.title !== title));
  };

  const handleDoctrineAdd = () => {
    const title = window.prompt("Título da doutrina");
    if (!title) {
      return;
    }

    const summary = window.prompt("Resumo", "Nova doutrina para a igreja");
    if (summary === null) {
      return;
    }

    const detail = window.prompt("Detalhamento", "Descreva a prática e o fundamento da doutrina.");
    if (detail === null) {
      return;
    }

    setDoctrineCardsState((prev) => [...prev, { id: Date.now().toString(), title, summary, detail }]);
  };

  const handleDoctrineEdit = (item: { id: string; title: string; summary: string; detail: string }) => {
    const nextTitle = window.prompt("Editar título", item.title);
    if (!nextTitle) {
      return;
    }

    const nextSummary = window.prompt("Editar resumo", item.summary);
    if (nextSummary === null) {
      return;
    }

    const nextDetail = window.prompt("Editar detalhe", item.detail);
    if (nextDetail === null) {
      return;
    }

    setDoctrineCardsState((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, title: nextTitle, summary: nextSummary, detail: nextDetail } : entry)));
  };

  const handleDoctrineDelete = (id: string) => {
    if (!window.confirm("Excluir esta doutrina?")) {
      return;
    }

    setDoctrineCardsState((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDiscipleshipAdd = () => {
    const stage = window.prompt("Nome da etapa");
    if (!stage) {
      return;
    }

    const count = window.prompt("Quantidade de pessoas", "0");
    if (count === null) {
      return;
    }

    setDiscipleshipFlowState((prev) => [...prev, { stage, count: Number(count) || 0 }]);
  };

  const handleDiscipleshipEdit = (item: { stage: string; count: number }) => {
    const nextStage = window.prompt("Editar etapa", item.stage);
    if (!nextStage) {
      return;
    }

    const nextCount = window.prompt("Editar quantidade", String(item.count));
    if (nextCount === null) {
      return;
    }

    setDiscipleshipFlowState((prev) => prev.map((entry) => (entry.stage === item.stage ? { ...entry, stage: nextStage, count: Number(nextCount) || 0 } : entry)));
  };

  const handleDiscipleshipDelete = (stage: string) => {
    if (!window.confirm("Excluir esta etapa do discipulado?")) {
      return;
    }

    setDiscipleshipFlowState((prev) => prev.filter((item) => item.stage !== stage));
  };

  const handleEbdAdd = () => {
    const title = window.prompt("Nome da turma");
    if (!title) {
      return;
    }

    const leader = window.prompt("Professor ou responsável", "Equipe Ecclesia");
    if (leader === null) {
      return;
    }

    setEbdClassesState((prev) => [...prev, { title, leader }]);
  };

  const handleEbdEdit = (item: { title: string; leader: string }) => {
    const nextTitle = window.prompt("Editar turma", item.title);
    if (!nextTitle) {
      return;
    }

    const nextLeader = window.prompt("Editar responsável", item.leader);
    if (nextLeader === null) {
      return;
    }

    setEbdClassesState((prev) => prev.map((entry) => (entry.title === item.title && entry.leader === item.leader ? { ...entry, title: nextTitle, leader: nextLeader } : entry)));
  };

  const handleEbdDelete = (title: string) => {
    if (!window.confirm("Excluir esta turma?")) {
      return;
    }

    setEbdClassesState((prev) => prev.filter((item) => item.title !== title));
  };

  const handleMembersDownload = () => {
    const blob = new Blob([JSON.stringify(membersData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `membros-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return membersData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.role ?? "").toLowerCase().includes(q)
    );
  }, [memberSearch, membersData]);

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

  const renderAdminModule = () => {
    if (adminModule === "gallery") {
      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button type="button" onClick={() => handleGalleryCreate()} className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200">
              + Novo álbum
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {galleryItemsState.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-50">{item.title}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleGalleryEdit(item)} className="text-xs text-amber-200">Editar</button>
                    <button type="button" onClick={() => handleGalleryDelete(item.id)} className="text-xs text-rose-200">Excluir</button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
            ))}
          </div>
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
          {membersData.map((member) => (
            <div key={member.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-slate-50">{member.name}</p>
              <p className="text-xs text-slate-400">{member.status} - {member.role ?? "Sem função"}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3 text-sm text-slate-200">
        <div className="flex justify-end">
          <button type="button" onClick={() => handleBookAdd()} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
            + Novo livro
          </button>
        </div>
        {booksState.map((book) => (
          <div key={`${book.title}-${book.author}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-50">{book.title}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleBookEdit(book)} className="text-xs text-amber-200">Editar</button>
                <button type="button" onClick={() => handleBookDelete(book.title)} className="text-xs text-rose-200">Excluir</button>
              </div>
            </div>
            <p className="text-xs text-slate-400">{book.author} - {book.category}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTab = () => {
    if (resolvedActiveTab === "dashboard") {
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
                <CardTitle>Resumo ministerial</CardTitle>
                <CardDescription>Geral e ação rápida para o dia a dia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Próximo passo</p>
                  <p className="mt-1 font-semibold text-slate-50">Revisar congregações, membros e financeiro em uma visão integrada.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Membros ativos</p>
                    <p className="mt-1 text-xl font-semibold text-white">{membersData.filter((item) => item.status === "ativo").length}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Congregações</p>
                    <p className="mt-1 text-xl font-semibold text-white">{congregationsList.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

    if (resolvedActiveTab === "admin-dashboard") {
      return (
        <Card>
          <>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Painel DEV</CardTitle>
                  <CardDescription>Área exclusiva para operação avançada, auditoria e gestão central do sistema.</CardDescription>
                </div>
                <Link href="/configuracoes/permissoes" className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20">
                  Gerenciar permissões
                </Link>
              </div>
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
        </Card>
      );
    }

    if (resolvedActiveTab === "admin-membros") {
      return (
        <section className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prontuario de membros</CardTitle>
                  <CardDescription>Busca por nome, status ou ministerio.</CardDescription>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-200"
                  onClick={() => {
                    setEditingMemberId(null);
                    setMemberForm(createEmptyMemberForm(access.congregationId ?? ""));
                    setActiveTab("admin-membros");
                  }}
                >
                  + Cadastrar
                </button>
              </div>
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
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-50">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.status} - {member.role ?? member.ministry ?? "Sem função"}</p>
                        <p className="text-xs text-amber-200">Ultima visita: {member.lastVisit ?? "Não informado"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startMemberEdit(member)}
                          className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleMemberDelete(member.id)}
                          className="rounded-lg border border-rose-300/40 px-2 py-1 text-xs text-rose-100 hover:bg-rose-300/10"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{editingMemberId ? "Editar membro" : "Cadastrar membro"}</CardTitle>
              <CardDescription>Cadastro rápido de membro na congregação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Nome completo</label>
                <input
                  value={memberForm.name}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  placeholder="Nome do membro"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">E-mail</label>
                  <input
                    value={memberForm.email}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    placeholder="email@igreja.org"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Telefone</label>
                  <input
                    value={memberForm.phone}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    placeholder="(11) 99999-0000"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Status</label>
                  <select
                    value={memberForm.status}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, status: event.target.value as Member["status"] }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Função</label>
                  <input
                    value={memberForm.role}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, role: event.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    placeholder="Ministerio / função"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Congregação</label>
                <select
                  value={memberForm.congregationId}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, congregationId: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                >
                  <option value="">Selecione uma congregação</option>
                  {congregationsList.map((congregation) => (
                    <option key={congregation.id} value={congregation.id}>{congregation.name} {congregation.city ? `- ${congregation.city}` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Data de integração</label>
                <input
                  type="date"
                  value={memberForm.joinDate}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, joinDate: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-200 disabled:opacity-60"
                  disabled={isSavingMember}
                  onClick={() => void handleMemberSave()}
                >
                  {isSavingMember ? "Salvando..." : editingMemberId ? "Salvar alterações" : "Cadastrar membro"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setEditingMemberId(null);
                    setMemberForm(createEmptyMemberForm(access.congregationId ?? ""));
                  }}
                >
                  Limpar
                </button>
              </div>

              {membersError ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                  {membersError}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      );
    }

    if (resolvedActiveTab === "congregacoes") {
      return (
        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Congregações</CardTitle>
                  <CardDescription>Local de atuação, líderes e fluxo.</CardDescription>
                </div>
                <button type="button" className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-200">
                  + Nova congregação
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {congregationsList.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">{item.city}</span>
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-100">{item.status}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-50">{item.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">Líder: {item.leader}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.members} membros</span>
                      <span className="text-xs text-slate-300">{item.attendance}% presença</span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                      onClick={() => handleCongregationEdit(item)}
                    >
                      Editar
                    </button>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cadastro rápido</CardTitle>
              <CardDescription>Registrar congregação sem sair do painel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Nome da congregação</label>
                <input
                  value={congregationDraft.name}
                  onChange={(event) => setCongregationDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  placeholder="Ex: Sede Vida Nova"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Cidade</label>
                  <input
                    value={congregationDraft.city}
                    onChange={(event) => setCongregationDraft((prev) => ({ ...prev, city: event.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Líder</label>
                  <input
                    value={congregationDraft.leader}
                    onChange={(event) => setCongregationDraft((prev) => ({ ...prev, leader: event.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                    placeholder="Nome do líder"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Membros</label>
                  <input
                    type="number"
                    value={congregationDraft.members}
                    onChange={(event) => setCongregationDraft((prev) => ({ ...prev, members: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Presença %</label>
                  <input
                    type="number"
                    value={congregationDraft.attendance}
                    onChange={(event) => setCongregationDraft((prev) => ({ ...prev, attendance: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  />
                </div>
              </div>
              <button
                type="button"
                className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-200 disabled:opacity-60"
                disabled={isSavingCongregation}
                onClick={() => void handleCongregationSave()}
              >
                {isSavingCongregation ? "Salvando..." : editingCongregationId ? "Salvar alterações" : "Salvar congregação"}
              </button>
              {congregationMessage ? <p className="text-xs text-slate-300">{congregationMessage}</p> : null}
            </CardContent>
          </Card>
        </section>
      );
    }

    if (resolvedActiveTab === "ministerios-musica") {
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

    if (resolvedActiveTab === "galeria-fotos") {
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
            <div className="mb-4 rounded-xl border border-dashed border-white/10 bg-white/5 p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={newGalleryTitle}
                  onChange={(event) => setNewGalleryTitle(event.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  placeholder="Título do álbum"
                />
                <input
                  value={newGalleryCategory}
                  onChange={(event) => setNewGalleryCategory(event.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  placeholder="Categoria"
                />
                <input
                  value={newGalleryImage}
                  onChange={(event) => setNewGalleryImage(event.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                  placeholder="URL da imagem"
                />
              </div>
              <button
                type="button"
                className="mt-3 rounded-xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200"
                onClick={() => {
                  if (!newGalleryTitle.trim()) return;
                  setGalleryItemsState((current) => [
                    ...current,
                    {
                      id: Date.now(),
                      title: newGalleryTitle.trim(),
                      category: newGalleryCategory.trim() || "Outros",
                      image: newGalleryImage.trim() || "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
                    },
                  ]);
                  setNewGalleryTitle("");
                  setNewGalleryCategory("");
                  setNewGalleryImage("");
                }}
              >
                Criar álbum
              </button>
            </div>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => handleGalleryCreate()} className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200">
                + Novo álbum
              </button>
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
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-100">{item.title}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleGalleryEdit(item)} className="text-xs text-amber-200">Editar</button>
                        <button type="button" onClick={() => handleGalleryDelete(item.id)} className="text-xs text-rose-200">Excluir</button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (resolvedActiveTab === "ebd-ensino") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Escola Biblica Dominical</CardTitle>
            <CardDescription>Turmas, professores e material de ensino.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <div className="flex justify-end">
              <button type="button" onClick={() => handleEbdAdd()} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
                + Nova turma
              </button>
            </div>
            {ebdClassesState.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-50">{item.title}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEbdEdit(item)} className="text-xs text-amber-200">Editar</button>
                    <button type="button" onClick={() => handleEbdDelete(item.title)} className="text-xs text-rose-200">Excluir</button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{item.leader}</p>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3">7 novos alunos confirmados este mes.</div>
          </CardContent>
        </Card>
      );
    }

    if (resolvedActiveTab === "biblioteca-historia") {
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
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => handleBookAdd()} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
                + Novo livro
              </button>
            </div>
            <div className="space-y-2">
              {filteredBooks.map((book) => (
                <div key={book.title} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-50">{book.title}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleBookEdit(book)} className="text-xs text-amber-200">Editar</button>
                      <button type="button" onClick={() => handleBookDelete(book.title)} className="text-xs text-rose-200">Excluir</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{book.author} - {book.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (resolvedActiveTab === "centro-doutrinas") {
      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button type="button" onClick={() => handleDoctrineAdd()} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              + Nova doutrina
            </button>
          </div>
          {doctrineCardsState.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.summary}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleDoctrineEdit(item)} className="text-xs text-amber-200">Editar</button>
                    <button type="button" onClick={() => handleDoctrineDelete(item.id)} className="text-xs text-rose-200">Excluir</button>
                  </div>
                </div>
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

    if (resolvedActiveTab === "scorecard-saude") {
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

    if (resolvedActiveTab === "liturgia-comunicacao") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Liturgia e comunicacao</CardTitle>
            <CardDescription>Checklist de culto e equipe de midia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <div className="space-y-2">
              {worshipChecklistItems.map((item) => (
                <div key={item.item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <span>{item.item}</span>
                  <Badge variant={item.status === "ok" ? "success" : "default"}>{item.status === "ok" ? "Concluido" : "Ajustar"}</Badge>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-dashed border-white/10 p-3">
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">Adicionar item</label>
              <input
                value={newWorshipItem}
                onChange={(event) => setNewWorshipItem(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                placeholder="Ex: PDF da letra de uma música"
              />
              <button
                type="button"
                className="mt-3 rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                onClick={() => {
                  if (!newWorshipItem.trim()) return;
                  setWorshipChecklistItems((current) => [...current, { item: newWorshipItem.trim(), status: "warn" }]);
                  setNewWorshipItem("");
                }}
              >
                Adicionar item
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (resolvedActiveTab === "relatorios-financeiros") {
      return (
        <div className="rounded-3xl border border-white/12 bg-white/4 p-4">
          <FinanceReportClient />
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de discipulado</CardTitle>
          <CardDescription>Fluxo de crescimento espiritual por etapa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-200">
          <div className="flex justify-end">
            <button type="button" onClick={() => handleDiscipleshipAdd()} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              + Nova etapa
            </button>
          </div>
          {discipleshipFlowState.map((item) => (
            <div key={item.stage} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <span>{item.stage}</span>
              <div className="flex items-center gap-2">
                <Badge variant="info">{item.count} pessoas</Badge>
                <button type="button" onClick={() => handleDiscipleshipEdit(item)} className="text-xs text-amber-200">Editar</button>
                <button type="button" onClick={() => handleDiscipleshipDelete(item.stage)} className="text-xs text-rose-200">Excluir</button>
              </div>
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
                Ecclesia One
              </p>
              <h1 className="truncate text-sm font-semibold text-slate-50 sm:text-base">
                Plataforma Ministerial Premium
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
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 md:flex">
              <div className="text-right">
                <p className="text-xs text-slate-400">{access.roleCodes[0] ?? "AUTENTICADO"}</p>
                <p className="text-sm font-medium text-slate-50">{access.fullName}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission(access.permissions, access.roleCodes, "system.manage" as PermissionKey) ? (
                  <a href="/configuracoes/permissoes" className="rounded-xl border border-amber-300/30 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-300/10">
                    Permissões
                  </a>
                ) : null}
                {hasPermission(access.permissions, access.roleCodes, "finance.read" as PermissionKey) ? (
                  <a href="/relatorios/financeiro" className="rounded-xl border border-emerald-300/30 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/10">
                    Relatórios
                  </a>
                ) : null}
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-4 pb-10 pt-4 sm:px-6 md:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden rounded-3xl border border-white/12 bg-slate-900/65 p-4 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.95)] backdrop-blur-xl md:block">
          <div className="space-y-2">
            {visibleNavItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.08 }}
                onClick={() => handleTabChange(item.key)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition hover:-translate-y-0.5 ${
                  resolvedActiveTab === item.key
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
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/62 p-[1px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(16,53,89,0.42),rgba(184,142,56,0.18),rgba(6,78,59,0.18))]" />
            <div className="relative rounded-[calc(1.5rem-1px)] bg-slate-950/88 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">Recepcao personalizada</Badge>
                <Badge variant="default">{roleWelcome.roleCode}</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                Bem-vindo, {greetingName}.
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">{roleWelcome.headline}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {roleWelcome.items.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedActiveTab}
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
                {visibleNavItems.map((item) => (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm ${
                      resolvedActiveTab === item.key
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
    </div>
  );
}
