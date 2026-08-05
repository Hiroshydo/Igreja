'use client';

import React from 'react';
import { Ministry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

interface MinistriesGridProps {
  ministries: Ministry[];
  isLoading?: boolean;
}

export function MinistriesGrid({ ministries, isLoading }: MinistriesGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-6 bg-slate-700 rounded mb-4" />
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!ministries || ministries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-400">Nenhum ministério cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ministries.map((ministry) => (
        <Card key={ministry.id} className="hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{ministry.name}</CardTitle>
                <CardDescription className="text-xs">{ministry.category}</CardDescription>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300">{ministry.members}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {ministry.description && (
              <p className="text-slate-300 text-xs leading-relaxed">{ministry.description}</p>
            )}

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Líder: {ministry.leader}</span>
              </div>

              {ministry.leaderEmail && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Mail className="h-3 w-3" />
                  <span>{ministry.leaderEmail}</span>
                </div>
              )}

              {ministry.leaderPhone && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Phone className="h-3 w-3" />
                  <span>{ministry.leaderPhone}</span>
                </div>
              )}

              {ministry.meetingDay && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Reunião {ministry.meetingDay}
                    {ministry.meetingTime && ` às ${ministry.meetingTime}`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
