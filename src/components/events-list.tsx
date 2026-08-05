'use client';

import React from 'react';
import { Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
}

export function EventsList({ events, isLoading }: EventsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-6 bg-slate-700 rounded mb-4 w-1/3" />
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-400">Nenhum evento cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'culto':
        return 'bg-violet-500/20 text-violet-300';
      case 'reuniao':
        return 'bg-blue-500/20 text-blue-300';
      case 'evento':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'estudo':
        return 'bg-amber-500/20 text-amber-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className={`hover:border-amber-500/50 transition-colors ${
            isUpcoming(event.date) ? 'border-amber-500/30' : 'opacity-70'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{event.title}</CardTitle>
                {event.description && (
                  <CardDescription className="text-xs mt-1">{event.description}</CardDescription>
                )}
              </div>
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>

            {event.attendees && (
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="h-4 w-4" />
                <span>{event.attendees} presentes</span>
              </div>
            )}

            {event.organizer && (
              <div className="text-xs text-slate-400">
                Organizador: <span className="text-slate-300">{event.organizer}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
