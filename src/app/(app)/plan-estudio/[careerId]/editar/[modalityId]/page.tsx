"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { getCareerByID, getModalities, getSubjects, getStudyPlanByModality, updateStudyPlan, getStudyPlanByCareerId } from '@/services/api'
import { CareerSummary, Modality, Subject } from '@/lib/modelos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, ChevronRight, ChevronLeft, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { normalizeString } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MateriaSeleccionada {
    id_materia: number;
    id_cat_nivel: number;
}

interface StudyPlanDetail {
    id_materia: number;
    nivel_orden: number;
    nombre_materia: string;
}

export default function EditarPlanEstudioPage() {
    const params = useParams()
    const router = useRouter()
    
    // Los parámetros vienen de la URL: /plan-estudio/[careerId]/editar/[id]
    const careerId = Number(params.careerId)
    const planId = Number(params.modalityId)
    
    const [career, setCareer] = useState<CareerSummary | null>(null)
    const [modality, setModality] = useState<Modality | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [step, setStep] = useState(1)
    const [numberOfSemesters, setNumberOfSemesters] = useState<number>(6)
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, number[]>>({})
    const [searchTerm, setSearchTerm] = useState<Record<number, string>>({})
    const [initialSubjects, setInitialSubjects] = useState<Record<number, number[]>>({})

    useEffect(() => {
        const fetchInitialData = async () => {
            console.log('=== Iniciando carga de datos ===')
            console.log('careerId:', careerId)
            console.log('planId:', planId)

            if (isNaN(careerId) || careerId <= 0 || isNaN(planId) || planId <= 0) {
                console.error('IDs inválidos:', { careerId, planId })
                setError("IDs inválidos.")
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                console.log('Cargando datos en paralelo...')
                
                const [careerData, modalitiesData, subjectsData, planData] = await Promise.all([
                    getCareerByID(careerId).catch(err => {
                        console.error('Error en getCareerByID:', err)
                        throw new Error(`Error al cargar carrera: ${err.message}`)
                    }),
                    getModalities().catch(err => {
                        console.error('Error en getModalities:', err)
                        throw new Error(`Error al cargar modalidades: ${err.message}`)
                    }),
                    getSubjects().catch(err => {
                        console.error('Error en getSubjects:', err)
                        throw new Error(`Error al cargar materias: ${err.message}`)
                    }),
                    getStudyPlanByCareerId(careerId).catch(err => {
                        console.error('Error en getStudyPlanByModality:', err)
                        throw new Error(`Error al cargar plan: ${err.message}`)
                    })
                ])

                console.log('Datos cargados:', {
                    career: careerData,
                    modalities: modalitiesData?.length,
                    subjects: subjectsData?.length,
                    plan: planData?.length
                })

                if (!careerData) {
                    setError("La carrera especificada no existe.")
                    return
                }

                setCareer(careerData)
                setSubjects(subjectsData)

                // Buscar la modalidad del plan
                if (planData && planData.length > 0) {
                    console.log('Procesando plan de estudio:', planData)
                    
                    const modalityId = planData[0].id_modalidad
                    console.log('Modalidad ID del plan:', modalityId)
                    
                    const currentModality = modalitiesData.find(m => m.id === modalityId)
                    console.log('Modalidad encontrada:', currentModality)
                    
                    setModality(currentModality || null)

                    // Calcular el número máximo de semestres
                    const maxSemester = Math.max(...planData.map((p: StudyPlanDetail) => p.nivel_orden))
                    console.log('Número máximo de semestres:', maxSemester)
                    setNumberOfSemesters(maxSemester)

                    // Agrupar materias por semestre
                    const groupedSubjects = planData.reduce((acc: Record<number, number[]>, record: StudyPlanDetail) => {
                        const semester = record.nivel_orden
                        if (!acc[semester]) {
                            acc[semester] = []
                        }
                        acc[semester].push(record.id_materia)
                        return acc
                    }, {})

                    console.log('Materias agrupadas por semestre:', groupedSubjects)
                    setSelectedSubjects(groupedSubjects)
                    setInitialSubjects(groupedSubjects)
                } else {
                    console.error('Plan de estudio vacío o no encontrado')
                    setError("No se encontró el plan de estudio especificado.")
                }

            } catch (err) {
                console.error("=== Error completo al cargar datos ===", err)
                const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado"
                setError(errorMessage)
                toast.error(errorMessage)
            } finally {
                setIsLoading(false)
                console.log('=== Fin de carga de datos ===')
            }
        }
        
        fetchInitialData()
    }, [careerId, planId])
    
    const handleProceedToSubjects = () => {
        if (numberOfSemesters < 1 || numberOfSemesters > 12) {
            toast('El número de semestres debe estar entre 1 y 12.')
            return
        }
        setStep(2)
    }

    const handleSubjectSelection = (semester: number, subjectId: number, isSelected: boolean) => {
        setSelectedSubjects(prev => {
            const currentSemesterSubjects = prev[semester] || []
            if (isSelected) {
                return { ...prev, [semester]: [...currentSemesterSubjects, subjectId] }
            } else {
                return { ...prev, [semester]: currentSemesterSubjects.filter(id => id !== subjectId) }
            }
        })
    }

    const filteredSubjects = useMemo(() => {
        const result: Record<number, Subject[]> = {}
        const allSelectedIds = new Set(Object.values(selectedSubjects).flat())

        for (let i = 1; i <= numberOfSemesters; i++) {
            const term = searchTerm[i] || ''
            const normalizedTerm = normalizeString(term)
            const currentSemesterSelectedIds = new Set(selectedSubjects[i] || [])

            result[i] = subjects.filter(subject => {
                const normalizedName = normalizeString(subject.name)
                const nameMatches = normalizedName.includes(normalizedTerm)
                const isSelectedInOtherSemester = allSelectedIds.has(subject.id) && !currentSemesterSelectedIds.has(subject.id)
                
                return nameMatches && !isSelectedInOtherSemester
            })
        }
        return result
    }, [subjects, searchTerm, numberOfSemesters, selectedSubjects])

    const totalSelectedSubjects = useMemo(() => {
        return Object.values(selectedSubjects).flat().length
    }, [selectedSubjects])

    const getSubjectsCountBySemester = (semester: number) => {
        return (selectedSubjects[semester] || []).length
    }

    const hasChanges = useMemo(() => {
        const currentSubjects = JSON.stringify(selectedSubjects)
        const original = JSON.stringify(initialSubjects)
        return currentSubjects !== original
    }, [selectedSubjects, initialSubjects])

    const handleSubmit = async () => {
        if (!modality?.id) return

        const materias: MateriaSeleccionada[] = Object.entries(selectedSubjects).flatMap(([semester, subjectIds]) => 
            subjectIds.map(subjectId => ({
                id_materia: subjectId,
                id_cat_nivel: Number(semester)
            }))
        )

        if (materias.length === 0) {
            toast('Debes seleccionar al menos una materia para el plan.')
            return
        }

        if (!hasChanges) {
            toast('No se han realizado cambios en el plan.')
            return
        }
        
        const payload = {
            id_carrera: careerId,
            id_modalidad: modality.id,
            materias: materias,
        }

        try {
            setIsSubmitting(true)
            await updateStudyPlan(planId, payload)
            
            toast.success('El plan de estudio se ha actualizado exitosamente.')
            
            setTimeout(() => {
                router.push(`/plan-estudio/${careerId}`)
            }, 500)
            
        } catch (error) {
            console.error("Error al actualizar plan:", error)
            toast.error(error instanceof Error ? error.message : "No se pudo actualizar el plan de estudio.")
        } finally {
            setIsSubmitting(false)
        }
    }
    
    const renderStep1 = () => (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Paso 1: Ajustar Estructura</CardTitle>
                <CardDescription>
                    Modifica la duración en semestres para este plan. La modalidad no puede cambiarse.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Si reduces el número de semestres, las materias de los semestres eliminados se perderán.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label htmlFor="modality-input">Modalidad</Label>
                    <Input 
                        id="modality-input" 
                        value={modality?.nombre || 'Cargando...'} 
                        disabled 
                        className="bg-muted"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="semesters">Duración en Semestres *</Label>
                    <Input 
                        id="semesters" 
                        type="number" 
                        min="1" 
                        max="12" 
                        value={numberOfSemesters} 
                        onChange={e => setNumberOfSemesters(Math.max(1, Math.min(12, Number(e.target.value))))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Mínimo 1, máximo 12 semestres
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleProceedToSubjects} 
                    className="w-full"
                >
                    Continuar a la Selección de Materias
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )

    const renderStep2 = () => (
        <Card className="rounded-xl">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                        <CardTitle>Paso 2: Editar Materias</CardTitle>
                        <CardDescription>
                            Modalidad: <span className="font-semibold text-foreground">{modality?.nombre}</span> · {numberOfSemesters} {numberOfSemesters === 1 ? 'semestre' : 'semestres'}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-sm">
                            {totalSelectedSubjects} {totalSelectedSubjects === 1 ? 'materia' : 'materias'}
                        </Badge>
                        {hasChanges && (
                            <Badge variant="default" className="text-sm">
                                Cambios pendientes
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="sem-1" className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList 
                            className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
                        >
                            {Array.from({ length: numberOfSemesters }, (_, i) => i + 1).map(sem => {
                                const count = getSubjectsCountBySemester(sem)
                                return (
                                    <TabsTrigger 
                                        key={`tab-${sem}`} 
                                        value={`sem-${sem}`}
                                        className="relative"
                                    >
                                        {sem}°
                                        {count > 0 && (
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                ({count})
                                            </span>
                                        )}
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </ScrollArea>
                    
                    {Array.from({ length: numberOfSemesters }, (_, i) => i + 1).map(sem => (
                        <TabsContent key={`content-${sem}`} value={`sem-${sem}`}>
                            <div className="relative mt-4 mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar materia..."
                                    className="pl-9 w-full"
                                    value={searchTerm[sem] || ''}
                                    onChange={(e) => setSearchTerm(prev => ({ ...prev, [sem]: e.target.value }))}
                                />
                            </div>
                            
                            <ScrollArea className="h-80 w-full rounded-md border p-4">
                                {filteredSubjects[sem]?.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredSubjects[sem].map(subject => (
                                            <div 
                                                key={subject.id} 
                                                className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                                            >
                                                <Checkbox
                                                    id={`sub-${sem}-${subject.id}`}
                                                    checked={(selectedSubjects[sem] || []).includes(subject.id)}
                                                    onCheckedChange={(checked) => handleSubjectSelection(sem, subject.id, !!checked)}
                                                    className="mt-1"
                                                />
                                                <label 
                                                    htmlFor={`sub-${sem}-${subject.id}`} 
                                                    className="text-sm font-medium leading-none cursor-pointer flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {subject.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <p className="text-muted-foreground">
                                            {searchTerm[sem] 
                                                ? 'No se encontraron materias con ese término de búsqueda.' 
                                                : 'No hay materias disponibles para seleccionar.'}
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Regresar
                </Button>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || totalSelectedSubjects === 0}
                >
                    {isSubmitting ? (
                        <>Guardando...</>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <FloatingBackButton />
                <div className="flex flex-col">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Card className="rounded-xl">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-8">
                <FloatingBackButton />
                <Card className="rounded-xl border-destructive">
                    <CardContent className="flex flex-col items-center justify-center text-center p-10">
                        <h3 className="text-lg font-semibold text-destructive">Error</h3>
                        <p className="text-muted-foreground mt-2">{error}</p>
                        <Button 
                            onClick={() => router.push(`/plan-estudio/${careerId}`)} 
                            variant="outline" 
                            className="mt-4"
                        >
                            Volver a Planes de Estudio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            
            <FloatingBackButton />
            <div className="flex flex-col">
                <PageTitle>Editar Plan de Estudio</PageTitle>
                <p className="text-muted-foreground">
                    Modificando el plan para: {career?.name || 'Carrera desconocida'} - {modality?.nombre || 'Modalidad desconocida'}
                </p>
            </div>
            
            {step === 1 ? renderStep1() : renderStep2()}
        </div>
    )
}