
"use client"

import { useState, useEffect, useMemo } from 'react';
import { CalendarClock, BookUser } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Schedule, EvaluationPeriod, Teacher } from '@/lib/modelos';
import { getSchedules, getEvaluationPeriods, getSubjects, getTeachers } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from './empty-state';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Button } from '../ui/button';

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, periodsData, subjectsData, teachersData] = await Promise.all([
          getSchedules(),
          getEvaluationPeriods(),
          getSubjects(),
          getTeachers(),
        ]);
        setSchedules(schedulesData);
        setEvaluationPeriods(periodsData);
        setSubjects(subjectsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = format(new Date(), 'EEEE', { locale: es });
  const studentSchedulesToday = useMemo(() => {
    if (!user.grupo) return [];
    return schedules
      .filter(s => s.groupName === user.grupo && s.dayOfWeek.toLowerCase() === today.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, user.grupo, today]);
  
  const activeEvaluationPeriod = useMemo(() => {
      const today = new Date();
      return evaluationPeriods.find(p => today >= new Date(p.startDate!) && today <= new Date(p.endDate!));
  }, [evaluationPeriods]);

  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || "Materia Desconocida";
  const getTeacherName = (id: number) => teachers.find(t => t.id === id)?.name || "Docente Desconocido";

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Bienvenido, {user.nombre}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Clases de Hoy ({today})</CardTitle>
                    <CardDescription>Tu horario para el día de hoy.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                         <div className='space-y-4'>
                            <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                            <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                        </div>
                     ) : studentSchedulesToday.length > 0 ? (
                        <ul className="space-y-4">
                            {studentSchedulesToday.map(schedule => (
                                <li key={schedule.id} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                                    <div className="text-center w-20">
                                        <p className="font-mono text-sm text-primary">{schedule.startTime}</p>
                                        <p className="font-mono text-xs text-muted-foreground">{schedule.endTime}</p>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{getSubjectName(schedule.subjectId)}</p>
                                        <p className="text-sm text-muted-foreground">{getTeacherName(schedule.teacherId)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState title="No hay clases hoy" message="Disfruta tu día libre o aprovecha para estudiar." icon={CalendarClock} />
                    )}
                </CardContent>
            </Card>
        </div>
        <div className='lg:col-span-1'>
             <Card className="rounded-xl h-full">
                <CardHeader>
                    <CardTitle>Evaluación Docente</CardTitle>
                    <CardDescription>Tu opinión es importante para mejorar.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                         <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
                     ) : activeEvaluationPeriod ? (
                        <div className="text-center p-4 bg-success/10 rounded-lg">
                            <h3 className="font-semibold text-success">{activeEvaluationPeriod.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">El periodo de evaluación está activo.</p>
                             <p className="text-xs text-muted-foreground mt-2">
                                Finaliza el {format(new Date(activeEvaluationPeriod.endDate!), "PPP", { locale: es })}
                            </p>
                        </div>
                    ) : (
                        <EmptyState title="Periodo Inactivo" message="No hay periodos de evaluación activos en este momento." icon={BookUser} />
                    )}
                </CardContent>
                {activeEvaluationPeriod && (
                     <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/evaluations">
                                <BookUser className="mr-2 h-4 w-4" />
                                Ir a Evaluar
                            </Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
