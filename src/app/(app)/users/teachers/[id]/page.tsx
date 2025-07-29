
"use client"

import { useParams } from "next/navigation"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Star } from "lucide-react"

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
import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const chartConfig = {
  rating: { label: "Calificación" },
  clarity: { label: "Claridad", color: "hsl(var(--chart-1))" },
  engagement: { label: "Compromiso", color: "hsl(var(--chart-2))" },
  punctuality: { label: "Puntualidad", color: "hsl(var(--chart-3))" },
  knowledge: { label: "Conocimiento", color: "hsl(var(--chart-4))" },
  feedback: { label: "Retroalimentación", color: "hsl(var(--chart-5))" },
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
  
  const averageRatings = teacherEvaluations.reduce((acc, curr) => {
    Object.entries(curr.ratings).forEach(([key, value]) => {
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += value;
      acc[key].count += 1;
    });
    return acc;
  }, {} as Record<string, {total: number, count: number}>);

  const chartData = Object.entries(averageRatings).map(([key, {total, count}]) => ({
    category: chartConfig[key as keyof typeof chartConfig]?.label,
    rating: parseFloat((total / count).toFixed(1)),
    fill: `var(--color-${key})`
  }));

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
                    <CardDescription>Calificaciones promedio basadas en la retroalimentación de los alumnos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="rating" hide />
                            <Bar dataKey="rating" layout="vertical" radius={5}>
                            <LabelList
                                dataKey="category"
                                position="insideLeft"
                                offset={8}
                                className="fill-background font-semibold"
                                fontSize={12}
                            />
                            <LabelList
                                dataKey="rating"
                                position="right"
                                offset={8}
                                className="fill-foreground font-semibold"
                                fontSize={12}
                            />
                            </Bar>
                        </BarChart>
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
