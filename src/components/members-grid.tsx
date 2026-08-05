'use client';

import React from 'react';
import { Member } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface MembersGridProps {
  members: Member[];
  isLoading?: boolean;
}

export function MembersGrid({ members, isLoading }: MembersGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-12 bg-slate-700 rounded mb-4" />
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-400">Nenhum membro cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500/20 text-green-300';
      case 'inativo':
        return 'bg-slate-500/20 text-slate-300';
      case 'pendente':
        return 'bg-amber-500/20 text-amber-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:border-amber-500/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{member.name}</CardTitle>
                <CardDescription className="text-xs">{member.email}</CardDescription>
              </div>
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {member.phone && (
              <div>
                <span className="text-slate-400">Telefone: </span>
                <span>{member.phone}</span>
              </div>
            )}
            {member.role && (
              <div>
                <span className="text-slate-400">Cargo: </span>
                <span>{member.role}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Membro desde: </span>
              <span>{new Date(member.joinDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
