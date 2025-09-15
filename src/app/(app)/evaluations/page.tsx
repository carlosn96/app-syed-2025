
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEvaluationPeriodForm } from "@/components/create-evaluation-period-form"
import { EvaluationPeriod, Teacher, Schedule } from "@/lib/modelos"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FloatingButton } from "@/components/ui/floating-button"
import { useAuth } from "@/context/auth-context"
import { Pencil, FilePenLine } from "lucide-react"
import Link from "next/link"
import { getEvaluationPeriods, getSchedules, getTeachers } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function EvaluationsPage() {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriod[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [periodsData, schedulesData, teachersData] = await Promise.all([
            getEvaluationPeriods(),
            getSchedules(),
            getTeachers()
        ]);
        setEvaluationPeriods(periodsData.map(p => ({ ...p, startDate: new Date(p.startDate!), endDate: new Date(p.endDate!) })));
        setSchedules(schedulesData);
        setAllTeachers(teachersData);
    } catch(err: any) {
        setError(err.message || 'Error al cargar los datos');
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const periodsByDate = useMemo(() => {
    const map = new Map<string, EvaluationPeriod[]>()
    evaluationPeriods.forEach(p => {
      let day = new Date(p.startDate!);
      let endDate = new Date(p.endDate!);
      let limit = 0;
      while (day <= endDate && limit < 365) {
        const dateKey = format(day, "yyyy-MM-dd");
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        if (!map.get(dateKey)!.find(existing => existing.id === p.id)) {
            map.get(dateKey)!.push(p);
        }
        day.setDate(day.getDate() + 1);
        limit++;
      }
    });
    return map;
  }, [evaluationPeriods]);


  const upcomingPeriods = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return evaluationPeriods
        .filter(p => new Date(p.endDate!) >= today)
        .sort((a,b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
        .slice(0, 5);
  }, [evaluationPeriods]);

  const getStatus = (period: EvaluationPeriod) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date(period.startDate!);
    const endDate = new Date(period.endDate!);
    if (today < startDate) return { text: 'Programado', variant: 'warning' as const };
    if (today > endDate) return { text: 'Finalizado', variant: 'destructive' as const };
    return { text: 'Activo', variant: 'success' as const };
  }

  const studentTeachers = useMemo(() => {
      if (user?.rol !== 'alumno' || !user.grupo) return [];
      
      const studentGroup = user.grupo;
      const groupSchedules = schedules.filter(s => s.groupName === studentGroup);
      const teacherIds = [...new Set(groupSchedules.map(s => s.teacherId))];
      
      return allTeachers.filter(t => teacherIds.includes(t.id));
  }, [user, schedules, allTeachers]);

  const activeEvaluationPeriod = useMemo(() => {
      const today = new Date();
      return evaluationPeriods.find(p => today >= new Date(p.startDate!) && today <= new Date(p.endDate!));
  }, [evaluationPeriods]);

  if (error) {
    return <p className="text-destructive text-center">{error}</p>
  }
  
  if (user?.rol === 'alumno') {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
              Evaluación Docente
            </h1>
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Evalúa a tus Docentes</CardTitle>
                    {activeEvaluationPeriod ? (
                       <CardDescription>
                            El periodo de evaluación <span className="text-primary font-semibold">{activeEvaluationPeriod.name}</span> está activo. Por favor, completa la evaluación para cada uno de tus docentes.
                       </CardDescription>
                    ) : (
                         <CardDescription>
                            Actualmente no hay ningún periodo de evaluación activo.
                       </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                   {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                   ) : activeEvaluationPeriod ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentTeachers.map(teacher => (
                            <Card key={teacher.id} className="bg-black/10">
                                <CardHeader>
                                    <CardTitle className="text-base">{teacher.name}</CardTitle>
                                </CardHeader>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/evaluations/${teacher.id}`}>
                                            <FilePenLine className="mr-2 h-4 w-4" />
                                            Evaluar
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                   ) : (
                    <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted rounded-xl">
                        <p className="text-muted-foreground">Vuelve más tarde para evaluar a tus docentes.</p>
                    </div>
                   )}
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Agenda de Evaluaciones
        </h1>
        {user?.rol === 'coordinador' && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <FloatingButton text="Crear Periodo" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Periodo de Evaluación</DialogTitle>
                <DialogDescription>
                  Completa el formulario para agendar un nuevo periodo de evaluación docente.
                </DialogDescription>
              </DialogHeader>
              <CreateEvaluationPeriodForm 
                  onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2"><Skeleton className="h-[380px] w-full" /></div>
            <div className="lg:col-span-1"><Skeleton className="h-[380px] w-full" /></div>
        </div>
      ) : (
       <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="rounded-xl flex flex-col h-full">
                 <CardContent className="p-0 flex-grow">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-full h-full"
                        modifiers={{
                            active: Array.from(periodsByDate.keys()).map(d => new Date(d + 'T00:00:00'))
                        }}
                        modifiersClassNames={{
                            active: 'bg-primary/20 text-primary-foreground border-2 border-transparent hover:border-primary'
                        }}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card className="rounded-xl h-full">
                <CardHeader>
                    <CardTitle>Próximos Periodos</CardTitle>
                    <CardDescription>Los 5 periodos más cercanos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingPeriods.length > 0 ? (
                        <ul className="space-y-4">
                            {upcomingPeriods.map(p => (
                                <li key={p.id} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center justify-center p-2 bg-primary/20 rounded-md">
                                        <span className="text-xs font-bold text-primary uppercase">{format(new Date(p.startDate!), 'MMM', { locale: es })}</span>
                                        <span className="text-lg font-bold text-white">{format(new Date(p.startDate!), 'dd')}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.careers.length} carreras</p>
                                        <p className="text-xs text-primary/80 font-mono">
                                            {format(new Date(p.startDate!), 'P')} - {format(new Date(p.endDate!), 'P')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay periodos próximos.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      )}

      <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Historial de Periodos</CardTitle>
                <CardDescription>Periodos de evaluación programados y finalizados.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <Skeleton className="h-40 w-full" />
              ) : (
                <ScrollArea className="h-auto max-h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Periodo</TableHead>
                                <TableHead>Fecha de Inicio</TableHead>
                                <TableHead>Fecha de Fin</TableHead>
                                <TableHead>Carreras</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {evaluationPeriods.map((period) => {
                                const status = getStatus(period);
                                return (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium py-3">{period.name}</TableCell>
                                        <TableCell className="py-3">{format(new Date(period.startDate!), "P", { locale: es })}</TableCell>
                                        <TableCell className="py-3">{format(new Date(period.endDate!), "P", { locale: es })}</TableCell>
                                        <TableCell className="py-3">{period.careers.join(', ')}</TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={status.variant}>
                                                {status.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="warning">
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
              )}
            </CardContent>
        </Card>
    </div>
  )
}
