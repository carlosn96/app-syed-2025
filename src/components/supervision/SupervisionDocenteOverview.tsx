"use client"

import * as React from "react"
import { ArrowLeft, Save, User, GraduationCap, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupervision } from "@/context/supervision-context"
import { SupervisionContextPanel } from "./SupervisionContextPanel"
import { RubroCard } from "./RubroCard"

interface SupervisionDocenteOverviewProps {
  onSave?: () => void
  onBack?: () => void
  className?: string
}

export function SupervisionDocenteOverview({
  onSave,
  onBack,
  className
}: SupervisionDocenteOverviewProps) {
  const router = useRouter()
  const {
    state,
    rubrosStatus,
    canSave,
    updateTema,
    updateResumen,
    toggleContextPanel,
    navigateToRubro
  } = useSupervision()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Regresar"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="font-display text-lg font-semibold text-slate-900">
            Evaluación docente
          </h1>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-auto pb-32">
        <div className="px-4 py-4 space-y-4">
          {/* Teacher Context */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-semibold text-slate-900 leading-tight">
                  {state.docente.nombreCompleto}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span className="truncate">{state.docente.programa}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Info - Read Only */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Ciclo activo:</span>
            </div>
            <span className="font-display font-semibold text-primary">
              {state.ciclo.nombre}
            </span>
          </div>

          {/* Rubrics List */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide px-1">
              Rubros de evaluación
            </h3>
            
            <div className="space-y-3">
              {rubrosStatus.map((rubroStatus) => (
                <RubroCard
                  key={rubroStatus.id}
                  rubro={rubroStatus}
                  onEvaluar={() => navigateToRubro(rubroStatus.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Save Button - Only visible when all rubrics evaluated */}
        {canSave && (
          <div className="bg-white border-t border-slate-200 px-4 py-3">
            <Button
              onClick={handleSave}
              className="w-full h-12 text-base font-semibold gap-2"
              size="lg"
            >
              <Save className="h-5 w-5" />
              Guardar supervisión
            </Button>
          </div>
        )}

        {/* Context Panel - Always visible */}
        <SupervisionContextPanel
          temaVisto={state.contexto.temaVisto}
          resumenGeneral={state.contexto.resumenGeneral}
          fechaSupervision={state.contexto.fechaSupervision}
          isExpanded={state.isContextPanelExpanded}
          onToggle={toggleContextPanel}
          onTemaChange={updateTema}
          onResumenChange={updateResumen}
        />
      </div>
    </div>
  )
}
