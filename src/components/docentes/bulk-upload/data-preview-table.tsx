"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, FileText, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface DocenteDataRow {
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  grado_academico?: string
  correo: string
  contrasena: string
}

interface DataPreviewTableProps {
  data: DocenteDataRow[]
  validationErrors: { [key: number | string]: string[] }
  isUploading: boolean
  uploadProgress: number
  onSubmit: () => void
}

export function DataPreviewTable({ 
  data, 
  validationErrors, 
  isUploading, 
  uploadProgress, 
  onSubmit 
}: DataPreviewTableProps) {
  const hasErrors = Object.keys(validationErrors).length > 0
  const hasParsingError = validationErrors.parsing !== undefined
  const validCount = data.length
  const errorCount = Object.keys(validationErrors).length - (hasParsingError ? 1 : 0)

  if (data.length === 0 && hasParsingError) return null
  if (data.length === 0) return null

  return (
    <Card className="border-muted/40 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Vista Previa de Datos</CardTitle>
          </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">
              {validCount} {validCount === 1 ? "registro válido" : "registros válidos"}
            </span>
          </div>
          {hasErrors && !hasParsingError && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">
                {errorCount} {errorCount === 1 ? "registro con error" : "registros con errores"}
              </span>
            </div>
          )}
          <div className="text-muted-foreground">
            Total: {data.length + errorCount} registros
          </div>
        </div>
        </div>

        {isUploading && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Creando docentes...</span>
              <span className="font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasErrors && !hasParsingError && (
          <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Resumen de Errores
            </h4>
            <div className="text-xs text-red-700 dark:text-red-300 space-y-1">
              {(() => {
                const errorSummary: { [key: string]: number } = {}
                Object.entries(validationErrors).forEach(([key, errors]) => {
                  if (key !== 'parsing') {
                    errors.forEach(error => {
                      errorSummary[error] = (errorSummary[error] || 0) + 1
                    })
                  }
                })
                
                return Object.entries(errorSummary)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([error, count]) => (
                    <div key={error} className="flex justify-between">
                      <span>{error}</span>
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        {count}
                      </Badge>
                    </div>
                  ))
              })()}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Corrige estos errores en tu archivo CSV y vuelve a subirlo.
            </p>
          </div>
        )}

        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido Paterno</TableHead>
                <TableHead>Apellido Materno</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Contraseña</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((docente, index) => {
                const hasError = validationErrors[index]
                return (
                  <TableRow 
                    key={index} 
                    className={hasError ? "bg-destructive/5" : ""}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{docente.nombre}</TableCell>
                    <TableCell>{docente.apellido_paterno}</TableCell>
                    <TableCell>{docente.apellido_materno}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {docente.grado_academico || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{docente.correo}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {'*'.repeat(docente.contrasena.length)}
                    </TableCell>
                    <TableCell className="text-center">
                      {hasError ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="destructive" className="gap-1.5">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors[index].length} {validationErrors[index].length === 1 ? "error" : "errores"}
                          </Badge>
                          <div className="text-xs text-destructive max-w-[200px] truncate" title={validationErrors[index].join(", ")}>
                            {validationErrors[index].join(", ")}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="default" className="gap-1.5 bg-green-500 hover:bg-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Válido
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        {hasErrors && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h4 className="text-sm font-semibold text-destructive">
                Errores de validación detectados
              </h4>
            </div>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {Object.entries(validationErrors).map(([row, errors]) => (
                <div 
                  key={row} 
                  className="text-sm text-destructive bg-background/50 rounded px-3 py-2"
                >
                  <span className="font-medium">Fila {parseInt(row) + 1}:</span>{" "}
                  {errors.join(", ")}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Se crearán <span className="font-semibold text-foreground">{validCount}</span> docentes de un total de <span className="font-semibold text-foreground">{data.length}</span> registros
          </p>
          <Button
            onClick={onSubmit}
            disabled={hasErrors || isUploading || validCount === 0}
            size="lg"
            className="min-w-[160px] gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creando... {Math.round(uploadProgress)}%
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Crear {validCount} {validCount === 1 ? "Docente" : "Docentes"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
