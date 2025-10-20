
"use client"

import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, CalendarClock, User, BookUser } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from '@/context/auth-context';
import { Supervision } from '@/lib/modelos';
import { getSupervisions } from '@/services/api';
import { DashboardCard, CardSkeleton } from './dashboard-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from './empty-state';

export function CoordinatorDashboard() {
  const { user } = useAuth();
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Panel de Coordinador
      </h1>
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
    </div>
  );
}
