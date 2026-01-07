"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  borderColor?: string
  hoverColor?: string
}

export function SummaryCard({ title, value, description, icon: Icon, borderColor = "border-l-primary", hoverColor = "hover:shadow-primary/20" }: SummaryCardProps) {
  return (
    <div className="group">
      <Card className={`rounded-xl relative overflow-hidden transition-all duration-300 hover:shadow-lg ${hoverColor} hover:-translate-y-1 border-l-4 ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}