
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
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Panel de Control
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alumnos
            </CardTitle>
            <Users className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">
              +10.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes</CardTitle>
            <Users className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-sm text-muted-foreground">
              +5 desde el último trimestre
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carreras</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">
              +2 nuevas este año
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planteles</CardTitle>
            <Building className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">
              Gestión centralizada
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Inscripción</CardTitle>
            <CardDescription>Evolución mensual de nuevos alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--primary))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  fontWeight={600}
                />
                <YAxis
                  stroke="hsl(var(--primary))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}K`}
                  fontWeight={600}
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
      </div>
    </div>
  )
}
