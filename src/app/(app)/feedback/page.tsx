"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { evaluations } from "@/lib/data"
import { Star } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts"

const chartData = [
  { category: "Clarity", rating: 4.5, fill: "var(--color-clarity)" },
  { category: "Engagement", rating: 4.8, fill: "var(--color-engagement)" },
  { category: "Punctuality", rating: 4.9, fill: "var(--color-punctuality)" },
  { category: "Knowledge", rating: 4.7, fill: "var(--color-knowledge)" },
  { category: "Feedback", rating: 4.2, fill: "var(--color-feedback)" },
]

const chartConfig = {
  rating: {
    label: "Rating",
  },
  clarity: {
    label: "Clarity",
    color: "hsl(var(--chart-1))",
  },
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-2))",
  },
  punctuality: {
    label: "Punctuality",
    color: "hsl(var(--chart-3))",
  },
  knowledge: {
    label: "Knowledge",
    color: "hsl(var(--chart-4))",
  },
  feedback: {
    label: "Feedback",
    color: "hsl(var(--chart-5))",
  },
}

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Performance Feedback
      </h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Teacher Performance</CardTitle>
            <CardDescription>Average ratings across all categories.</CardDescription>
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
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Qualitative feedback from students.</CardDescription>
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
