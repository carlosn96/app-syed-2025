
"use client"

import { useParams } from "next/navigation"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Star } from "lucide-react"
import React from "react"

import {
  users,
  supervisions,
  evaluations,
  User,
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
import { ChartContainer } from "@/components/ui/chart"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const chartConfig = {
  rendimiento: {
    label: "Rendimiento",
    color: "hsl(var(--chart-1))",
  },
}

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
  const averagePerformance = completedSupervisions.length > 0 
    ? completedSupervisions.reduce((acc, curr) => acc + curr.score!, 0) / completedSupervisions.length
    : 0;

  const chartData = [{ name: "rendimiento", value: averagePerformance, fill: "var(--color-rendimiento)" }]


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
                    <CardTitle>Rendimiento General</CardTitle>
                    <CardDescription>Promedio de rendimiento basado en las supervisiones completadas.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square h-64 w-full"
                    >
                      <RadialBarChart
                        data={chartData}
                        startAngle={-90}
                        endAngle={270}
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={30}
                      >
                        <PolarGrid
                          gridType="circle"
                          radialLines={false}
                          stroke="none"
                          className="first:fill-muted last:fill-background"
                          polarRadius={[100, 75]}
                        />
                         <RadialBar
                          dataKey="value"
                          background
                          cornerRadius={15}
                        />
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          dataKey="value"
                          tick={false}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].value.toFixed(0)}%
                        </text>
                      </RadialBarChart>
                    </ChartContainer>
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
