"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, UserPlus, QrCode, Settings } from "lucide-react"
import { Toast } from 'primereact/toast'

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Group } from "@/lib/modelos"
import { getGroups } from "@/services/api"

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useRef<Toast>(null)
  
  const groupId = Number(params.groupId)
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groups = await getGroups()
        const foundGroup = groups.find(g => g.id_grupo === groupId)
        if (foundGroup) {
          setGroup(foundGroup)
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Grupo no encontrado',
          })
          router.push('/groups')
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del grupo',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroupDetails()
  }, [groupId, router])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!group) {
    return null
  }

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/groups')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageTitle>Grupo {group.acronimo}</PageTitle>
          <p className="text-muted-foreground mt-1">
            {group.carrera} • {group.modalidad} • {group.turno}
          </p>
        </div>
        <Button variant="outline" onClick={() => {}}>
          <QrCode className="mr-2 h-4 w-4" />
          Ver código QR
        </Button>
      </div>

      {/* Cards de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alumnos Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              estudiantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitudes Pendientes
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              por revisar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nivel
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.nivel}</div>
            <p className="text-xs text-muted-foreground">
              semestre/cuatrimestre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plantel
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{group.plantel || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              ubicación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con contenido */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Alumnos Inscritos</TabsTrigger>
          <TabsTrigger value="requests">Solicitudes de Inscripción</TabsTrigger>
          <TabsTrigger value="info">Información del Grupo</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alumnos Inscritos</CardTitle>
              <CardDescription>
                Lista de estudiantes que pertenecen a este grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay alumnos inscritos</h3>
                <p className="text-muted-foreground mt-2">
                  Los estudiantes aparecerán aquí una vez que se inscriban al grupo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Inscripción</CardTitle>
              <CardDescription>
                Solicitudes pendientes de aprobación para este grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay solicitudes pendientes</h3>
                <p className="text-muted-foreground mt-2">
                  Las solicitudes de inscripción aparecerán aquí
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Grupo</CardTitle>
              <CardDescription>
                Detalles y configuración del grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Acrónimo:</div>
                  <div className="col-span-2">{group.acronimo}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Código de Inscripción:</div>
                  <div className="col-span-2 font-mono">{group.codigo_inscripcion}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Carrera:</div>
                  <div className="col-span-2">{group.carrera}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Modalidad:</div>
                  <div className="col-span-2">{group.modalidad}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Turno:</div>
                  <div className="col-span-2">{group.turno}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Nivel:</div>
                  <div className="col-span-2">{group.nivel}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold">Plantel:</div>
                  <div className="col-span-2">{group.plantel || 'No asignado'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
