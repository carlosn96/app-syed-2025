"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Users } from "lucide-react"
import { Alumno } from "@/lib/modelos"
import { SearchInput } from "./search-input"

interface EnrollmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  groupAcronimo: string
  availableAlumnos: Alumno[]
  isLoading: boolean
  selectedAlumnos: Set<number>
  onSelectAlumno: (id: number) => void
  onSelectAll: () => void
  onAssign: () => void
  isAssigning: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function EnrollmentDialog({
  isOpen,
  onOpenChange,
  groupAcronimo,
  availableAlumnos,
  isLoading,
  selectedAlumnos,
  onSelectAlumno,
  onSelectAll,
  onAssign,
  isAssigning,
  searchTerm,
  onSearchChange
}: EnrollmentDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
    onSearchChange("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Inscribir Alumnos</DialogTitle>
              <DialogDescription className="mt-1">
                Selecciona estudiantes para inscribir en {groupAcronimo}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          <SearchInput
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={onSearchChange}
            className="h-11"
          />

          <div className="flex items-center justify-between px-1 py-2 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="select-all"
                checked={selectedAlumnos.size === availableAlumnos.length && availableAlumnos.length > 0}
                onCheckedChange={onSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Seleccionar todos los resultados
              </label>
            </div>
            <div className="flex items-center gap-2">
              {selectedAlumnos.size > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                  {selectedAlumnos.size} seleccionado{selectedAlumnos.size !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {availableAlumnos.length} disponible{availableAlumnos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg bg-muted/20">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg bg-background">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : availableAlumnos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No se encontraron alumnos con ese criterio' : 'No hay alumnos disponibles para inscribir'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableAlumnos.map((alumno) => {
                  const isSelected = selectedAlumnos.has(alumno.id_alumno)
                  return (
                    <div
                      key={alumno.id_alumno}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-150 ${isSelected
                          ? 'bg-primary/10 border border-primary/40 shadow-sm'
                          : 'hover:bg-muted border border-transparent'
                        }`}
                      onClick={() => onSelectAlumno(alumno.id_alumno)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}} // Prevent default
                        className="shrink-0"
                      />
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                        <span className="text-sm font-semibold text-primary">
                          {(alumno.nombre_completo?.charAt(0) || '?').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {alumno.nombre_completo || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {alumno.correo}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="shrink-0">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedAlumnos.size > 0 && (
                <span>
                  <strong>{selectedAlumnos.size}</strong> alumno{selectedAlumnos.size !== 1 ? 's' : ''} {selectedAlumnos.size !== 1 ? 'serán inscritos' : 'será inscrito'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isAssigning}
              >
                Cancelar
              </Button>
              <Button
                onClick={onAssign}
                disabled={selectedAlumnos.size === 0 || isAssigning}
                className="min-w-[140px] gap-2"
              >
                {isAssigning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Inscribir {selectedAlumnos.size > 0 && `(${selectedAlumnos.size})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}