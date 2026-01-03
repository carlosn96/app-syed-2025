
"use client"

import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, CalendarClock, User, BookUser, BookCopy, Search } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { normalizeString } from '@/lib/utils';

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
    return {
      scheduledCount: scheduled.length,
      avgScore,
    };
  }, [supervisions]);
  
  const upcomingSupervisions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return supervisions
        .filter(s => s.date && new Date(s.date) >= today && s.status === 'Programada')
        .sort((a,b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .slice(0, 5);
  }, [supervisions]);


  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Panel de Coordinador</PageTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {isLoading ? (
            <>
                <CardSkeleton />
                <CardSkeleton />
            </>
         ) : (
            <>
                <DashboardCard title="Supervisiones Programadas" value={stats.scheduledCount} icon={CalendarClock} />
                <DashboardCard title="Rendimiento Promedio" value={`${stats.avgScore}%`} icon={ShieldCheck} />
            </>
         )}
      </div>

       <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Próximas Supervisiones</CardTitle>
                <CardDescription>Las 5 supervisiones más cercanas en tu agenda.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-4'>
                        <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                ) : upcomingSupervisions.length > 0 ? (
                    <ul className="space-y-4">
                        {upcomingSupervisions.map(s => (
                            <li key={s.id} className="flex items-start gap-4 p-3 bg-black/20 rounded-lg">
                                <div className="flex flex-col items-center justify-center p-2 bg-primary/20 rounded-md h-full">
                                    <span className="text-xs font-bold text-primary uppercase">{s.date ? format(s.date, 'MMM', { locale: es }) : ''}</span>
                                    <span className="text-lg font-bold text-white">{s.date ? format(s.date, 'dd') : ''}</span>
                                </div>
                                <div className='flex-grow'>
                                    <p className="font-semibold text-sm">{s.teacher}</p>
                                    <p className="text-xs text-muted-foreground">{s.career}</p>
                                    <p className="text-xs text-primary/80 font-mono mt-1">{s.startTime} - {s.endTime}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState title="No hay supervisiones próximas" message="No tienes citas de supervisión programadas en el futuro." icon={CalendarClock} />
                )}
            </CardContent>
        </Card>

        {/* Sección Mis Carreras */}
        <Card className="rounded-xl">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Mis Carreras</CardTitle>
                        <CardDescription>Carreras asignadas a tu coordinación.</CardDescription>
                    </div>
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
                </div>
            </CardHeader>
            <CardContent>
                {careersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                    </div>
                ) : filteredCareers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCareers.map(career => (
                            <Card key={career.id} className="flex flex-col bg-black/20 border-border/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{career.name}</CardTitle>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-2">
                                    <Button asChild variant="success" size="sm" className="w-full">
                                        <Link href={`/plan-estudio/${career.id}`}>
                                            <BookCopy className="mr-2 h-4 w-4" />
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
                    />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
