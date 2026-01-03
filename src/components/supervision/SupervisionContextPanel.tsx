"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatearFechaSupervision } from "@/lib/supervision-types"

interface SupervisionContextPanelProps {
  temaVisto: string
  resumenGeneral: string
  fechaSupervision: Date
  isExpanded: boolean
  onToggle: () => void
  onTemaChange: (value: string) => void
  onResumenChange: (value: string) => void
  className?: string
}

export function SupervisionContextPanel({
  temaVisto,
  resumenGeneral,
  fechaSupervision,
  isExpanded,
  onToggle,
  onTemaChange,
  onResumenChange,
  className
}: SupervisionContextPanelProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-expand textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [resumenGeneral, isExpanded])

  return (
    <div 
      className={cn(
        "bg-slate-50/80 backdrop-blur-sm border-t border-slate-200 transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Collapsed State - Always Visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileEdit className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-slate-700">Supervisión</span>
            {!isExpanded && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                <p className="text-xs text-slate-500 truncate">
                  Tema: {temaVisto || <span className="italic text-slate-400">Sin especificar</span>}
                </p>
                <p className="text-xs text-slate-400">
                  Fecha: {formatearFechaSupervision(fechaSupervision)}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isExpanded && (
            <span className="text-xs text-slate-400">Observaciones</span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded State */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Date - Read Only */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Fecha de supervisión
            </span>
            <span className="text-sm font-mono text-slate-700">
              {formatearFechaSupervision(fechaSupervision)}
            </span>
          </div>

          {/* Topic - Editable */}
          <div className="space-y-1.5">
            <label 
              htmlFor="tema-visto" 
              className="text-xs font-medium text-slate-500 uppercase tracking-wide"
            >
              Tema visto
            </label>
            <Input
              id="tema-visto"
              value={temaVisto}
              onChange={(e) => onTemaChange(e.target.value)}
              placeholder="Ingresa el tema de la clase..."
              className="bg-white text-sm rounded-lg h-9"
            />
          </div>

          {/* Summary - Editable */}
          <div className="space-y-1.5">
            <label 
              htmlFor="resumen-general" 
              className="text-xs font-medium text-slate-500 uppercase tracking-wide"
            >
              Observaciones de la supervisión
            </label>
            <Textarea
              ref={textareaRef}
              id="resumen-general"
              value={resumenGeneral}
              onChange={(e) => onResumenChange(e.target.value)}
              placeholder="Escribe las observaciones generales..."
              className="bg-white text-sm min-h-[80px] resize-none rounded-lg"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
