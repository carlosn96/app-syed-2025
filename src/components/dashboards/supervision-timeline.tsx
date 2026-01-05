"use client"

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Supervision } from '@/lib/modelos';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';

interface SupervisionTimelineProps {
  supervisions: Supervision[];
  isLoading?: boolean;
}

export function SupervisionTimeline({ supervisions, isLoading }: SupervisionTimelineProps) {
  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-background">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-background">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Supervisiones
            </CardTitle>
            <CardDescription>Agenda de supervisiones programadas</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/supervision">Ver todas</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {supervisions.length > 0 ? (
          <div className="relative space-y-4">
            {/* Línea de tiempo vertical */}
            <div className="absolute left-[29px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            
            {supervisions.map((supervision, index) => {
              const isPending = supervision.status === 'Programada';
              const isCompleted = supervision.status === 'Completada';
              
              return (
                <div
                  key={supervision.id}
                  className={cn(
                    "relative pl-16 group animate-in fade-in-50 slide-in-from-left-5",
                    "hover:bg-muted/30 -ml-4 pl-20 pr-4 py-3 rounded-lg transition-colors"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {/* Punto en la línea de tiempo */}
                  <div className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    isPending && "bg-primary/20 text-primary",
                    isCompleted && "bg-success/20 text-success"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Fecha destacada */}
                      <div className="flex items-center gap-3">
                        <Badge variant={isPending ? "default" : "secondary"} className="font-mono">
                          {supervision.date ? format(supervision.date, "dd MMM yyyy", { locale: es }) : "Sin fecha"}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {supervision.startTime} - {supervision.endTime}
                        </span>
                      </div>

                      {/* Información del docente */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{supervision.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{supervision.career}</span>
                        </div>
                      </div>

                      {/* Puntuación si está completada */}
                      {isCompleted && supervision.score !== undefined && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          Calificación: {supervision.score}%
                        </Badge>
                      )}
                    </div>

                    {/* Acción */}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link href={`/supervision/${supervision.id}`}>
                        Ver detalles →
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No hay supervisiones programadas"
            message="No tienes ninguna supervisión pendiente en tu agenda."
            icon={Calendar}
            action={
              <Button asChild>
                <Link href="/supervision">Programar supervisión</Link>
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
