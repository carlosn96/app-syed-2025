"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CareerSummary, StudyPlanRecord } from '@/lib/modelos'
import { useAuth } from '@/context/auth-context'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/page-title'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    getStudyPlanByCareerId,
    deleteStudyPlan, getCareerByID,
    getCarrerasForCoordinador,
    getStudyPlanCoordinatorByCareerId
} from '@/services/api'
import { Skeleton } from '@/components/ui/skeleton'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import toast from 'react-hot-toast'

export default function PlanEstudioPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()

    const careerId = Number(params.careerId)

    const [studyPlans, setStudyPlans] = useState<StudyPlanRecord[]>([])
    const [careerInfo, setCareerInfo] = useState<CareerSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [planToDelete, setPlanToDelete] = useState<{ id: number, name: string } | null>(null)

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Validar ID de carrera
            if (isNaN(careerId) || careerId <= 0) {
                setError("ID de carrera inválido.")
                return
            }

            // Determinar qué función usar según el rol del usuario
            const isCoordinador = user?.rol?.toLowerCase() === 'coordinador'

            // Obtener información de la carrera y planes de estudio en paralelo
            const [careerData, plansData] = await Promise.all([
                isCoordinador ? getCarrerasForCoordinador(careerId) : getCareerByID(careerId),
                isCoordinador ? getStudyPlanCoordinatorByCareerId(careerId) : getStudyPlanByCareerId(careerId)
            ])

            // Validar que la carrera existe
            if (!careerData) {
                setError("La carrera especificada no existe.")
                return
            }

            setCareerInfo(careerData)
            setStudyPlans(plansData)

        } catch (err) {
            console.error("Error al cargar datos:", err)

            if (err instanceof Error) {
                // Manejar error 404 específicamente
                if (err.message.includes("404")) {
                    setError("La carrera no existe.")
                } else {
                    setError(err.message || "Error al cargar los datos.")
                }
            } else {
                setError("Error inesperado al cargar los datos.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [careerId])

    const handleDeletePlan = async () => {
        if (!planToDelete) return

        try {
            await deleteStudyPlan(planToDelete.id)

            toast.success(`El plan de estudio para la modalidad "${planToDelete.name}" ha sido eliminado exitosamente.`)

            // Recargar datos después de eliminar
            await fetchData()

        } catch (error) {
            console.error("Error al eliminar plan:", error)

            toast.error(error instanceof Error ? error.message : "No se pudo eliminar el plan de estudio.")
        } finally {
            setPlanToDelete(null)
        }
    }

    const getOrdinal = (n: number) => `${n}°`

    // Estado de carga
    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <FloatingBackButton />
                <div className="flex flex-col">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <Card className="rounded-xl">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Estado de error
    if (error) {
        return (
            <div className="flex flex-col gap-8">
                <FloatingBackButton />
                <Card className="rounded-xl border-destructive">
                    <CardContent className="flex flex-col items-center justify-center text-center p-10">
                        <h3 className="text-lg font-semibold text-destructive">Error al Cargar</h3>
                        <p className="text-muted-foreground mt-2">{error}</p>
                        <Button
                            onClick={fetchData}
                            variant="outline"
                            className="mt-4"
                        >
                            Reintentar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />

            {/* Diálogo de confirmación de eliminación */}
            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el plan de estudios completo para la modalidad
                            <span className="font-bold text-primary"> {planToDelete?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPlanToDelete(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlan}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className='flex flex-col'>
                    <PageTitle>
                        Planes de Estudio: {careerInfo?.name || `Carrera #${careerId}`}
                    </PageTitle>
                    <p className="text-muted-foreground">
                        Gestiona las modalidades y materias de la carrera.
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/plan-estudio/${careerId}/creacion`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Plan de Estudio
                    </Link>
                </Button>
            </div>

            {/* Lista de planes de estudio */}
            {studyPlans.length > 0 ? (
                studyPlans.map((plan) => {
                    // Obtener niveles únicos y ordenarlos
                    const niveles = [...new Set(plan.materias.map(m => m.id_cat_nivel))]
                        .sort((a, b) => a - b)

                    return (
                        <Card key={plan.id} className="rounded-xl">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div>
                                        <CardTitle>Modalidad: {plan.nombre_modalidad}</CardTitle>
                                        <CardDescription>
                                            {plan.materias.length} {plan.materias.length === 1 ? 'materia' : 'materias'} asignadas en {niveles.length} {niveles.length === 1 ? 'nivel' : 'niveles'}.
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button asChild variant="info-outline" size="sm">
                                            <Link href={`/plan-estudio/${careerId}/editar/${plan.id}`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setPlanToDelete({
                                                id: plan.id,
                                                name: plan.nombre_modalidad
                                            })}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {niveles.length > 0 ? (
                                    <Tabs defaultValue={`nivel-${niveles[0]}`} className="w-full">
                                        <TabsList
                                            className="grid w-full"
                                            style={{
                                                gridTemplateColumns: `repeat(${Math.min(niveles.length, 6)}, minmax(0, 1fr))`
                                            }}
                                        >
                                            {niveles.map(nivel => (
                                                <TabsTrigger
                                                    key={nivel}
                                                    value={`nivel-${nivel}`}
                                                    className="text-xs sm:text-sm"
                                                >
                                                    {getOrdinal(nivel)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        {niveles.map(nivel => {
                                            const nivelMaterias = plan.materias.filter(
                                                m => m.id_cat_nivel === nivel
                                            )

                                            return (
                                                <TabsContent key={nivel} value={`nivel-${nivel}`}>
                                                    <div className='rounded-xl overflow-hidden mt-4 border'>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-12">#</TableHead>
                                                                    <TableHead>Nombre de la Materia</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {nivelMaterias.length > 0 ? (
                                                                    nivelMaterias.map((materia, index) => (
                                                                        <TableRow key={materia.id_materia}>
                                                                            <TableCell className="text-muted-foreground">
                                                                                {index + 1}
                                                                            </TableCell>
                                                                            <TableCell className="font-medium">
                                                                                {materia.nombre_materia}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            colSpan={2}
                                                                            className="text-center h-24 text-muted-foreground"
                                                                        >
                                                                            No hay materias en este nivel
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TabsContent>
                                            )
                                        })}
                                    </Tabs>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                                        <h3 className="text-lg font-semibold">Modalidad Vacía</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Aún no se han asignado materias para esta modalidad.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                <Card className="rounded-xl">
                    <CardContent className="flex flex-col items-center justify-center text-center p-10">
                        <h3 className="text-lg font-semibold">Sin Planes de Estudio</h3>
                        <p className="text-muted-foreground mt-2">
                            Esta carrera aún no tiene planes de estudio asignados.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={`/plan-estudio/${careerId}/creacion`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Primer Plan
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}