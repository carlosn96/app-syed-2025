"use client"

import * as React from "react"
import { ArrowLeft, BarChart3, MessageCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSupervision } from "@/context/supervision-context"
import { SupervisionContextPanel } from "./SupervisionContextPanel"
import { CriterionDecisionCard } from "./CriterionDecisionCard"
import { calcularEstadoRubro } from "@/lib/supervision-types"

interface RubroSupervisionViewProps {
  className?: string
}

export function RubroSupervisionView({ className }: RubroSupervisionViewProps) {
  const {
    state,
    currentRubro,
    currentCriterio,
    currentEvaluation,
    setDecision,
    setComentario,
    updateTema,
    updateResumen,
    toggleContextPanel,
    nextCriterio,
    goToOverview
  } = useSupervision()

  // Handle back navigation
  const handleBack = () => {
    goToOverview()
  }

  // Handle next button click
  const handleNext = () => {
    nextCriterio()
  }

  // Handle decision
  const handleDecision = (decision: 'cumplido' | 'no_cumplido') => {
    if (currentRubro && currentCriterio) {
      setDecision(currentRubro.id, currentCriterio.id, decision)
    }
  }

  // Handle comment change
  const handleComentarioChange = (comentario: string) => {
    if (currentRubro && currentCriterio) {
      setComentario(currentRubro.id, currentCriterio.id, comentario)
    }
  }

  if (!currentRubro || !currentCriterio) {
    return null
  }

  const rubroStatus = calcularEstadoRubro(currentRubro)
  const isContable = currentRubro.tipo === 'Contable'
  const totalCriterios = currentRubro.criterios.length
  const currentIndex = state.currentCriterioIndex
  const isLastCriterio = currentIndex === totalCriterios - 1
  const progressValue = ((currentIndex + 1) / totalCriterios) * 100

  // Check if current criterion has a decision
  const hasDecision = currentEvaluation?.decision !== null

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-3 space-y-3">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Regresar al resumen"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Icon indicating type */}
                <div 
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    isContable 
                      ? "bg-primary/10 text-primary" 
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isContable ? (
                    <BarChart3 className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </div>
                <h1 className="font-display text-base font-semibold text-slate-900 truncate">
                  {currentRubro.nombre}
                </h1>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Criterio {currentIndex + 1} de {totalCriterios}
              </span>
              {isContable && (
                <span className="text-slate-400 font-mono text-xs">
                  {rubroStatus.criteriosCumplidos}/{rubroStatus.criteriosEvaluados} cumplidos
                </span>
              )}
            </div>
            
            {/* Progress bar - only for countable rubrics */}
            {isContable ? (
              <Progress 
                value={progressValue} 
                className="h-2"
              />
            ) : (
              // Simple step indicator for non-countable
              <div className="flex gap-1">
                {Array.from({ length: totalCriterios }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i <= currentIndex ? "bg-slate-400" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-auto pb-48">
        <div className="px-4 py-4">
          <CriterionDecisionCard
            criterio={currentCriterio}
            evaluation={currentEvaluation ?? undefined}
            onDecision={handleDecision}
            onComentarioChange={handleComentarioChange}
          />
        </div>
      </main>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Navigation Button */}
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          <Button
            onClick={handleNext}
            disabled={!hasDecision}
            className={cn(
              "w-full h-12 text-base font-semibold gap-2",
              !hasDecision && "opacity-50"
            )}
            size="lg"
          >
            {isLastCriterio ? (
              "Finalizar rubro"
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>

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
