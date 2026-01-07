"use client"

import { Users, UserPlus, Settings } from "lucide-react"
import { SummaryCard } from "./summary-card"
import { Group } from "@/lib/modelos"

interface SummaryCardsGridProps {
  group: Group
  enrolledCount: number
}

export function SummaryCardsGrid({ group, enrolledCount }: SummaryCardsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Alumnos Inscritos"
        value={enrolledCount}
        description="estudiantes activos"
        icon={Users}
        borderColor="border-l-primary"
        hoverColor="hover:shadow-primary/20"
      />

      <SummaryCard
        title="Solicitudes Pendientes"
        value={0}
        description="por revisar"
        icon={UserPlus}
        borderColor="border-l-accent"
        hoverColor="hover:shadow-accent/20"
      />

      <SummaryCard
        title="Nivel"
        value={group.nivel}
        description="ciclo"
        icon={Settings}
        borderColor="border-l-primary"
        hoverColor="hover:shadow-primary/20"
      />

      <SummaryCard
        title="Plantel"
        value={group.plantel || 'N/A'}
        description="ubicación"
        icon={Settings}
        borderColor="border-l-primary"
        hoverColor="hover:shadow-primary/20"
      />
    </div>
  )
}