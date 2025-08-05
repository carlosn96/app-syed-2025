
"use client"

import { useParams } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from "recharts"
import { Star, ShieldCheck, BookUser, Library } from "lucide-react"
import React, { useMemo, useState } from "react"

import {
  users,
  supervisions,
  evaluations,
  subjects as allSubjects,
  schedules,
  groups as allGroups,
} from "@/lib/data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProgressRing } from "@/components/ui/progress-ring"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

const getScoreColor = (score: number) => {
  if (score < 60) return 'hsl(var(--destructive))';
  if (score < 80) return 'hsl(var(--warning))';
  return 'hsl(var(--success))'; 
};

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    const color = getScoreColor(payload.Calificación);

    return (
        <Dot
            cx={cx}
            cy={cy}
            r={5}
            strokeWidth={2}
            fill="#fff"
            stroke={color}
        />
    );
};

export default function PalpaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'supervisions' | 'evaluations' | 'subjects'>('supervisions');

  const teacherData = useMemo(() => {
    if (!user || user.rol !== "teacher") return null;

    const teacherFullName = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.trim()

    const teacherSupervisions = supervisions.filter(
      (s) => s.teacher === teacherFullName
    );
    const teacherEvaluations = evaluations.filter(
      (e) => e.teacherName === teacherFullName
    );
    
    const teacherSchedules = schedules.filter(s => s.teacherId === user.id);
    const subjectIds = [...new Set(teacherSchedules.map(s => s.subjectId))];
    const teacherSubjects = allSubjects.filter(s => subjectIds.includes(s.id));
    
    const completedSupervisions = teacherSupervisions.filter(s => s.status === 'Completada' && s.score !== undefined);

    const supervisionPerformanceData = completedSupervisions
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))
      .map(s => ({
        date: s.date ? format(s.date, "dd/MM/yy") : 'N/A',
        Calificación: s.score,
      }));

    const averageSupervisionScore = completedSupervisions.length > 0 
      ? Math.round(completedSupervisions.reduce((acc, s) => acc + s.score!, 0) / completedSupervisions.length)
      : 0;
      
    const averageEvaluationScore = teacherEvaluations.length > 0
        ? Math.round(teacherEvaluations.reduce((acc, e) => acc + e.overallRating, 0) / teacherEvaluations.length)
        : 0;

    const sortedEvaluations = teacherEvaluations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulativeSum = 0;
    const evaluationPerformanceData = sortedEvaluations.map((e, index) => {
        cumulativeSum += e.overallRating;
        return {
            date: format(new Date(e.date), "dd/MM/yy"),
            Calificación: Math.round(cumulativeSum / (index + 1)),
        };
    });

     const evaluationsByGroup = teacherEvaluations.reduce((acc, evaluation) => {
        const groupName = evaluation.groupName || 'Grupo Desconocido';
        if (!acc[groupName]) {
            acc[groupName] = { evaluations: [], averageRating: 0 };
        }
        acc[groupName].evaluations.push(evaluation);
        return acc;
    }, {} as Record<string, { evaluations: typeof teacherEvaluations, averageRating: number }>);

    Object.keys(evaluationsByGroup).forEach(groupName => {
        const group = evaluationsByGroup[groupName];
        const totalRating = group.evaluations.reduce((sum, e) => sum + e.overallRating, 0);
        group.averageRating = Math.round(totalRating / group.evaluations.length);
    });

    return {
      teacher: user,
      teacherFullName,
      teacherSupervisions,
      teacherEvaluations,
      teacherSubjects,
      supervisionPerformanceData,
      averageSupervisionScore,
      averageEvaluationScore,
      evaluationPerformanceData,
      evaluationsByGroup,
    }
  }, [user]);

  if (!user || user.rol !== "teacher") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Esta sección solo está disponible para docentes.</p>
      </div>
    )
  }
  
  if (!teacherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos del docente...</p>
      </div>
    )
  }

  const { teacher, teacherFullName, teacherSupervisions, teacherSubjects, supervisionPerformanceData, averageSupervisionScore, averageEvaluationScore, evaluationPerformanceData, evaluationsByGroup } = teacherData;
  const nameInitial = teacher.nombre.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${nameInitial}`} alt={teacherFullName} data-ai-hint="person avatar" />
                <AvatarFallback>{nameInitial}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    {teacherFullName}
                </h1>
                <p className="text-muted-foreground">{teacher.correo}</p>
                <p className="text-xs text-muted-foreground mt-1">
                Miembro desde: {new Date(teacher.fecha_registro).toLocaleDateString("es-ES")}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant={activeTab === 'supervisions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('supervisions')}
            >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Supervisiones
            </Button>
            <Button 
                variant={activeTab === 'evaluations' ? 'default' : 'outline'}
                onClick={() => setActiveTab('evaluations')}
            >
                <BookUser className="h-4 w-4 mr-2" />
                Evaluaciones
            </Button>
            <Button 
                variant={activeTab === 'subjects' ? 'default' : 'outline'}
                onClick={() => setActiveTab('subjects')}
            >
                <Library className="h-4 w-4 mr-2" />
                Materias
            </Button>
        </div>
      </div>

      {activeTab === 'supervisions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
                <Card className="rounded-xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Progresión de Rendimiento</CardTitle>
                                <CardDescription>Evolución del rendimiento a través de las supervisiones completadas.</CardDescription>
                            </div>
                            <div className="flex flex-col items-center">
                                <ProgressRing value={averageSupervisionScore} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-80 w-full pr-8">
                        {supervisionPerformanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={supervisionPerformanceData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background) / 0.8)',
                                            borderColor: 'hsl(var(--border))',
                                            color: 'hsl(var(--foreground))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                    />
                                    <ReferenceLine y={60} stroke="hsl(var(--destructive))" strokeWidth={2} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Calificación" 
                                        stroke="hsl(var(--primary))" 
                                        fill="hsl(var(--primary) / 0.2)"
                                        dot={<CustomDot />}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl">
                                <p className="text-muted-foreground">Aún no hay datos de rendimiento.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3">
            <Card className="rounded-xl">
                <CardHeader>
                <CardTitle>Historial de Supervisión</CardTitle>
                <CardDescription>
                    Supervisiones programadas y completadas.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Carrera</TableHead>
                        <TableHead>Coordinador</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Calificación</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {teacherSupervisions.length > 0 ? teacherSupervisions.map((supervision) => (
                        <TableRow key={supervision.id}>
                        <TableCell className="font-medium">
                            {supervision.career}
                        </TableCell>
                        <TableCell>{supervision.coordinator}</TableCell>
                        <TableCell>
                            {supervision.date ? format(supervision.date, "P", { locale: es }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                            <Badge
                            variant={
                                supervision.status === "Programada"
                                ? "warning"
                                : "success"
                            }
                            >
                            {supervision.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                            {supervision.score !== undefined ? `${supervision.score}%` : "N/A"}
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No hay supervisiones registradas.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="lg:col-span-3 grid grid-cols-1 gap-8">
            <Card className="rounded-xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Progresión de Evaluaciones</CardTitle>
                                <CardDescription>Evolución del rendimiento según las evaluaciones de los alumnos.</CardDescription>
                            </div>
                            <div className="flex flex-col items-center">
                                <ProgressRing value={averageEvaluationScore} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-80 w-full pr-8">
                        {evaluationPerformanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={evaluationPerformanceData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background) / 0.8)',
                                            borderColor: 'hsl(var(--border))',
                                            color: 'hsl(var(--foreground))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                    />
                                    <ReferenceLine y={60} stroke="hsl(var(--destructive))" strokeWidth={2} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Calificación" 
                                        stroke="hsl(var(--primary))" 
                                        fill="hsl(var(--primary) / 0.2)"
                                        dot={<CustomDot />}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl">
                                <p className="text-muted-foreground">Aún no hay datos de evaluaciones.</p>
                            </div>
                        )}
                    </CardContent>
            </Card>
            {Object.keys(evaluationsByGroup).length > 0 ? (
                Object.entries(evaluationsByGroup).map(([groupName, groupData]) => (
                    <Card key={groupName} className="rounded-xl">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Historial de Evaluación: {groupName}</CardTitle>
                                    <CardDescription>
                                        Comentarios consolidados del grupo.
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Calificación Promedio</p>
                                    <p className={`text-2xl font-bold rounded-md px-2 py-1`}>
                                        <span style={{color: getScoreColor(groupData.averageRating)}}>
                                            {groupData.averageRating}%
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {groupData.evaluations.map((evaluation, index) => (
                                <React.Fragment key={evaluation.id}>
                                    <div className="grid gap-2">
                                        <p className="text-sm text-muted-foreground italic">"{evaluation.feedback}"</p>
                                    </div>
                                    {index < groupData.evaluations.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Comentarios de Alumnos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted rounded-xl">
                            <p className="text-muted-foreground">No hay evaluaciones de alumnos todavía.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
      
      {activeTab === 'subjects' && (
        <div className="lg:col-span-3">
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Materias Impartidas</CardTitle>
                    <CardDescription>
                        Lista de materias que impartes actualmente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Materia</TableHead>
                                <TableHead>Carrera</TableHead>
                                <TableHead>Grado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherSubjects.length > 0 ? teacherSubjects.map((subject) => (
                                <TableRow key={subject.id}>
                                    <TableCell className="font-medium">{subject.name}</TableCell>
                                    <TableCell>{subject.career}</TableCell>
                                    <TableCell>{subject.semester}°</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No tienes materias asignadas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  )
}
