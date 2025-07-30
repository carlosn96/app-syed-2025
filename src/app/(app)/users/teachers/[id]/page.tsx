
"use client"

import { useParams } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarGrid } from "recharts"
import { Star } from "lucide-react"
import React from "react"

import {
  users,
  supervisions,
  evaluations,
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

export default function TeacherProfilePage() {
  const params = useParams()
  const teacherId = Number(params.id)

  const teacher = users.find(
    (user) => user.id === teacherId && user.rol === "teacher"
  )

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Docente no encontrado.</p>
      </div>
    )
  }

  const teacherFullName = `${teacher.nombre} ${teacher.apellido_paterno} ${teacher.apellido_materno}`.trim()

  const teacherSupervisions = supervisions.filter(
    (s) => s.teacher === teacherFullName
  )
  const teacherEvaluations = evaluations.filter(
    (e) => e.teacherName === teacherFullName
  )
  
  const completedSupervisions = teacherSupervisions.filter(s => s.status === 'Completada' && s.score !== undefined);

  const performanceData = completedSupervisions
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(s => ({
      date: format(s.date, "dd/MM/yy"),
      Calificación: s.score,
    }));

  const averageScore = completedSupervisions.length > 0 
    ? Math.round(completedSupervisions.reduce((acc, s) => acc + s.score!, 0) / completedSupervisions.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score < 60) return 'hsl(var(--destructive))';
    if (score < 70) return 'hsl(var(--chart-4))';
    return 'hsl(var(--primary))';
  };

  const radialChartData = [{ name: 'Promedio', value: averageScore, fill: getScoreColor(averageScore) }];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${teacher.nombre.charAt(0)}`} alt={teacherFullName} data-ai-hint="person avatar" />
            <AvatarFallback>{teacher.nombre.charAt(0)}</AvatarFallback>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
            <Card className="rounded-xl">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Progresión de Rendimiento</CardTitle>
                            <CardDescription>Evolución del rendimiento del docente a través de las supervisiones completadas.</CardDescription>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-24 w-24 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart 
                                        innerRadius="70%" 
                                        outerRadius="100%" 
                                        data={radialChartData} 
                                        startAngle={90} 
                                        endAngle={-270}
                                        barSize={10}
                                    >
                                        <PolarGrid 
                                            gridType="circle" 
                                            radialLines={false}
                                            stroke="none"
                                        />
                                        <RadialBar 
                                            background={{ fill: 'hsl(var(--muted))' }}
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{averageScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-80 w-full pr-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={performanceData}
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
                            <Area type="monotone" dataKey="Calificación" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Historial de Supervisión</CardTitle>
              <CardDescription>
                Supervisiones programadas y completadas para este docente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead>Coordinador</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Calificación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherSupervisions.map((supervision) => (
                    <TableRow key={supervision.id}>
                      <TableCell className="font-medium">
                        {supervision.subject}
                      </TableCell>
                      <TableCell>{supervision.coordinator}</TableCell>
                      <TableCell>
                        {format(supervision.date, "P", { locale: es })}
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Comentarios de Alumnos</CardTitle>
              <CardDescription>
                Retroalimentación cualitativa directamente de los alumnos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {teacherEvaluations.map((evaluation, index) => (
                <React.Fragment key={evaluation.id}>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{evaluation.student}</p>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-sm">{evaluation.overallRating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "{evaluation.feedback}"
                    </p>
                  </div>
                  {index < teacherEvaluations.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
