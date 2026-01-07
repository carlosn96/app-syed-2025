"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, UserPlus, Settings } from "lucide-react"
import toast, { Toaster } from 'react-hot-toast'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Group } from "@/lib/modelos"
import { getGroupById } from "@/services/api"
import { TooltipProvider } from "@/components/ui/tooltip"

import { GroupHeader } from "@/components/groups/group-header"
import { SummaryCardsGrid } from "@/components/groups/summary-cards-grid"
import { StudentsList } from "@/components/groups/students-list"
import { EnrollmentDialog } from "@/components/groups/enrollment-dialog"
import { GroupInfo } from "@/components/groups/group-info"
import { useGroupStudents } from "@/hooks/use-group-students"
import { useEnrollmentDialog } from "@/hooks/use-enrollment-dialog"

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const groupId = Number(params.groupId)
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)

  const {
    alumnosInscritos,
    isReloadingAlumnos,
    removingAlumnoId,
    handleRemoveAlumno,
    handleAssignAlumnos
  } = useGroupStudents(groupId)

  const {
    isEnrollDialogOpen,
    setIsEnrollDialogOpen,
    availableAlumnos,
    selectedAlumnos,
    isLoadingAlumnos,
    searchTerm,
    setSearchTerm,
    handleSelectAlumno,
    handleSelectAll,
    resetDialog
  } = useEnrollmentDialog(alumnosInscritos)

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const group = await getGroupById(groupId)
        if (group) {
          setGroup(group)
        } else {
          toast.error('Grupo no encontrado')
          setTimeout(() => router.push('/groups'), 1000)
        }
      } catch (error) {
        toast.error('No se pudo cargar la información del grupo')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroupDetails()
  }, [groupId, router])

  const handleAssign = async () => {
    if (selectedAlumnos.size === 0) return

    setIsAssigning(true)
    try {
      await handleAssignAlumnos(selectedAlumnos)
      toast.success(`${selectedAlumnos.size} alumno(s) inscrito(s) correctamente`)
      resetDialog()
    } catch (error) {
      toast.error('No se pudieron inscribir los alumnos')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveStudent = async (alumnoId: number) => {
    try {
      await handleRemoveAlumno(alumnoId)
      toast.success('Alumno desmatriculado correctamente')
    } catch (error: any) {
      let errorMessage = 'No se pudo desmatricular al alumno'
      if (error?.message?.includes('respuesta de la API no indica éxito')) {
        errorMessage = 'La operación no se completó correctamente en el servidor'
      } else if (error?.message) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

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
    <TooltipProvider>
      <div className="flex flex-col gap-6">

        <GroupHeader
          group={group}
          onBack={() => router.push('/groups')}
        />

        <SummaryCardsGrid
          group={group}
          enrolledCount={alumnosInscritos.length}
        />

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Alumnos Inscritos
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Solicitudes de Inscripción
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <Settings className="h-4 w-4" />
              Información del Grupo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <StudentsList
              alumnos={alumnosInscritos}
              isReloading={isReloadingAlumnos}
              onEnrollClick={() => setIsEnrollDialogOpen(true)}
              onRemoveStudent={handleRemoveStudent}
              removingStudentId={removingAlumnoId}
            />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No hay solicitudes pendientes</h3>
              <p className="text-muted-foreground mt-2">
                Las solicitudes de inscripción aparecerán aquí
              </p>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <GroupInfo group={group} />
          </TabsContent>
        </Tabs>

        <EnrollmentDialog
          isOpen={isEnrollDialogOpen}
          onOpenChange={setIsEnrollDialogOpen}
          groupAcronimo={group.acronimo}
          availableAlumnos={availableAlumnos}
          isLoading={isLoadingAlumnos}
          selectedAlumnos={selectedAlumnos}
          onSelectAlumno={handleSelectAlumno}
          onSelectAll={handleSelectAll}
          onAssign={handleAssign}
          isAssigning={isAssigning}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </TooltipProvider>
  )
}
