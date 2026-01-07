"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { PageTitle } from "@/components/layout/page-title"
import { BulkUploadDocentes } from "@/components/docentes/bulk-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Página para creación masiva de docentes
 * Solo accesible para administradores
 */
export default function CreateBulkDocentesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Verificar permisos - solo administradores pueden crear docentes masivamente
  useEffect(() => {
    if (!isLoading && user && user.id_rol !== 1) { // 1 = Administrador
      // No redirigir automáticamente, mostrar mensaje de acceso denegado
    }
  }, [user, isLoading])

  if (isLoading) {
    return <div>Cargando...</div>
  }

  // Si no es administrador, mostrar mensaje de acceso denegado
  if (!user || user.id_rol !== 1) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <PageTitle>Acceso Denegado</PageTitle>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Funcionalidad Restringida
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              La creación masiva de docentes solo está disponible para administradores del sistema.
              Si necesitas crear docentes, contacta a un administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <PageTitle>Crear Docentes Masivos</PageTitle>
      <BulkUploadDocentes />
    </div>
  )
}