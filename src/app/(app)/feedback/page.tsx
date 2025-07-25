"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { evaluations } from "@/lib/data"
import { Star } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts"

const chartData = [
  { category: "Claridad", rating: 4.5, fill: "var(--color-clarity)" },
  { category: "Compromiso", rating: 4.8, fill: "var(--color-engagement)" },
  { category: "Puntualidad", rating: 4.9, fill: "var(--color-punctuality)" },
  { category: "Conocimiento", rating: 4.7, fill: "var(--color-knowledge)" },
  { category: "Retroalimentación", rating: 4.2, fill: "var(--color-feedback)" },
]

const chartConfig = {
  rating: {
    label: "Calificación",
  },
  clarity: {
    label: "Claridad",
    color: "hsl(var(--chart-1))",
  },
  engagement: {
    label: "Compromiso",
    color: "hsl(var(--chart-2))",
  },
  punctuality: {
    label: "Puntualidad",
    color: "hsl(var(--chart-3))",
  },
  knowledge: {
    label: "Conocimiento",
    color: "hsl(var(--chart-4))",
  },
  feedback: {
    label: "Retroalimentación",
    color: "hsl(var(--chart-5))",
  },
}

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Retroalimentación de Desempeño
      </h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desempeño General de Docentes</CardTitle>
            <CardDescription>Calificaciones promedio en todas las categorías.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
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
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comentarios Recientes</CardTitle>
            <CardDescription>Retroalimentación cualitativa de los alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {evaluations.map((evaluation, index) => (
              <React.Fragment key={evaluation.id}>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{evaluation.student}</p>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-sm">{evaluation.rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">"{evaluation.feedback}"</p>
                </div>
                {index < evaluations.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
