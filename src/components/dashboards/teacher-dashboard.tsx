
"use client"

import { useState, useEffect, useMemo } from 'react';
import { CalendarClock, Star, ShieldCheck } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageTitle } from "@/components/layout/page-title";
import { User, Schedule, Evaluation, Supervision, Subject, Teacher } from '@/lib/modelos';
import { getSchedules, getEvaluations, getSupervisions, getSubjects, getTeachers } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from './empty-state';
import { DashboardCard, CardSkeleton } from './dashboard-card';

interface TeacherDashboardProps {
  user: User;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, evaluationsData, supervisionsData, subjectsData] = await Promise.all([
          getSchedules(),
          getEvaluations(),
          getSupervisions(),
          getSubjects(),
        ]);
        setSchedules(schedulesData);
        setEvaluations(evaluationsData);
        setSupervisions(supervisionsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const teacherFullName = `${user.nombre} ${user.apellido_paterno}`.trim();
  const today = format(new Date(), 'EEEE', { locale: es });

  const teacherSchedulesToday = useMemo(() => {
    if (isLoading) return [];
    return schedules
      .filter(s => s.teacherId === user.id && s.dayOfWeek.toLowerCase() === today.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, user.id, today, isLoading]);

  const stats = useMemo(() => {
    const teacherEvaluations = evaluations.filter(e => e.teacherName === teacherFullName);
    const teacherSupervisions = supervisions.filter(s => s.teacher === teacherFullName && s.status === 'Completada');
    
    const avgEvaluationScore = teacherEvaluations.length > 0
      ? Math.round(teacherEvaluations.reduce((acc, e) => acc + e.overallRating, 0) / teacherEvaluations.length)
      : 0;

    const avgSupervisionScore = teacherSupervisions.length > 0
      ? Math.round(teacherSupervisions.reduce((acc, s) => acc + s.score!, 0) / teacherSupervisions.length)
      : 0;

    return { avgEvaluationScore, avgSupervisionScore };
  }, [evaluations, supervisions, teacherFullName]);
  
  const nextSupervision = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
     return supervisions.find(s => s.teacher === teacherFullName && s.status === 'Programada' && s.date && new Date(s.date) >= today);
  }, [supervisions, teacherFullName]);


  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || "Materia Desconocida";

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Panel de Docente</PageTitle>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {isLoading ? (
            <>
                <CardSkeleton />
                <CardSkeleton />
            </>
         ) : (
            <>
                <DashboardCard title="Evaluación de Alumnos" value={`${stats.avgEvaluationScore}%`} icon={Star} />
                <DashboardCard title="Calificación Supervisión" value={`${stats.avgSupervisionScore}%`} icon={ShieldCheck} />
            </>
         )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Clases de Hoy ({today})</CardTitle>
                    <CardDescription>Tu horario de clases para el día de hoy.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                         <div className='space-y-4'>
                            <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                            <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                        </div>
                     ) : teacherSchedulesToday.length > 0 ? (
                        <ul className="space-y-4">
                            {teacherSchedulesToday.map(schedule => (
                                <li key={schedule.id} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                                    <div className="text-center w-20">
                                        <p className="font-mono text-sm text-primary">{schedule.startTime}</p>
                                        <p className="font-mono text-xs text-muted-foreground">{schedule.endTime}</p>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{getSubjectName(schedule.subjectId)}</p>
                                        <p className="text-sm text-muted-foreground">Grupo: {schedule.groupName}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState title="No hay clases hoy" message="No tienes clases programadas para hoy." icon={CalendarClock} />
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card className="rounded-xl h-full">
                <CardHeader>
                    <CardTitle>Próxima Supervisión</CardTitle>
                    <CardDescription>Tu siguiente supervisión agendada.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
                    ) : nextSupervision ? (
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <p className="text-lg font-bold text-primary">{nextSupervision.date ? format(new Date(nextSupervision.date), "PPP", { locale: es }) : 'Fecha no definida'}</p>
                            <p className="text-md text-white font-mono mt-1">{nextSupervision.startTime} - {nextSupervision.endTime}</p>
                            <p className="text-sm text-muted-foreground mt-2">Coordinador: {nextSupervision.coordinator}</p>
                        </div>
                    ) : (
                         <EmptyState title="Sin Supervisiones" message="No tienes supervisiones programadas próximamente." icon={ShieldCheck} />
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
