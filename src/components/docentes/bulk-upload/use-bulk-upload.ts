"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { DocenteData, parseCSVFile, ParseResult } from "./csv-parser"
import { crearDocente, createUser } from "@/services/api"
import { Roles } from "@/lib/modelos"

interface UseBulkUploadOptions {
    basePath?: string
    onSuccess?: (successCount: number, errorCount: number) => void
    onError?: (error: Error) => void
}

export function useBulkUpload({ basePath, onSuccess, onError }: UseBulkUploadOptions) {
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<DocenteData[]>([])
    const [validationErrors, setValidationErrors] = useState<{ [key: number | string]: string[] }>({})
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile)
        parseCSVFile(
            selectedFile,
            (result: ParseResult) => {
                setParsedData(result.data)
                setValidationErrors(result.errors)

                const totalRecords = result.data.length + Object.keys(result.errors).length - (result.errors.parsing ? 1 : 0)

                if (result.data.length === 0) {
                    if (result.errors.parsing) {
                        // Ya se mostró el mensaje de error de parsing en csv-parser.ts
                        return
                    } else if (Object.keys(result.errors).length > 0) {
                        toast.error(`No se encontraron datos válidos en ${totalRecords} registros procesados. Revisa los errores de validación en la tabla.`)
                    } else {
                        toast.error("El archivo CSV está vacío o no contiene datos válidos. Asegúrate de que tenga las columnas correctas.")
                    }
                } else if (Object.keys(result.errors).length > 0) {
                    const errorCount = Object.keys(result.errors).length
                    toast.error(
                        `Procesados ${totalRecords} registros: ${result.data.length} válidos, ${errorCount} con errores. Revisa la tabla para más detalles.`,
                        { duration: 6000 }
                    )
                } else {
                    toast.success(`${result.data.length} registros válidos encontrados y listos para cargar.`)
                }
            },
            (error) => {
                onError?.(error)
            }
        )
    }

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast.error("No hay datos válidos para crear")
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        const total = parsedData.length
        let successCount = 0
        let errorCount = 0
        const failedRecords: { index: number; name: string; error: string }[] = []
        
        for (let i = 0; i < total; i++) {
            const docente = parsedData[i]
            
            try {
                await crearDocente({
                    docente
                })
                successCount++
            } catch (error) {
                errorCount++
                const errorMessage = error instanceof Error ? error.message : "Error desconocido"
                failedRecords.push({
                    index: i + 1,
                    name: `${docente.nombre} ${docente.apellido_paterno}`,
                    error: errorMessage,
                })
                console.error(`Error creando docente ${i + 1}:`, error)
            }
            setUploadProgress(((i + 1) / total) * 100)
        }

        setIsUploading(false)

        // Mostrar resultados
        // Mostrar resultados
        if (successCount > 0 && errorCount === 0) {
            toast.success(
                `Se crearon ${successCount} ${successCount === 1 ? "docente" : "docentes"} exitosamente`,
                { duration: 5000 }
            )
        } else if (successCount > 0 && errorCount > 0) {
            toast.error(
                `Se crearon ${successCount} ${successCount === 1 ? "docente" : "docentes"}, pero ${errorCount} fallaron. Revisa los detalles.`,
                { duration: 7000 }
            )
        } else if (errorCount > 0) {
            toast.error(
                `No se pudo crear ningún docente. Los ${errorCount} registros tuvieron errores.`,
                { duration: 7000 }
            )
        }

        // Mostrar detalles de errores si los hay
        if (failedRecords.length > 0 && failedRecords.length <= 3) {
            setTimeout(() => {
                failedRecords.forEach(record => {
                    toast.error(`Fila ${record.index} (${record.name}): ${record.error}`, { duration: 8000 })
                })
            }, 1000)
        } else if (failedRecords.length > 3) {
            setTimeout(() => {
                toast.error(`Primer error: Fila ${failedRecords[0].index} (${failedRecords[0].name}): ${failedRecords[0].error}`, { duration: 8000 })
                toast.error(`Hay ${failedRecords.length - 1} errores más. Revisa la consola para detalles completos.`, { duration: 6000 })
            }, 1000)
        }

        onSuccess?.(successCount, errorCount)

        // Reset después de completar
        if (errorCount === 0) {
            resetState()
        }
    }

    const resetState = () => {
        setFile(null)
        setParsedData([])
        setValidationErrors({})
        setUploadProgress(0)
    }

    return {
        file,
        parsedData,
        validationErrors,
        isUploading,
        uploadProgress,
        handleFileSelect,
        handleUpload,
        resetState,
    }
}
