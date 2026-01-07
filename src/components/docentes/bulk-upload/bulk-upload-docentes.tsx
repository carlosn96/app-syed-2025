"use client"

import { FileUploadSection } from "./file-upload-section"
import { DataPreviewTable } from "./data-preview-table"
import { useBulkUpload } from "./use-bulk-upload"

interface BulkUploadDocentesProps {
  basePath?: string
  title?: string
  description?: string
}

/**
 * Componente principal para carga masiva de docentes
 * Sigue el patrón Atomic Design y separa responsabilidades
 * 
 * @param role - Rol del usuario a crear (docente o coordinador)
 * @param basePath - Ruta base para la API
 * @param title - Título personalizado (opcional)
 * @param description - Descripción personalizada (opcional)
 */
export function BulkUploadDocentes({ 
  basePath,
  title,
  description 
}: BulkUploadDocentesProps) {
  const {
    file,
    parsedData,
    validationErrors,
    isUploading,
    uploadProgress,
    handleFileSelect,
    handleUpload,
  } = useBulkUpload({ 
    basePath,
    onSuccess: (successCount, errorCount) => {
      console.log(`Operación completada: ${successCount} éxitos, ${errorCount} errores`)
    }
  })

  return (
    <div className="space-y-6 max-w-7xl">
      <FileUploadSection
        onFileSelect={handleFileSelect}
        selectedFile={file}
        isProcessing={isUploading}
      />

      {parsedData.length > 0 && (
        <DataPreviewTable
          data={parsedData}
          validationErrors={validationErrors}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onSubmit={handleUpload}
        />
      )}
    </div>
  )
}
