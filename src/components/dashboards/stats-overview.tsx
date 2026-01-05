"use client"

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Target, Award, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Supervision } from '@/lib/modelos';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  supervisions: Supervision[];
  isLoading?: boolean;
}

export function StatsOverview({ supervisions, isLoading }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const total = supervisions.length;
    const completed = supervisions.filter(s => s.status === 'Completada');
    const pending = supervisions.filter(s => s.status === 'Programada');
    const completedCount = completed.length;
    const pendingCount = pending.length;
    
    const completedWithScore = completed.filter(s => s.score !== undefined);
    const avgScore = completedWithScore.length > 0 
      ? Math.round(completedWithScore.reduce((acc, s) => acc + s.score!, 0) / completedWithScore.length)
      : 0;
    
    const highScores = completedWithScore.filter(s => s.score! >= 90).length;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    // Calcular tendencia (simulada - en producción vendría del backend)
    const trend = avgScore >= 75 ? 'positive' : avgScore >= 60 ? 'neutral' : 'negative';
    
    return {
      total,
      completedCount,
      pendingCount,
      avgScore,
      highScores,
      completionRate,
      trend
    };
  }, [supervisions]);

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Resumen de Rendimiento
            </CardTitle>
            <CardDescription>Análisis de supervisiones y métricas clave</CardDescription>
          </div>
          <Badge 
            variant={stats.trend === 'positive' ? 'default' : stats.trend === 'neutral' ? 'secondary' : 'destructive'}
            className="animate-in fade-in-50 zoom-in-50"
          >
            {stats.trend === 'positive' ? (
              <><TrendingUp className="h-3 w-3 mr-1" /> Excelente</>
            ) : stats.trend === 'neutral' ? (
              <><Activity className="h-3 w-3 mr-1" /> Regular</>
            ) : (
              <><TrendingDown className="h-3 w-3 mr-1" /> Requiere atención</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Puntuación Promedio */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 animate-in fade-in-50 slide-in-from-bottom-3" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Puntuación Promedio</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.avgScore}%</div>
              <Progress 
                value={stats.avgScore} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.avgScore >= 90 ? 'Excelente desempeño' : 
                 stats.avgScore >= 75 ? 'Muy buen desempeño' :
                 stats.avgScore >= 60 ? 'Desempeño aceptable' :
                 'Requiere mejora'}
              </p>
            </div>
          </div>

          {/* Tasa de Completitud */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-success/10 to-transparent border border-success/20 animate-in fade-in-50 slide-in-from-bottom-3" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/20">
                  <Target className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Tasa de Completitud</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <Progress 
                value={stats.completionRate} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.completedCount} de {stats.total} completadas
              </p>
            </div>
          </div>

          {/* Supervisiones Pendientes */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-warning/10 to-transparent border border-warning/20 animate-in fade-in-50 slide-in-from-bottom-3" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/20">
                  <CalendarIcon className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Pendientes</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.pendingCount}</div>
              <div className={cn(
                "text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium",
                stats.pendingCount > 5 ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
              )}>
                {stats.pendingCount > 5 ? '⚠️ Alta carga' : '✓ Bajo control'}
              </div>
              <p className="text-xs text-muted-foreground">
                Supervisiones por realizar
              </p>
            </div>
          </div>

          {/* Evaluaciones Excelentes */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 animate-in fade-in-50 slide-in-from-bottom-3" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Award className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Excelentes</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.highScores}</div>
              <div className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium bg-accent/20 text-accent">
                🏆 ≥ 90%
              </div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones sobresalientes
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
