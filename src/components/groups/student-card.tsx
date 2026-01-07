"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { X } from "lucide-react"
import { Alumno } from "@/lib/modelos"

interface StudentCardProps {
  alumno: Alumno
  onRemove?: (id: number) => void
  isRemoving?: boolean
  showRemoveButton?: boolean
}

export function StudentCard({ alumno, onRemove, isRemoving = false, showRemoveButton = true }: StudentCardProps) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 group">
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
          <span className="text-sm font-semibold text-primary">
            {(`${alumno.nombre?.charAt(0)}${alumno.apellido_paterno?.charAt(0)}` || '?').toUpperCase()}
          </span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-background" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {`${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`}
        </div>
        <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
          <span className="truncate">{alumno.correo}</span>
        </div>
      </div>
      {showRemoveButton && onRemove && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(alumno.id_alumno)}
              disabled={isRemoving}
              className="shrink-0 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              {isRemoving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Desmatricular alumno</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}