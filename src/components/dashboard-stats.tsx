'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Music, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description?: string;
  trend?: number;
  color: 'amber' | 'violet' | 'indigo' | 'green' | 'rose';
}

const colorClasses = {
  amber: 'bg-amber-500/20 text-amber-300',
  violet: 'bg-violet-500/20 text-violet-300',
  indigo: 'bg-indigo-500/20 text-indigo-300',
  green: 'bg-green-500/20 text-green-300',
  rose: 'bg-rose-500/20 text-rose-300',
};

function StatCard({
  icon,
  label,
  value,
  description,
  trend,
  color,
}: StatCardProps) {
  return (
    <Card className="hover:border-amber-500/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400">{label}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mb-2">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-green-400" />
            <span className="text-green-300">{trend}% este mês</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats?: {
    totalMembers: number;
    membersThisMonth: number;
    totalEvents: number;
    upcomingEvents: number;
    totalMinistries: number;
    activeMinistries: number;
    attendanceRate: number;
  };
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-8 bg-slate-700 rounded mb-2 w-1/2" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats = {
    totalMembers: 0,
    membersThisMonth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalMinistries: 0,
    activeMinistries: 0,
    attendanceRate: 0,
  };

  const data = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Total de Membros"
        value={data.totalMembers}
        description={`+${data.membersThisMonth} este mês`}
        color="amber"
      />

      <StatCard
        icon={<Calendar className="h-5 w-5" />}
        label="Eventos"
        value={data.totalEvents}
        description={`${data.upcomingEvents} próximos`}
        color="violet"
      />

      <StatCard
        icon={<Music className="h-5 w-5" />}
        label="Ministérios"
        value={data.totalMinistries}
        description={`${data.activeMinistries} ativos`}
        color="indigo"
      />

      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Taxa de Presença"
        value={`${data.attendanceRate}%`}
        description="Média geral"
        color="green"
      />
    </div>
  );
}
