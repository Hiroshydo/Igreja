/**
 * Tipos TypeScript para o projeto Comunidade Viva
 */

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
}

export type ApiRequest<T> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: T;
  headers?: Record<string, string>;
};
