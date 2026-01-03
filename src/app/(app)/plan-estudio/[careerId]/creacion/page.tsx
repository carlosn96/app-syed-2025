"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useRef, useCallback, memo, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { getCareerByID, getModalities, getSubjects, createStudyPlan } from '@/services/api'
import { CareerSummary, Modality, Subject } from '@/lib/modelos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, ChevronRight, ChevronLeft, Save, X, BookOpen } from 'lucide-react'
import { Toast } from 'primereact/toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { normalizeString } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface MateriaSeleccionada {
    id_materia: number;
    id_cat_nivel: number;
}

// Componente memoizado para item de materia disponible
const AvailableSubjectItem = memo(({ 
    subject, 
    numberOfSemesters, 
    onAssign 
}: { 
    subject: Subject
    numberOfSemesters: number
    onAssign: (subjectId: number, semester: number) => void 
}) => {
    const semesterOptions = useMemo(() => 
        Array.from({ length: numberOfSemesters }, (_, i) => i + 1),
        [numberOfSemesters]
    )

    return (
        <div className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
            <span className="text-sm font-medium flex-1 group-hover:text-white">
                {subject.name}
            </span>
            <Select onValueChange={(value) => onAssign(subject.id, Number(value))}>
                <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Asignar" />
                </SelectTrigger>
                <SelectContent>
                    {semesterOptions.map(sem => (
                        <SelectItem key={sem} value={String(sem)}>
                            {sem}° Semestre
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
})
AvailableSubjectItem.displayName = 'AvailableSubjectItem'

// Componente memoizado para item de materia asignada
const AssignedSubjectItem = memo(({ 
    subject, 
    semester,
    numberOfSemesters,
    onMove,
    onRemove 
}: { 
    subject: Subject
    semester: number
    numberOfSemesters: number
    onMove: (subjectId: number, fromSemester: number, toSemester: number) => void
    onRemove: (subjectId: number, semester: number) => void
}) => {
    const otherSemesters = useMemo(() => 
        Array.from({ length: numberOfSemesters }, (_, i) => i + 1).filter(s => s !== semester),
        [numberOfSemesters, semester]
    )

    return (
        <div className="group flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
            <span className="text-sm font-medium flex-1 group-hover:text-white">
                {subject.name}
            </span>
            <div className="flex gap-1">
                {numberOfSemesters > 1 && (
                    <Select onValueChange={(value) => onMove(subject.id, semester, Number(value))}>
                        <SelectTrigger className="w-[100px] h-7 text-xs">
                            <SelectValue placeholder="Mover" />
                        </SelectTrigger>
                        <SelectContent>
                            {otherSemesters.map(s => (
                                <SelectItem key={s} value={String(s)}>
                                    Al {s}°
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => onRemove(subject.id, semester)}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
})
AssignedSubjectItem.displayName = 'AssignedSubjectItem'

export default function CrearPlanEstudioPage() {
    const params = useParams()
    const router = useRouter()
    const toast = useRef<Toast>(null)
    const careerId = Number(params.careerId)
    
    const [career, setCareer] = useState<CareerSummary | null>(null)
    const [modalities, setModalities] = useState<Modality[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [step, setStep] = useState(1)
    const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null)
    const [numberOfSemesters, setNumberOfSemesters] = useState<number>(6)
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, number[]>>({})
    const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('')
    const [isPending, startTransition] = useTransition()
    const [visibleItemsLimit, setVisibleItemsLimit] = useState(50) // Límite inicial de items visibles

    useEffect(() => {
        const fetchInitialData = async () => {
            if (isNaN(careerId) || careerId <= 0) {
                setError("ID de carrera inválido.")
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                const [careerData, modalitiesData, subjectsData] = await Promise.all([
                    getCareerByID(careerId),
                    getModalities(),
                    getSubjects()
                ])

                if (!careerData) {
                    setError("La carrera especificada no existe.")
                    return
                }

                setCareer(careerData)
                setModalities(modalitiesData)
                setSubjects(subjectsData)

            } catch (err) {
                console.error("Error al cargar datos:", err)
                setError(err instanceof Error ? err.message : "Error al cargar los datos necesarios.")
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'No se pudieron cargar los datos necesarios.' 
                })
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchInitialData()
    }, [careerId])

    // Debounce para búsqueda (evita re-renders constantes)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(globalSearchTerm)
            setVisibleItemsLimit(50) // Reset al cambiar búsqueda
        }, 300)
        return () => clearTimeout(timer)
    }, [globalSearchTerm])

    const handleProceedToSubjects = () => {
        if (!selectedModalityId) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Modalidad requerida', 
                detail: 'Por favor, selecciona una modalidad.' 
            })
            return
        }

        if (numberOfSemesters < 1 || numberOfSemesters > 12) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Semestres inválidos', 
                detail: 'El número de semestres debe estar entre 1 y 12.' 
            })
            return
        }

        startTransition(() => {
            setStep(2)
        })
    }

    const handleAssignSubject = useCallback((subjectId: number, semester: number) => {
        setSelectedSubjects(prev => {
            const currentSemesterSubjects = prev[semester] || []
            if (currentSemesterSubjects.includes(subjectId)) return prev
            return { ...prev, [semester]: [...currentSemesterSubjects, subjectId] }
        })
    }, [])

    const handleRemoveSubject = useCallback((subjectId: number, semester: number) => {
        setSelectedSubjects(prev => {
            const currentSemesterSubjects = prev[semester] || []
            return { ...prev, [semester]: currentSemesterSubjects.filter(id => id !== subjectId) }
        })
    }, [])

    const handleMoveSubject = useCallback((subjectId: number, fromSemester: number, toSemester: number) => {
        if (fromSemester === toSemester) return
        setSelectedSubjects(prev => {
            const newState = { ...prev }
            newState[fromSemester] = (newState[fromSemester] || []).filter(id => id !== subjectId)
            newState[toSemester] = [...(newState[toSemester] || []), subjectId]
            return newState
        })
    }, [])

    // Mapa de subjects por ID para búsqueda O(1)
    const subjectsById = useMemo(() => {
        const map = new Map<number, Subject>()
        subjects.forEach(subject => map.set(subject.id, subject))
        return map
    }, [subjects])

    // Mapa de materias asignadas para búsqueda rápida O(1)
    const assignedSubjectsMap = useMemo(() => {
        const map = new Map<number, number>() // subjectId -> semester
        Object.entries(selectedSubjects).forEach(([semester, subjectIds]) => {
            subjectIds.forEach(id => map.set(id, Number(semester)))
        })
        return map
    }, [selectedSubjects])

    // Cache de nombres normalizados para evitar normalizar repetidamente
    const normalizedSubjectNames = useMemo(() => {
        const map = new Map<number, string>()
        subjects.forEach(subject => map.set(subject.id, normalizeString(subject.name)))
        return map
    }, [subjects])

    // Materias disponibles (no asignadas) con búsqueda optimizada
    const availableSubjects = useMemo(() => {
        const normalizedSearch = normalizeString(debouncedSearchTerm)
        return subjects.filter(subject => {
            if (assignedSubjectsMap.has(subject.id)) return false
            if (!normalizedSearch) return true
            const normalizedName = normalizedSubjectNames.get(subject.id) || ''
            return normalizedName.includes(normalizedSearch)
        })
    }, [subjects, assignedSubjectsMap, debouncedSearchTerm, normalizedSubjectNames])

    // Materias visibles limitadas para renderizado progresivo
    const visibleAvailableSubjects = useMemo(() => 
        availableSubjects.slice(0, visibleItemsLimit),
        [availableSubjects, visibleItemsLimit]
    )

    const hasMoreItems = availableSubjects.length > visibleItemsLimit

    // Cargar más items al hacer scroll
    const handleLoadMore = useCallback(() => {
        setVisibleItemsLimit(prev => Math.min(prev + 50, availableSubjects.length))
    }, [availableSubjects.length])

    // Materias asignadas por semestre (optimizado con mapa O(1))
    const subjectsBySemester = useMemo(() => {
        const result: Record<number, Subject[]> = {}
        for (let i = 1; i <= numberOfSemesters; i++) {
            const subjectIds = selectedSubjects[i] || []
            result[i] = subjectIds
                .map(id => subjectsById.get(id))
                .filter((s): s is Subject => s !== undefined)
        }
        return result
    }, [selectedSubjects, subjectsById, numberOfSemesters])

    const totalSelectedSubjects = useMemo(() => {
        return Object.values(selectedSubjects).flat().length
    }, [selectedSubjects])

    const handleSubmit = async () => {
        if (!selectedModalityId) return

        const materias: MateriaSeleccionada[] = Object.entries(selectedSubjects).flatMap(([semester, subjectIds]) => 
            subjectIds.map(subjectId => ({
                id_materia: subjectId,
                id_cat_nivel: Number(semester)
            }))
        )

        if (materias.length === 0) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Plan vacío', 
                detail: 'Debes seleccionar al menos una materia para crear el plan.' 
            })
            return
        }
        
        const payload = {
            id_carrera: careerId,
            id_modalidad: selectedModalityId,
            materias: materias,
        }

        try {
            setIsSubmitting(true)
            await createStudyPlan(payload)
            
            toast.current?.show({ 
                severity: 'success', 
                summary: 'Plan Creado', 
                detail: 'El plan de estudio se ha creado exitosamente.' 
            })
            
            setTimeout(() => {
                router.push(`/plan-estudio/${careerId}`)
            }, 500)
            
        } catch (error) {
            console.error("Error al crear plan:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error al Crear",
                detail: error instanceof Error ? error.message : "No se pudo crear el plan de estudio.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedModalityName = useMemo(() => {
        if (!selectedModalityId) return null
        return modalities.find(m => m.id === selectedModalityId)?.nombre
    }, [selectedModalityId, modalities])

    // Renderizar paso 2 solo cuando step === 2 (lazy rendering)
    const shouldRenderStep2 = step === 2

    const renderStep1 = () => (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Paso 1: Define la Modalidad</CardTitle>
                <CardDescription>
                    Selecciona una modalidad y la duración en semestres para este plan de estudios.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="modality-select">Modalidad *</Label>
                            <Select 
                                onValueChange={(value) => setSelectedModalityId(Number(value))}
                                value={selectedModalityId?.toString()}
                            >
                                <SelectTrigger id="modality-select">
                                    <SelectValue placeholder="Selecciona una modalidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modalities.length > 0 ? (
                                        modalities.map(m => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.nombre}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            No hay modalidades disponibles
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
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
                    </>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleProceedToSubjects} 
                    className="w-full" 
                    disabled={isLoading || !selectedModalityId || isPending}
                >
                    {isPending ? 'Cargando materias...' : 'Continuar a la Selección de Materias'}
                    {!isPending && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    )

    const renderStep2 = () => (
        <div className="space-y-4">
            {/* Header con información y acciones */}
            <Card className="rounded-xl">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <CardTitle>Paso 2: Asigna las Materias</CardTitle>
                            <CardDescription>
                                Modalidad: <span className="font-semibold text-foreground">{selectedModalityName}</span> · {numberOfSemesters} {numberOfSemesters === 1 ? 'semestre' : 'semestres'}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="text-sm">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {totalSelectedSubjects} asignadas
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                                {availableSubjects.length} disponibles
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Diseño de dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Columna Izquierda: Materias Disponibles */}
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Materias Disponibles</CardTitle>
                        <CardDescription>
                            Selecciona una materia y elige el semestre
                        </CardDescription>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar materia..."
                                className="pl-9 w-full"
                                value={globalSearchTerm}
                                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {availableSubjects.length > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        {visibleAvailableSubjects.map(subject => (
                                            <AvailableSubjectItem
                                                key={subject.id}
                                                subject={subject}
                                                numberOfSemesters={numberOfSemesters}
                                                onAssign={handleAssignSubject}
                                            />
                                        ))}
                                    </div>
                                    {hasMoreItems && (
                                        <div className="flex justify-center mt-4">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={handleLoadMore}
                                            >
                                                Cargar más ({availableSubjects.length - visibleItemsLimit} restantes)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 h-[400px]">
                                    <p className="text-muted-foreground">
                                        {globalSearchTerm 
                                            ? 'No se encontraron materias disponibles con ese término.' 
                                            : subjects.length === 0 
                                                ? 'No hay materias en el sistema.'
                                                : 'Todas las materias han sido asignadas.'}
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Columna Derecha: Materias Asignadas por Semestre */}
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Plan de Estudio</CardTitle>
                        <CardDescription>
                            Materias organizadas por semestre
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {totalSelectedSubjects === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center p-8 h-[400px] border-2 border-dashed border-muted rounded-lg">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        Aún no has asignado materias.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selecciona materias de la columna izquierda.
                                    </p>
                                </div>
                            ) : (
                                <Accordion type="multiple" defaultValue={['sem-1']} className="w-full">
                                    {Array.from({ length: numberOfSemesters }, (_, i) => i + 1).map(sem => {
                                        const semesterSubjects = subjectsBySemester[sem] || []
                                        const count = semesterSubjects.length
                                        
                                        return (
                                            <AccordionItem key={sem} value={`sem-${sem}`}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold">{sem}° Semestre</span>
                                                        <Badge variant={count > 0 ? "default" : "outline"} className="text-xs">
                                                            {count} {count === 1 ? 'materia' : 'materias'}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {count === 0 ? (
                                                        <p className="text-sm text-muted-foreground py-2 px-4">
                                                            No hay materias asignadas a este semestre.
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2 pt-2">
                                                            {semesterSubjects.map(subject => (
                                                                <AssignedSubjectItem
                                                                    key={subject.id}
                                                                    subject={subject}
                                                                    semester={sem}
                                                                    numberOfSemesters={numberOfSemesters}
                                                                    onMove={handleMoveSubject}
                                                                    onRemove={handleRemoveSubject}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Footer con acciones */}
            <Card className="rounded-xl">
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                    <Button 
                        variant="outline" 
                        onClick={() => startTransition(() => setStep(1))}
                        disabled={isSubmitting || isPending}
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
                                Guardar Plan de Estudio
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
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
            <Toast ref={toast} />
            <FloatingBackButton />
            <div className="flex flex-col">
                <PageTitle>Crear Plan de Estudio</PageTitle>
                <p className="text-muted-foreground">
                    Define un nuevo plan para la carrera: {career?.name || `Carrera #${careerId}`}
                </p>
            </div>
            
            {step === 1 && renderStep1()}
            {shouldRenderStep2 && renderStep2()}
        </div>
    )
}
