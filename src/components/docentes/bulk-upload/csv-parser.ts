"use client"

import * as Papa from "papaparse"
import { z } from "zod"
import toast from "react-hot-toast"

export const docenteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  apellido_paterno: z.string().min(1, "Apellido paterno requerido"),
  apellido_materno: z.string().min(1, "Apellido materno requerido"),
  grado_academico: z.string().optional(),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type DocenteData = z.infer<typeof docenteSchema>

export interface ParseResult {
  data: DocenteData[]
  errors: { [key: number | string]: string[] }
}

export function parseCSVFile(
  file: File,
  onComplete: (result: ParseResult) => void,
  onError?: (error: Error) => void
) {
  // Función auxiliar para parsear con un separador específico
  const parseWithDelimiter = (delimiter: string) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      complete: (results) => {
        try {
          // Check for parsing errors
          if (results.errors && results.errors.length > 0) {
            const parsingErrors = results.errors.filter(error => error.type !== 'Delimiter' && error.type !== 'Quotes')
            if (parsingErrors.length > 0) {
              // Si es coma y hay errores, intentar con punto y coma
              if (delimiter === ',') {
                parseWithDelimiter(';')
                return
              }
              toast.error("Error al procesar el archivo CSV. Verifica que el formato sea correcto y que no haya caracteres especiales problemáticos.")
              onComplete({ data: [], errors: { parsing: ["Error de formato CSV"] } })
              return
            }
          }

          const rawData = results.data as any[]
          
          // Check if we have data
          if (rawData.length === 0) {
            onComplete({ data: [], errors: {} })
            return
          }

          // Check for required headers
          const firstRow = rawData[0]
          const missingHeaders: string[] = []
          
          if (firstRow.nombre === undefined) missingHeaders.push('nombre')
          if (firstRow.apellido_paterno === undefined) missingHeaders.push('apellido_paterno')
          if (firstRow.apellido_materno === undefined) missingHeaders.push('apellido_materno')
          if (firstRow.correo === undefined) missingHeaders.push('correo')
          if (firstRow.contraseña === undefined && firstRow.contrasena === undefined) {
            missingHeaders.push('contraseña (o contrasena)')
          }

          if (missingHeaders.length > 0) {
            toast.error(`Columnas requeridas faltantes: ${missingHeaders.join(', ')}. Descarga la plantilla para ver el formato correcto.`)
            onComplete({ data: [], errors: {} })
            return
          }

          const docentes: DocenteData[] = []
          const errors: { [key: number | string]: string[] } = {}

          rawData.forEach((row, index) => {
            try {
              const validated = docenteSchema.parse({
                nombre: row.nombre?.trim(),
                apellido_paterno: row.apellido_paterno?.trim(),
                apellido_materno: row.apellido_materno?.trim(),
                grado_academico: row.grado_academico?.trim(),
                correo: row.correo?.trim(),
                contrasena: (row.contraseña || row.contrasena)?.trim(),
              })
              docentes.push(validated)
            } catch (error) {
              if (error instanceof z.ZodError) {
                errors[index] = error.errors.map((e) => e.message)
              }
            }
          })

          onComplete({ data: docentes, errors })
        } catch (error) {
          const err = error instanceof Error ? error : new Error("Error al procesar el CSV")
          onError?.(err)
          toast.error("Error al procesar el archivo CSV")
        }
      },
      error: (error) => {
        const err = new Error(error.message || "Error al parsear el CSV")
        onError?.(err)
        toast.error("Error al leer el archivo CSV")
      },
    })
  }

  // Intentar primero con coma, si falla probará con punto y coma
  parseWithDelimiter(',')
}

export function validateDocenteData(data: any[]): ParseResult {
  const docentes: DocenteData[] = []
  const errors: { [key: number | string]: string[] } = {}

  data.forEach((row, index) => {
    try {
      const validated = docenteSchema.parse(row)
      docentes.push(validated)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors[index] = error.errors.map((e) => e.message)
      }
    }
  })

  return { data: docentes, errors }
}
