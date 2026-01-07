"use client"

import { useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Download } from "lucide-react"
import toast from "react-hot-toast"

interface FileUploadSectionProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  isProcessing?: boolean
}

export function FileUploadSection({ 
  onFileSelect, 
  selectedFile, 
  isProcessing = false 
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. El tamaño máximo permitido es 10MB.")
        return
      }

      // Check if file is empty
      if (file.size === 0) {
        toast.error("El archivo está vacío. Selecciona un archivo CSV con datos.")
        return
      }

      const validTypes = ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"]
      const isValidType = validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.csv')
      
      if (isValidType) {
        onFileSelect(file)
      } else {
        toast.error("Por favor selecciona un archivo CSV válido")
      }
    }
  }

  const handleDownloadTemplate = () => {
    // Usar coma como separador para máxima compatibilidad con Excel
    const separator = ","
    const headers = ["nombre", "apellido_paterno", "apellido_materno", "grado_academico", "correo", "contraseña"]
    const exampleData = ["María", "González", "Rodríguez", "Licenciatura", "maria.gonzalez@example.com", "MiPass123"]
    const csvContent = "\ufeff" + headers.join(separator) + "\n" + exampleData.join(separator)
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla-docentes.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-muted/40 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Carga Masiva de Docentes</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
        </div>
        <CardDescription className="text-base">
          Sube un archivo CSV con los datos de los docentes. Asegúrate de seguir el formato de la plantilla y guardar el archivo en codificación UTF-8.
          <br />
          <strong className="text-orange-600 dark:text-orange-400">Importante:</strong> Si editas en Excel, guarda como "CSV (delimitado por comas)" y verifica que use coma (,) como separador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="grid w-full items-center gap-2">
            <label htmlFor="file-upload" className="text-sm font-medium text-muted-foreground">
              Archivo CSV
            </label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="cursor-pointer file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
              <div className="p-2 bg-background rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Formato requerido
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            El archivo debe incluir las siguientes columnas en orden:{" "}
            <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-xs">
              nombre; apellido_paterno; apellido_materno; grado_academico; correo; contraseña
            </code>
            . La columna <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-xs">grado_academico</code> es opcional. 
            El archivo debe estar guardado en codificación UTF-8 para admitir caracteres especiales del español.
            <br />
            <strong className="text-orange-600 dark:text-orange-400">Nota:</strong> La plantilla usa coma (,) como separador para máxima compatibilidad con Excel.
          </p>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Problemas con Excel
          </h4>
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p><strong>Si editas en Excel:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Descarga la plantilla primero</li>
              <li>Abre el archivo en Excel</li>
              <li><strong>No</strong> guardes cambios automáticamente</li>
              <li>Ve a "Archivo → Guardar como → CSV (delimitado por comas)"</li>
              <li>En "Herramientas → Opciones web → Codificación → Unicode (UTF-8)"</li>
              <li>Si Excel cambia los separadores, edita manualmente para usar coma (,)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
