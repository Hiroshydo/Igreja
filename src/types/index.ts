/**
 * Tipos TypeScript para o projeto Comunidade Viva
 */

export type SystemRoleCode =
  | 'DEV'
  | 'PASTOR'
  | 'CORPO_ECLESIASTICO'
  | 'TESOURARIA'
  | 'MIDIA'
  | 'MUSICOS'
  | 'MEMBROS'
  | 'VISITANTES';

export type PermissionResource =
  | 'dashboard'
  | 'members'
  | 'pastors'
  | 'departments'
  | 'congregations'
  | 'ministries'
  | 'events'
  | 'schedules'
  | 'finance'
  | 'prayer_requests'
  | 'announcements'
  | 'media'
  | 'music'
  | 'education'
  | 'library'
  | 'doctrine'
  | 'pastoral_care'
  | 'worship'
  | 'discipleship'
  | 'system';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'export' | 'manage';

export type PermissionKey = `${PermissionResource}.${PermissionAction}`;

export interface AccessContext {
  userId: string;
  email: string | null;
  fullName: string;
  congregationId: string | null;
  roleCodes: string[];
  permissions: string[];
}

export interface AuthenticatedAppUser {
  id: string;
  email: string | null;
  fullName: string;
  congregationId: string | null;
  roleCodes: string[];
  permissions: string[];
}

export interface Member {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  joinDate: string;
  status: 'ativo' | 'inativo' | 'pendente';
  role?: string;
  avatar?: string;
  ministry?: string;
  lastVisit?: string;
}

export interface Event {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: 'culto' | 'reuniao' | 'evento' | 'estudo' | 'outro';
  attendees?: number;
  image?: string;
  organizer?: string;
}

export interface Ministry {
  id: string | number;
  name: string;
  description: string;
  leader: string;
  leaderEmail?: string;
  leaderPhone?: string;
  members: number;
  category: string;
  image?: string;
  meetingDay?: string;
  meetingTime?: string;
}

export interface FinanceAccount {
  id: string;
  congregationId: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceCategory {
  id: string;
  congregationId: string;
  code: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceTransaction {
  id: string;
  congregationId: string;
  accountId: string;
  type: 'receita' | 'despesa';
  category: string;
  amount: number;
  occurredAt: string;
  description?: string | null;
  origin?: string | null;
  reference?: string | null;
  documentReference?: string | null;
  observations?: string | null;
  eventId?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  account?: {
    name: string;
    category: string;
  } | null;
}

export interface FinanceMovementInput {
  accountId?: string;
  congregationId?: string;
  type: 'receita' | 'despesa';
  category: string;
  amount: number | string;
  occurredAt: string;
  description?: string;
  origin?: string;
  reference?: string;
  documentReference?: string;
  observations?: string;
  eventId?: string;
}

export interface FinanceSummaryReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  movementCount: number;
  topCategories: Array<{ category: string; total: number; count: number }>;
  topCongregations: Array<{ congregationId: string; total: number }>; 
  topOrigins: Array<{ origin: string; total: number }>; 
  eventsWithMovement: Array<{ eventId: string; total: number }>;
}

export interface DashboardStats {
  totalMembers: number;
  membersThisMonth: number;
  totalEvents: number;
  upcomingEvents: number;
  totalMinistries: number;
  activeMinistries: number;
  attendanceRate: number;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  details?: unknown;
}

export type ApiRequest<T> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: T;
  headers?: Record<string, string>;
};
