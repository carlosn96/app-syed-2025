"use client"

import * as React from "react"
import { ChevronRight, BarChart3, MessageCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RubroStatus } from "@/lib/supervision-types"

interface RubroCardProps {
  rubro: RubroStatus
  onEvaluar: () => void
  className?: string
}

export function RubroCard({ rubro, onEvaluar, className }: RubroCardProps) {
  const isContable = rubro.tipo === 'Contable'
  const isCompleto = rubro.completado
  
  return (
    <button
      type="button"
      onClick={onEvaluar}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        "bg-white hover:shadow-md active:scale-[0.99]",
        isContable 
          ? "border-primary/20 hover:border-primary/40" 
          : "border-slate-200 hover:border-slate-300",
        isCompleto && "ring-2 ring-success/30",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon - Visual distinction for type */}
        <div 
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            isContable 
              ? "bg-primary/10 text-primary" 
              : "bg-slate-100 text-slate-500"
          )}
        >
          {isContable ? (
            <BarChart3 className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-slate-900 leading-tight">
              {rubro.nombre}
            </h3>
            {isCompleto && (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            )}
          </div>
          
          {/* Status indicator */}
          <div className="mt-1.5">
            {isContable ? (
              // Countable rubric - show percentage
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {rubro.criteriosEvaluados} de {rubro.totalCriterios} criterios
                  </span>
                  <span 
                    className={cn(
                      "font-display font-bold text-lg",
                      rubro.porcentaje >= 80 ? "text-success" :
                      rubro.porcentaje >= 60 ? "text-warning" :
                      rubro.porcentaje > 0 ? "text-destructive" :
                      "text-slate-400"
                    )}
                  >
                    {isCompleto ? `${rubro.porcentaje}%` : '—'}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCompleto
                        ? rubro.porcentaje >= 80 ? "bg-success" :
                          rubro.porcentaje >= 60 ? "bg-warning" :
                          "bg-destructive"
                        : "bg-primary/50"
                    )}
                    style={{ 
                      width: `${(rubro.criteriosEvaluados / rubro.totalCriterios) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ) : (
              // Non-countable rubric - show observational label
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Observacional
                </span>
                {rubro.criteriosEvaluados > 0 && (
                  <span className="text-xs text-slate-400">
                    • {rubro.criteriosEvaluados} de {rubro.totalCriterios} criterios
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Arrow */}
        <div className="shrink-0 self-center">
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Action hint */}
      <div className="mt-3 flex justify-end">
        <span 
          className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            isCompleto 
              ? "bg-success/10 text-success"
              : isContable 
                ? "bg-primary/10 text-primary" 
                : "bg-slate-100 text-slate-600"
          )}
        >
          {isCompleto ? "Evaluado" : "Evaluar"}
        </span>
      </div>
    </button>
  )
}
