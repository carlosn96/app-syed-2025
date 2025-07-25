
"use client"
import {
  ArrowUpRight,
  BookOpenCheck,
  Building,
  Star,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Evita el error de hidratación de React con valores aleatorios.
    // Esto asegura que el código solo se ejecute en el cliente después del montaje.
    setChartData([
      { month: "Ene", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Abr", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Ago", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Dic", total: Math.floor(Math.random() * 5000) + 1000 },
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight text-foreground/90">
        Panel de Control
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alumnos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +10.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">
              +5 desde el último trimestre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carreras</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 nuevas este año
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planteles</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Gestión centralizada
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Inscripción</CardTitle>
            <CardDescription>Evolución mensual de nuevos alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}K`}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <CardTitle className="font-headline">Evaluaciones</CardTitle>
                    <CardDescription>
                    Comentarios recientes.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="gap-1 shrink-0">
                    <Link href="/feedback">
                    Ver Todo
                    <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
              </div>
          </CardHeader>
          <CardContent>
            <div className=" space-y-8">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                   <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar" data-ai-hint="person avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Olivia Martin</p>
                  <p className="text-sm text-muted-foreground">
                    "Curso fantástico, muy bien explicado."
                  </p>
                </div>
                <div className="ml-auto font-medium flex items-center gap-1">
                    5 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar" data-ai-hint="woman avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Jackson Lee</p>
                  <p className="text-sm text-muted-foreground">
                    "El material fue desafiante pero gratificante."
                  </p>
                </div>
                <div className="ml-auto font-medium flex items-center gap-1">
                    4 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                   <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar" data-ai-hint="man avatar" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
                  <p className="text-sm text-muted-foreground">
                    "Podría usar más ejemplos prácticos."
                  </p>
                </div>
                <div className="ml-auto font-medium flex items-center gap-1">
                    3 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
