
"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { useAuth } from "@/context/auth-context"
import { supervisions } from "@/lib/data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const getScoreColor = (score: number) => {
  if (score < 60) return 'hsl(var(--destructive))';
  if (score < 80) return 'hsl(var(--warning))';
  return 'hsl(var(--success))'; 
};

export default function PalpaPage() {
  const { user } = useAuth()

  const teacherData = useMemo(() => {
    if (!user || user.rol !== "teacher") return null;

    const teacherFullName = `${user.nombre} ${user.apellido_paterno}`.trim()

    const completedSupervisions = supervisions
      .filter(
        (s) => s.teacher === teacherFullName && s.status === "Completada" && s.score !== undefined
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (completedSupervisions.length === 0) {
      return {
        teacher: user,
        averageScore: 0,
        mostRecentSupervision: null,
        performanceData: [],
        completedSupervisions: [],
      }
    }

    const averageScore = Math.round(
      completedSupervisions.reduce((acc, s) => acc + s.score!, 0) /
        completedSupervisions.length
    );

    const mostRecentSupervision = completedSupervisions[completedSupervisions.length - 1];

    const performanceData = completedSupervisions.map((s) => ({
      date: format(s.date, "dd/MM/yy"),
      Calificación: s.score,
    }));

    return {
      teacher: user,
      averageScore,
      mostRecentSupervision,
      performanceData,
      completedSupervisions,
    }
  }, [user]);

  if (!teacherData) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Palpa
        </h1>
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Acceso no autorizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Esta sección solo está disponible para docentes.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { averageScore, mostRecentSupervision, performanceData, completedSupervisions } = teacherData;
  
  if (completedSupervisions.length === 0) {
     return (
        <div className="flex flex-col gap-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                Palpa - Estado de Desempeño
            </h1>
            <Card className="rounded-xl">
                <CardHeader>
                <CardTitle>Aún sin datos</CardTitle>
                <CardDescription>
                    Todavía no tienes supervisiones completadas.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted rounded-xl">
                    <p className="text-muted-foreground">Vuelve a consultar después de tu primera supervisión.</p>
                </div>
                </CardContent>
            </Card>
        </div>
     )
  }


  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Palpa - Estado de Desempeño
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 rounded-xl">
            <CardHeader>
                <CardTitle>Estado General</CardTitle>
                <CardDescription>Tu rendimiento promedio.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
                <ProgressRing value={averageScore} />
                <p className="text-center text-muted-foreground text-sm">
                    {averageScore >= 80 
                        ? "¡Excelente trabajo! Tu desempeño es consistentemente alto." 
                        : averageScore >= 60 
                        ? "Buen trabajo. Hay áreas de oportunidad para seguir mejorando." 
                        : "Tu desempeño indica áreas que requieren atención. ¡Sigue esforzándote!"
                    }
                </p>
            </CardContent>
        </Card>
         <Card className="md:col-span-2 rounded-xl">
            <CardHeader>
                <CardTitle>Progresión de Rendimiento</CardTitle>
                <CardDescription>Evolución de tu rendimiento en el tiempo.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 w-full pr-8">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={performanceData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} tickFormatter={(value) => `${'${value}'}%`} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background) / 0.8)',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: 'var(--radius)'
                            }}
                        />
                        <ReferenceLine y={60} stroke="hsl(var(--destructive))" strokeWidth={2} />
                        <Area type="monotone" dataKey="Calificación" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

       <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Historial de Supervisiones</CardTitle>
          <CardDescription>Un registro de todas tus supervisiones completadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Materia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Coordinador</TableHead>
                <TableHead className="text-right">Calificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedSupervisions.slice().reverse().map((supervision) => (
                <TableRow key={supervision.id}>
                  <TableCell className="font-medium">{supervision.subject}</TableCell>
                  <TableCell>{format(supervision.date, "PPP", { locale: es })}</TableCell>
                  <TableCell>{supervision.coordinator}</TableCell>
                  <TableCell className="text-right">
                     <Badge style={{ backgroundColor: getScoreColor(supervision.score!) }}>
                        {supervision.score}%
                     </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  )
}
