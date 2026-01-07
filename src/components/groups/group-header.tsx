"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, QrCode, Users } from "lucide-react"
import { Group } from "@/lib/modelos"

interface GroupHeaderProps {
  group: Group
  onBack: () => void
  onQrClick?: () => void
}

export function GroupHeader({ group, onBack, onQrClick }: GroupHeaderProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/30 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{group.acronimo}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {group.carrera}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {group.modalidad}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300">
                  {group.turno}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onQrClick || (() => {})} className="shrink-0 gap-2">
          <QrCode className="h-4 w-4" />
          Código QR
        </Button>
      </div>
    </div>
  )
}