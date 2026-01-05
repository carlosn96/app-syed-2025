
"use client"

import { useState, useEffect, useMemo } from 'react';
import { BookCopy, Search, Sparkles, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from "@/components/layout/page-title";
import { useAuth } from '@/context/auth-context';
import { Supervision, CareerSummary } from '@/lib/modelos';
import { getSupervisions, getCarrerasForCoordinador } from '@/services/api';
import { DashboardCard, CardSkeleton } from './dashboard-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from './empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizeString, cn } from '@/lib/utils';
import { QuickActions } from './quick-actions';
import { SupervisionTimeline } from './supervision-timeline';
import { StatsOverview } from './stats-overview';

export function CoordinatorDashboard() {
  const { user } = useAuth();
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [careerSearchTerm, setCareerSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const allSupervisions = await getSupervisions();
        const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
        const coordinatorSupervisions = allSupervisions.filter(s => s.coordinator === coordinatorName);
        setSupervisions(coordinatorSupervisions);
      } catch (error) {
        console.error("Error fetching coordinator dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setCareersLoading(true);
        const careersData = await getCarrerasForCoordinador();
        setCareers(Array.isArray(careersData) ? careersData : [careersData]);
      } catch (error) {
        console.error("Error fetching careers:", error);
      } finally {
        setCareersLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const filteredCareers = useMemo(() => {
    if (!careerSearchTerm) return careers;
    const normalizedSearchTerm = normalizeString(careerSearchTerm);
    return careers.filter(career => {
      const name = normalizeString(career.name);
      return name.includes(normalizedSearchTerm);
    });
  }, [careers, careerSearchTerm]);

  const stats = useMemo(() => {
    const scheduled = supervisions.filter(s => s.status === 'Programada');
    const completed = supervisions.filter(s => s.status === 'Completada' && s.score !== undefined);
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((acc, s) => acc + s.score!, 0) / completed.length) : 0;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthSupervisions = supervisions.filter(s => {
      if (!s.date) return false;
      const date = new Date(s.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    return {
      scheduledCount: scheduled.length,
      avgScore,
      thisMonthCount: thisMonthSupervisions.length,
    };
  }, [supervisions, careers]);
  
  const upcomingSupervisions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return supervisions
        .filter(s => s.date && new Date(s.date) >= today && s.status === 'Programada')
        .sort((a,b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .slice(0, 5);
  }, [supervisions]);


  return (
    <div className="flex flex-col gap-6">
      {/* Header con animación */}
      <div className={cn(
        !isLoading && "animate-in fade-in-50 slide-in-from-top-5 duration-700"
      )}>
        <PageTitle>Panel de Coordinador</PageTitle>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Bienvenido, gestiona tus supervisiones y carreras de forma eficiente
        </p>
      </div>

      {/* Acciones Rápidas */}
      <div className={cn(
        !isLoading && "animate-in fade-in-50 slide-in-from-top-6 duration-700"
      )} style={!isLoading ? { animationDelay: '100ms', animationFillMode: 'backwards' } : {}}>
        <QuickActions isLoading={isLoading} />
      </div>

      {/* Estadísticas principales - Cards mejoradas */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        !isLoading && "animate-in fade-in-50 slide-in-from-top-7 duration-700"
      )} style={!isLoading ? { animationDelay: '200ms', animationFillMode: 'backwards' } : {}}>
         {isLoading ? (
            <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </>
         ) : (
            <>
                <DashboardCard 
                  title="Supervisiones Programadas" 
                  value={stats.scheduledCount} 
                  icon={GraduationCap}
                  description="Próximas visitas"
                  href="/supervision"
                  gradient
                  trend={{
                    value: 12,
                    isPositive: true
                  }}
                />
                <DashboardCard 
                  title="Rendimiento Promedio" 
                  value={`${stats.avgScore}%`} 
                  icon={TrendingUp}
                  description="Calificación general"
                  gradient
                  trend={{
                    value: 5,
                    isPositive: stats.avgScore >= 75
                  }}
                />
                <DashboardCard 
                  title="Este Mes" 
                  value={stats.thisMonthCount} 
                  icon={GraduationCap}
                  description="Supervisiones programadas"
                />
            </>
         )}
      </div>

      {/* Resumen de Rendimiento */}
      <div className={cn(
        !isLoading && "animate-in fade-in-50 slide-in-from-bottom-5 duration-700"
      )} style={!isLoading ? { animationDelay: '300ms', animationFillMode: 'backwards' } : {}}>
        <StatsOverview supervisions={supervisions} isLoading={isLoading} />
      </div>

      {/* Timeline de Supervisiones */}
      <div className={cn(
        !isLoading && "animate-in fade-in-50 slide-in-from-bottom-6 duration-700"
      )} style={!isLoading ? { animationDelay: '400ms', animationFillMode: 'backwards' } : {}}>
        <SupervisionTimeline 
          supervisions={upcomingSupervisions} 
          isLoading={isLoading}
        />
      </div>

       {/* Sección Mis Carreras - Rediseñada */}
        <Card className={cn(
          "rounded-xl overflow-hidden",
          !careersLoading && "animate-in fade-in-50 slide-in-from-bottom-7 duration-700"
        )} style={!careersLoading ? { animationDelay: '500ms', animationFillMode: 'backwards' } : {}}>
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookCopy className="h-5 w-5 text-primary" />
                          Mis Carreras
                        </CardTitle>
                        <CardDescription>Carreras asignadas a tu coordinación ({careers.length})</CardDescription>
                    </div>
                    {!careersLoading && (
                      <div className="relative w-full sm:max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                              type="search"
                              placeholder="Buscar carreras..."
                              className="pl-9 w-full"
                              value={careerSearchTerm}
                              onChange={(e) => setCareerSearchTerm(e.target.value)}
                          />
                      </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {careersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({length: 3}).map((_, i) => (
                          <div key={i} className="flex flex-col p-6 rounded-xl bg-muted/50 space-y-3">
                            <div className="flex items-start gap-3">
                              <Skeleton className="h-9 w-9 rounded-lg" />
                              <Skeleton className="h-5 w-40 flex-1" />
                            </div>
                            <Skeleton className="h-9 w-full rounded-full" />
                          </div>
                        ))}
                    </div>
                ) : filteredCareers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCareers.map((career, index) => (
                            <Card 
                              key={career.id} 
                              className={cn(
                                "flex flex-col bg-gradient-to-br from-primary/5 to-background border-primary/20",
                                "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300",
                                "animate-in fade-in-50 slide-in-from-bottom-5"
                              )}
                              style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-lg bg-primary/20">
                                        <BookCopy className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <CardTitle className="text-base leading-tight">{career.name}</CardTitle>
                                      </div>
                                    </div>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-2">
                                    <Button asChild variant="default" size="sm" className="w-full group">
                                        <Link href={`/plan-estudio/${career.id}`}>
                                            <BookCopy className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                            Ver Planes de Estudio
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="No se encontraron carreras" 
                        message="No tienes carreras asignadas o no hay resultados para tu búsqueda." 
                        icon={BookCopy}
                        action={
                          <Button asChild variant="outline">
                            <Link href="/carreras">Explorar carreras</Link>
                          </Button>
                        }
                    />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
