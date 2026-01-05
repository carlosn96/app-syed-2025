"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Toast } from 'primereact/toast'
import { Plus, Search, UserPlus, Mail, GraduationCap as GraduationCapIcon, Sparkles, Loader2, ChevronDown, ChevronUp, Clock, X } from "lucide-react"

import { PageTitle } from "@/components/layout/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


import { Docente, DocenteMateria, MateriaRecord, Modality, Group, Horario } from "@/lib/modelos"
import {
    getCarrerasForCoordinador,
    getPlantelesForCoordinador,
    getDocentesForCoordinador,
    getTurnosCoordinador,
    getCiclosEscolaresCoordinador,
    getStudyPlanByCareerAndModality,
    getModalidadesCoordinador,
    assignDocenteToMateria,
    getGroupsByFilters,
    getMateriasAsignadas,
    getDiasCoordinador,
    getPlantelesForCareer
} from "@/services/api"
import { useAuth } from "@/context/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"


export default function DocentesPorCicloPage() {
    const toast = useRef<Toast>(null)
    const { user } = useAuth()

    // Filters
    const [selectedCarrera, setSelectedCarrera] = useState<string>("")
    const [selectedPlantel, setSelectedPlantel] = useState<string>("")
    const [selectedTurno, setSelectedTurno] = useState<string>("")
    const [selectedCicloEscolar, setSelectedCicloEscolar] = useState<string>("")
    const [selectedModalidad, setSelectedModalidad] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(true)

    // Data
    const [docentes, setDocentes] = useState<Docente[]>([])
    const [carreras, setCarreras] = useState<{ id_carrera: number; carrera: string }[]>([])
    const [planteles, setPlanteles] = useState<{ id: number; name: string }[]>([])
    const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([])
    const [ciclosEscolares, setCiclosEscolares] = useState<{ id_ciclo: number; anio: number; id_cat_periodo: number; periodo_nombre: string }[]>([])
    const [modalidades, setModalidades] = useState<Modality[]>([])
    const [materias, setMaterias] = useState<MateriaRecord[]>([])
    const [grupos, setGrupos] = useState<Group[]>([])
    const [selectedGrupo, setSelectedGrupo] = useState<string>("")
    const [materiasAsignadas, setMateriasAsignadas] = useState<Set<number>>(new Set())
    const [todasMateriasAsignadas, setTodasMateriasAsignadas] = useState<DocenteMateria[]>([])

    // Loading states
    const [isLoadingDocentes, setIsLoadingDocentes] = useState(false)
    const [isLoadingFilters, setIsLoadingFilters] = useState(true)
    const [isLoadingMaterias, setIsLoadingMaterias] = useState(false)
    const [isLoadingGrupos, setIsLoadingGrupos] = useState(false)
    const [isSavingAssignment, setIsSavingAssignment] = useState(false)

    // Pagination & Infinite Scroll
    const [allDocentes, setAllDocentes] = useState<Docente[]>([]) // All docentes from API
    const [displayedDocentes, setDisplayedDocentes] = useState<Docente[]>([]) // Currently displayed
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const ITEMS_PER_PAGE = 20

    // Update planteles when selectedCarrera changes
    useEffect(() => {
        const updatePlantelesForCarrera = async () => {
            if (!selectedCarrera) return

            try {
                const plantelesData = await getPlantelesForCareer(parseInt(selectedCarrera))
                setPlanteles(plantelesData)
                
                // Check if selectedPlantel is still valid
                if (selectedPlantel && !plantelesData.find(p => p.id.toString() === selectedPlantel)) {
                    setSelectedPlantel("")
                }
            } catch (error) {
                console.error("Error updating planteles for carrera:", error)
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron actualizar los planteles para la carrera seleccionada"
                })
            }
        }

        updatePlantelesForCarrera()
    }, [selectedCarrera, toast, selectedPlantel])

    // Assignment dialog
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null)
    const [selectedMateria, setSelectedMateria] = useState<string>("")
    const [materiaSearchTerm, setMateriaSearchTerm] = useState("")
    
    // Horarios
    const [dias, setDias] = useState<{ id: number; nombre: string }[]>([])
    const [horarios, setHorarios] = useState<Horario[]>([])
    const [selectedDia, setSelectedDia] = useState<string>("")
    const [horaInicio, setHoraInicio] = useState<string>("")
    const [horaFin, setHoraFin] = useState<string>("")

    // Load filter options
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                setIsLoadingFilters(true)
                const [carrerasData, plantelesData, turnosData, ciclosData, modalidadesData, diasData] = await Promise.all([
                    getCarrerasForCoordinador(),
                    getPlantelesForCoordinador(),
                    getTurnosCoordinador(),
                    getCiclosEscolaresCoordinador(),
                    getModalidadesCoordinador(),
                    getDiasCoordinador()
                ])

                // Mapear CareerSummary a formato esperado
                const carrerasArray = Array.isArray(carrerasData) ? carrerasData : [carrerasData]
                const mappedCarreras = carrerasArray.map(c => ({
                    id_carrera: c.id,
                    carrera: c.name
                }))

                setCarreras(mappedCarreras)
                setPlanteles(plantelesData)
                setTurnos(turnosData)
                setCiclosEscolares(ciclosData)
                setModalidades(modalidadesData)
                setDias(diasData)

                // Seleccionar automáticamente la primera carrera
                if (mappedCarreras.length > 0) {
                    setSelectedCarrera(mappedCarreras[0].id_carrera.toString())
                }

            } catch (error) {
                console.error("Error loading filter options:", error)
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron cargar las opciones de filtro"
                })
            } finally {
                setIsLoadingFilters(false)
            }
        }

        loadFilterOptions()
    }, [user])

    // Load all docentes once
    const loadAllDocentes = useCallback(async () => {
        try {
            setIsLoadingDocentes(true)
            const docentesData = await getDocentesForCoordinador()
            // docentesData is already an array from the updated API function
            setAllDocentes(docentesData)
            // Display first page
            const firstPage = docentesData.slice(0, ITEMS_PER_PAGE)
            setDisplayedDocentes(firstPage)
            setCurrentPage(1)
            setHasMore(docentesData.length > ITEMS_PER_PAGE)
        } catch (error) {
            console.error("Error loading docentes:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudieron cargar los docentes"
            })
            setAllDocentes([])
            setDisplayedDocentes([])
        } finally {
            setIsLoadingDocentes(false)
        }
    }, [])

    // Load more docentes (pagination)
    const loadMoreDocentes = useCallback(() => {
        if (isLoadingMore || !hasMore) return

        setIsLoadingMore(true)

        // Simulate async loading
        setTimeout(() => {
            const startIndex = displayedDocentes.length
            const endIndex = startIndex + ITEMS_PER_PAGE
            const nextPageData = allDocentes.slice(startIndex, endIndex)

            setDisplayedDocentes(prev => [...prev, ...nextPageData])
            setCurrentPage(prev => prev + 1)
            setHasMore(endIndex < allDocentes.length)
            setIsLoadingMore(false)
        }, 300)
    }, [allDocentes, displayedDocentes.length, isLoadingMore, hasMore])

    // Initial load
    useEffect(() => {
        loadAllDocentes()
    }, [loadAllDocentes])

    // Load assigned materias
    const loadMateriasAsignadas = useCallback(async () => {
        // Solo cargar materias asignadas cuando haya un grupo y ciclo escolar seleccionados
        if (!selectedGrupo || !selectedCicloEscolar) {
            setMateriasAsignadas(new Set())
            setTodasMateriasAsignadas([])
            return
        }

        try {
            const asignadas = await getMateriasAsignadas(parseInt(selectedGrupo), parseInt(selectedCicloEscolar))
            setTodasMateriasAsignadas(asignadas)
            
            // Los datos ya vienen filtrados por grupo del backend
            // Solo necesitamos extraer los IDs de las materias
            const idsAsignados = new Set<number>()
            asignadas.forEach(asignacion => {
                idsAsignados.add(asignacion.id_materia)
            })
            setMateriasAsignadas(idsAsignados)
        } catch (error) {
            console.error("Error loading materias asignadas:", error)
            setMateriasAsignadas(new Set())
            setTodasMateriasAsignadas([])
        }
    }, [selectedGrupo, selectedCicloEscolar])

    // Load materias when carrera or modalidad changes
    useEffect(() => {
        const loadMaterias = async () => {
            if (!selectedCarrera || !selectedModalidad) {
                setMaterias([])
                return
            }

            try {
                setIsLoadingMaterias(true)
                const studyPlanData = await getStudyPlanByCareerAndModality(parseInt(selectedCarrera), parseInt(selectedModalidad))

                // Extract all materias from all modalities
                const allMaterias: MateriaRecord[] = []
                studyPlanData.forEach(plan => {
                    plan.materias.forEach(materia => {
                        // Avoid duplicates
                        if (!allMaterias.find(m => m.id_materia === materia.id_materia)) {
                            allMaterias.push(materia)
                        }
                    })
                })

                setMaterias(allMaterias)
            } catch (error) {
                console.error("Error loading materias:", error)
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: error instanceof Error ? error.message : "No se pudieron cargar las materias"
                })
                setMaterias([])
            } finally {
                setIsLoadingMaterias(false)
            }
        }

        loadMaterias()
    }, [selectedCarrera, selectedModalidad])

    // Load grupos when carrera, plantel, turno, or modalidad are selected
    useEffect(() => {
        const loadGrupos = async () => {
            if (!selectedCarrera || !selectedPlantel || !selectedTurno || !selectedModalidad) {
                setGrupos([])
                setSelectedGrupo("")
                return
            }

            try {
                setIsLoadingGrupos(true)
                const gruposData = await getGroupsByFilters(
                    parseInt(selectedCarrera),
                    parseInt(selectedPlantel),
                    parseInt(selectedTurno)
                )
                setGrupos(gruposData)
            } catch (error) {
                console.error("Error loading grupos:", error)
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron cargar los grupos"
                })
                setGrupos([])
            } finally {
                setIsLoadingGrupos(false)
            }
        }

        loadGrupos()
    }, [selectedCarrera, selectedPlantel, selectedTurno, selectedModalidad])

    // Load materias asignadas when grupo or ciclo escolar changes
    useEffect(() => {
        loadMateriasAsignadas()
    }, [loadMateriasAsignadas])

    // Filter materias by selected grupo's nivel
    const materiasFiltradasPorNivel = useMemo(() => {
        if (!selectedGrupo || grupos.length === 0) {
            return materias
        }

        const grupo = grupos.find(g => g.id_grupo.toString() === selectedGrupo)
        if (!grupo) {
            return materias
        }

        // Filter materias that match the grupo's nivel
        return materias.filter(materia => materia.id_cat_nivel === grupo.id_nivel)
    }, [materias, selectedGrupo, grupos])

    // Materias asignadas ya vienen filtradas por grupo del backend
    const materiasAsignadasEnContexto = useMemo(() => {
        return todasMateriasAsignadas
    }, [todasMateriasAsignadas])

    // Filter displayed docentes (memoized)
    const filteredDocentes = useMemo(() => {
        if (!searchTerm) return displayedDocentes

        return displayedDocentes.filter(docente => {
            const matchesSearch = docente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                docente.correo.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })
    }, [displayedDocentes, searchTerm])

    // Check if all filters are selected
    const canShowDocentes = selectedCarrera && selectedPlantel && selectedTurno && selectedCicloEscolar && selectedModalidad

    const handleAssignMateria = (docente: Docente) => {
        setSelectedDocente(docente)
        setSelectedMateria("")
        setMateriaSearchTerm("")
        setHorarios([])
        setSelectedDia("")
        setHoraInicio("")
        setHoraFin("")
        setIsAssignDialogOpen(true)
    }

    const handleAddHorario = () => {
        if (!selectedDia || !horaInicio || !horaFin) {
            toast.current?.show({
                severity: "warn",
                summary: "Campos incompletos",
                detail: "Por favor completa todos los campos del horario"
            })
            return
        }

        const diaObj = dias.find(d => d.id.toString() === selectedDia)
        const nuevoHorario: Horario = {
            id_dia: parseInt(selectedDia),
            dia: diaObj?.nombre,
            hora_inicio: horaInicio,
            hora_fin: horaFin
        }

        setHorarios([...horarios, nuevoHorario])
        setSelectedDia("")
        setHoraInicio("")
        setHoraFin("")
    }

    const handleRemoveHorario = (index: number) => {
        setHorarios(horarios.filter((_, i) => i !== index))
    }

    const getAsignacionInfo = useCallback((materiaId: number) => {
        // Los datos ya vienen filtrados por grupo del backend
        return todasMateriasAsignadas.find(a => a.id_materia === materiaId)
    }, [todasMateriasAsignadas])

    const handleSaveAssignment = async () => {
        if (!selectedDocente || !selectedMateria || !selectedCarrera || !selectedPlantel || !selectedTurno || !selectedCicloEscolar || !selectedModalidad || !selectedGrupo) {
            toast.current?.show({
                severity: "warn",
                summary: "Campos incompletos",
                detail: "Por favor selecciona todos los campos requeridos incluyendo el grupo"
            })
            return
        }

        if (horarios.length === 0) {
            toast.current?.show({
                severity: "warn",
                summary: "Horarios requeridos",
                detail: "Por favor agrega al menos un horario para la materia"
            })
            return
        }

        try {
            setIsSavingAssignment(true)

            // Preparar horarios sin el nombre del día para enviar al backend
            const horariosParaEnviar = horarios.map(h => ({
                id_dia: h.id_dia,
                hora_inicio: h.hora_inicio,
                hora_fin: h.hora_fin
            }))

            await assignDocenteToMateria({
                id_docente: selectedDocente.id_docente,
                id_materia: parseInt(selectedMateria),
                id_grupo: parseInt(selectedGrupo),
                id_ciclo_escolar: parseInt(selectedCicloEscolar),
                horarios: horariosParaEnviar
            })

            toast.current?.show({
                severity: "success",
                summary: "Asignación exitosa",
                detail: `${selectedDocente.nombre_completo} ha sido asignado a la materia`
            })

            // Reload materias asignadas to update the list
            await loadMateriasAsignadas()

            setIsAssignDialogOpen(false)
            setSelectedDocente(null)
            setSelectedMateria("")
            setHorarios([])
        } catch (error) {
            console.error("Error assigning docente to materia:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo asignar el docente a la materia: " + (error instanceof Error ? error.message : "")
            })
        } finally {
            setIsSavingAssignment(false)
        }
    }

    const clearFilters = () => {
        setSelectedCarrera("")
        setSelectedPlantel("")
        setSelectedTurno("")
        setSelectedCicloEscolar("")
        setSelectedModalidad("")
        setSelectedGrupo("")
        setSearchTerm("")
    }

    return (
        <div className="flex flex-col gap-8">
            <Toast ref={toast} />

            <PageTitle>Asignación de Docentes</PageTitle>

            {/* Filters Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <CardTitle>Parámetros de Configuración</CardTitle>
                            <CardDescription>
                                Selecciona todos los parámetros para asignar a los docentes disponibles
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className="ml-4"
                            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                        >
                            {showFilters ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {showFilters && (
                    <CardContent>
                        {isLoadingFilters ? (
                            <div className="space-y-6">
                                {[...Array(3)].map((_, sectionIdx) => (
                                    <div key={sectionIdx} className="space-y-3">
                                        <div className="h-6 bg-muted rounded animate-pulse w-48" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-64" />
                                        <div className="space-y-2">
                                            {[...Array(2)].map((_, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-4 bg-muted rounded animate-pulse w-32" />
                                                    <div className="h-10 bg-muted rounded animate-pulse w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-5">
                                {/* Section 1: Contexto Académico */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                <GraduationCapIcon className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-semibold text-sm">1. Contexto Académico</h3>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Obligatorio</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Define el programa educativo y la modalidad de estudio
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-9 space-y-3 border-l-2 border-primary/20 pl-4">
                                        {/* Carrera */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="carrera" className="text-xs font-medium flex items-center gap-1.5">
                                                Carrera
                                                <span className="text-[10px] text-primary">• Paso 1</span>
                                            </Label>
                                            <Select value={selectedCarrera} onValueChange={(value) => {
                                                setSelectedCarrera(value)
                                                setSelectedModalidad("") // Reset dependent field
                                            }}>
                                                <SelectTrigger id="carrera" className="h-9">
                                                    <SelectValue placeholder="Selecciona el programa educativo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {carreras.map(carrera => (
                                                        <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                            {carrera.carrera}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!selectedCarrera && (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Selecciona una carrera para continuar
                                                </p>
                                            )}
                                        </div>

                                        {/* Modalidad */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="modalidad" className="text-xs font-medium flex items-center gap-1.5">
                                                Modalidad
                                                <span className="text-[10px] text-primary">• Paso 2</span>
                                            </Label>
                                            <Select
                                                value={selectedModalidad}
                                                onValueChange={setSelectedModalidad}
                                                disabled={!selectedCarrera}
                                            >
                                                <SelectTrigger id="modalidad" className="h-9" disabled={!selectedCarrera}>
                                                    <SelectValue placeholder={
                                                        !selectedCarrera
                                                            ? "Primero selecciona una carrera"
                                                            : "Selecciona la modalidad"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modalidades.map(modalidad => (
                                                        <SelectItem key={modalidad.id} value={modalidad.id.toString()}>
                                                            {modalidad.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!selectedCarrera ? (
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Depende de: Carrera
                                                </p>
                                            ) : selectedCarrera && !selectedModalidad && (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Selecciona la modalidad de estudio
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Ubicación Institucional */}
                                <div className={`space-y-3 transition-opacity ${!selectedCarrera || !selectedModalidad ? 'opacity-40' : 'opacity-100'}`}>
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-semibold text-sm">2. Ubicación Institucional</h3>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Obligatorio</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Especifica el plantel y horario de operación
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-9 space-y-3 border-l-2 border-blue-500/20 pl-4">
                                        {/* Plantel */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="plantel" className="text-xs font-medium flex items-center gap-1.5">
                                                Plantel
                                                <span className="text-[10px] text-blue-600 dark:text-blue-500">• Paso 3</span>
                                            </Label>
                                            <Select
                                                value={selectedPlantel}
                                                onValueChange={(value) => {
                                                    setSelectedPlantel(value)
                                                    setSelectedTurno("") // Reset dependent field
                                                }}
                                                disabled={!selectedCarrera || !selectedModalidad}
                                            >
                                                <SelectTrigger id="plantel" className="h-9" disabled={!selectedCarrera || !selectedModalidad}>
                                                    <SelectValue placeholder={
                                                        !selectedCarrera || !selectedModalidad
                                                            ? "Completa el contexto académico primero"
                                                            : "Selecciona el plantel"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {planteles.map(plantel => (
                                                        <SelectItem key={plantel.id} value={plantel.id.toString()}>
                                                            {plantel.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {(!selectedCarrera || !selectedModalidad) ? (
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Depende de: Carrera y Modalidad
                                                </p>
                                            ) : selectedCarrera && selectedModalidad && !selectedPlantel && (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Selecciona el plantel donde se impartirá
                                                </p>
                                            )}
                                        </div>

                                        {/* Turno */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="turno" className="text-xs font-medium flex items-center gap-1.5">
                                                Turno
                                                <span className="text-[10px] text-blue-600 dark:text-blue-500">• Paso 4</span>
                                            </Label>
                                            <Select
                                                value={selectedTurno}
                                                onValueChange={setSelectedTurno}
                                                disabled={!selectedPlantel}
                                            >
                                                <SelectTrigger id="turno" className="h-9" disabled={!selectedPlantel}>
                                                    <SelectValue placeholder={
                                                        !selectedPlantel
                                                            ? "Primero selecciona un plantel"
                                                            : "Selecciona el horario"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {turnos.map(turno => (
                                                        <SelectItem key={turno.id} value={turno.id.toString()}>
                                                            {turno.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!selectedPlantel ? (
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Depende de: Plantel
                                                </p>
                                            ) : selectedPlantel && !selectedTurno && (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Selecciona el turno de operación
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Período Académico */}
                                <div className={`space-y-3 transition-opacity ${!selectedTurno ? 'opacity-40' : 'opacity-100'}`}>
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                <svg className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-semibold text-sm">3. Ciclo Escolar</h3>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Obligatorio</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Define el ciclo escolar de asignación
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-9 space-y-3 border-l-2 border-purple-500/20 pl-4">
                                        {/* Ciclo Escolar */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="ciclo-escolar" className="text-xs font-medium flex items-center gap-1.5">
                                                Ciclo Escolar
                                                <span className="text-[10px] text-purple-600 dark:text-purple-500">• Paso 5</span>
                                            </Label>
                                            <Select
                                                value={selectedCicloEscolar}
                                                onValueChange={setSelectedCicloEscolar}
                                                disabled={!selectedCarrera || !selectedModalidad || !selectedPlantel || !selectedTurno}
                                            >
                                                <SelectTrigger id="ciclo-escolar" className="h-9" disabled={!selectedCarrera || !selectedModalidad || !selectedPlantel || !selectedTurno}>
                                                    <SelectValue placeholder={
                                                        !selectedCarrera || !selectedModalidad || !selectedPlantel || !selectedTurno
                                                            ? "Completa todos los campos anteriores"
                                                            : "Selecciona el ciclo escolar"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ciclosEscolares.map(ciclo => (
                                                        <SelectItem key={ciclo.id_ciclo} value={ciclo.id_ciclo.toString()}>
                                                            {ciclo.anio} - {ciclo.periodo_nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {(!selectedCarrera || !selectedModalidad || !selectedPlantel || !selectedTurno) ? (
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Depende de: Todos los filtros anteriores
                                                </p>
                                            ) : canShowDocentes ? (
                                                <div className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-500">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    ¡Configuración completa! Los docentes se mostrarán abajo.
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Selecciona el ciclo escolar para ver docentes
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium">Progreso de configuración</span>
                                        <span className="text-xs text-muted-foreground">
                                            {[selectedCarrera, selectedModalidad, selectedPlantel, selectedTurno, selectedCicloEscolar].filter(Boolean).length} / 5
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${([selectedCarrera, selectedModalidad, selectedPlantel, selectedTurno, selectedCicloEscolar].filter(Boolean).length / 5) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-2 pt-1">
                                    {(selectedCarrera || selectedPlantel || selectedTurno || selectedCicloEscolar || selectedModalidad) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Reiniciar todos los filtros
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        Ocultar filtros
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Selected Filters Info */}
            {canShowDocentes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Contexto Actual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                                Carrera: {carreras.find(c => c.id_carrera.toString() === selectedCarrera)?.carrera}
                            </Badge>
                            <Badge variant="secondary">
                                Plantel: {planteles.find(p => p.id.toString() === selectedPlantel)?.name}
                            </Badge>
                            <Badge variant="secondary">
                                Turno: {turnos.find(t => t.id.toString() === selectedTurno)?.nombre}
                            </Badge>
                            <Badge variant="secondary">
                                Ciclo Escolar: {(() => {
                                    const ciclo = ciclosEscolares.find(c => c.id_ciclo.toString() === selectedCicloEscolar);
                                    return ciclo ? `${ciclo.anio} - ${ciclo.periodo_nombre}` : '';
                                })()}
                            </Badge>
                            <Badge variant="secondary">
                                Modalidad: {modalidades.find(m => m.id.toString() === selectedModalidad)?.nombre}
                            </Badge>
                        </div>

                        {/* Loading materias indicator */}
                        {isLoadingMaterias && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">

                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Cargando materias...
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Obteniendo el plan de estudios de la carrera seleccionada
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No materias available warning */}
                        {!isLoadingMaterias && materias.length === 0 && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                        No hay materias disponibles
                                    </h4>
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        No se encontraron materias en el plan de estudios de la carrera seleccionada. Verifica que la carrera tenga un plan de estudios configurado.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Materias loaded successfully */}
                        {!isLoadingMaterias && materias.length > 0 && (
                            <div className="space-y-2">
                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        {materias.length} {materias.length === 1 ? 'materia disponible' : 'materias disponibles'} para asignación
                                    </p>
                                </div>
                                
                                {/* Materias asignadas en contexto actual */}
                                {selectedGrupo && materiasAsignadasEnContexto.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                                {materiasAsignadasEnContexto.length} {materiasAsignadasEnContexto.length === 1 ? 'materia asignada' : 'materias asignadas'} en este grupo
                                            </p>
                                        </div>
                                        <details className="text-xs text-blue-800 dark:text-blue-200">
                                            <summary className="cursor-pointer hover:text-blue-900 dark:hover:text-blue-100 select-none">
                                                Ver detalles
                                            </summary>
                                            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-blue-300 dark:border-blue-700">
                                                {materiasAsignadasEnContexto.map((asignacion, idx) => {
                                                    const materia = materias.find(m => m.id_materia === asignacion.id_materia)
                                                    const docente = allDocentes.find(d => d.id_docente === asignacion.id_docente)
                                                    return (
                                                        <div key={idx} className="text-[11px] leading-relaxed">
                                                            <span className="font-medium">{materia?.nombre_materia || 'Materia'}</span>
                                                            {docente && (
                                                                <span className="text-blue-700 dark:text-blue-300"> • {docente.nombre_completo}</span>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Grupos Selection */}
            {canShowDocentes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Selección de Grupo</CardTitle>
                        <CardDescription>
                            Selecciona el grupo para filtrar las materias disponibles según el nivel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingGrupos ? (
                            <div className="space-y-4">
                                <div className="h-10 bg-muted rounded animate-pulse w-full" />
                            </div>
                        ) : grupos.length === 0 ? (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                        No hay grupos disponibles
                                    </h4>
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        No se encontraron grupos con los filtros seleccionados
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grupo">Grupo</Label>
                                    <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
                                        <SelectTrigger id="grupo">
                                            <SelectValue placeholder="Selecciona un grupo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grupos.map(grupo => (
                                                <SelectItem key={grupo.id_grupo} value={grupo.id_grupo.toString()}>
                                                    {grupo.acronimo} - {grupo.nivel} ({grupo.modalidad})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedGrupo && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                                Grupo seleccionado
                                            </h4>
                                        </div>
                                        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                            <p><strong>Código:</strong> {grupos.find(g => g.id_grupo.toString() === selectedGrupo)?.codigo_inscripcion}</p>
                                            <p><strong>Nivel:</strong> {grupos.find(g => g.id_grupo.toString() === selectedGrupo)?.nivel}</p>
                                            <p><strong>Materias filtradas:</strong> {materiasFiltradasPorNivel.length} disponibles para este nivel</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Docentes List */}
            {canShowDocentes && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Docentes Disponibles
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {filteredDocentes.length} {filteredDocentes.length === 1 ? 'docente encontrado' : 'docentes encontrados'}
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Buscar por nombre o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingDocentes ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <CardHeader className="pb-3 bg-gradient-to-br from-muted/50 to-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                                <div className="h-3 bg-muted rounded animate-pulse flex-1" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                                <div className="h-5 bg-muted rounded animate-pulse w-20" />
                                            </div>
                                            <Separator className="my-3" />
                                            <div className="h-9 bg-muted rounded animate-pulse w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredDocentes.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="flex justify-center mb-4">
                                    <div className="rounded-full bg-muted p-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No se encontraron docentes</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    No hay docentes que coincidan con los criterios de búsqueda seleccionados
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Virtualized Grid with Infinite Scroll */}
                                <VirtualizedDocenteGrid
                                    docentes={filteredDocentes}
                                    hasMore={hasMore}
                                    isLoadingMore={isLoadingMore}
                                    loadMore={loadMoreDocentes}
                                    onAssign={handleAssignMateria}
                                    isLoadingMaterias={isLoadingMaterias}
                                    materiasCount={materias.length}
                                />

                                {/* Load More Button (fallback) */}
                                {hasMore && !isLoadingMore && filteredDocentes.length > 0 && (
                                    <div className="flex justify-center mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={loadMoreDocentes}
                                        >
                                            Cargar más docentes
                                        </Button>
                                    </div>
                                )}

                                {/* Loading More Indicator */}
                                {isLoadingMore && (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                                        <span className="text-sm text-muted-foreground">Cargando más docentes...</span>
                                    </div>
                                )}

                                {/* Total count */}
                                {filteredDocentes.length > 0 && (
                                    <p className="text-sm text-muted-foreground text-center mt-6">
                                        Mostrando {displayedDocentes.length} de {allDocentes.length} docentes
                                        {!hasMore && displayedDocentes.length === allDocentes.length && ' (todos cargados)'}
                                    </p>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Assignment Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>Asignar Materia a Docente</DialogTitle>
                        <DialogDescription>
                            Selecciona la materia que deseas asignar
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4">
                        <div className="space-y-4">
                            {/* Docente Info - Compact */}
                            <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                                        <span className="text-base font-bold text-primary">
                                            {selectedDocente?.nombre_completo.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm leading-tight truncate">
                                            {selectedDocente?.nombre_completo}
                                        </h4>
                                        <p className="text-xs text-muted-foreground truncate">{selectedDocente?.correo}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                        {selectedDocente?.grado_academico}
                                    </Badge>
                                </div>
                            </div>

                            {/* Context Info - Compact */}
                            <div className="bg-muted/40 border border-border rounded-lg p-2.5">
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Contexto de asignación</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <div><strong>Carrera:</strong> {carreras.find(c => c.id_carrera.toString() === selectedCarrera)?.carrera}</div>
                                    <div><strong>Plantel:</strong> {planteles.find(p => p.id.toString() === selectedPlantel)?.name}</div>
                                    <div><strong>Turno:</strong> {turnos.find(t => t.id.toString() === selectedTurno)?.nombre}</div>
                                    <div><strong>Ciclo:</strong> {(() => {
                                        const ciclo = ciclosEscolares.find(c => c.id_ciclo.toString() === selectedCicloEscolar);
                                        return ciclo ? `${ciclo.anio}-${ciclo.periodo_nombre}` : '';
                                    })()}</div>
                                    {selectedGrupo && (
                                        <>
                                            <div><strong>Grupo:</strong> {grupos.find(g => g.id_grupo.toString() === selectedGrupo)?.acronimo}</div>
                                            <div><strong>Nivel:</strong> {grupos.find(g => g.id_grupo.toString() === selectedGrupo)?.nivel}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Grupo warning if not selected */}
                            {!selectedGrupo && (
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                                    <svg className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                                            Selecciona un grupo primero
                                        </p>
                                        <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                                            Las materias se filtrarán según el nivel del grupo seleccionado
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Materia Selection */}
                            <div className="space-y-2">
                                <div>
                                    <Label className="text-sm font-semibold text-primary">Seleccionar Materia *</Label>
                                    {selectedGrupo && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Mostrando {materiasFiltradasPorNivel.length} materias del nivel seleccionado
                                        </p>
                                    )}
                                </div>

                                {isLoadingMaterias ? (
                                    <div className="flex justify-center py-6">
                                        <LoadingSpinner />
                                    </div>
                                ) : !selectedGrupo ? (
                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p className="text-sm">Selecciona un grupo para ver las materias disponibles</p>
                                    </div>
                                ) : materiasFiltradasPorNivel.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p className="text-sm">No hay materias disponibles para este nivel</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search input */}
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar materia..."
                                                value={materiaSearchTerm}
                                                onChange={(e) => setMateriaSearchTerm(e.target.value)}
                                                className="pl-8 h-9 text-sm"
                                            />
                                        </div>

                                        <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 border rounded-lg p-2 bg-muted/20">
                                            {materiasFiltradasPorNivel
                                                .filter(materia =>
                                                    materia.nombre_materia.toLowerCase().includes(materiaSearchTerm.toLowerCase())
                                                )
                                                .map((materia) => {
                                                    const isAssigned = materiasAsignadas.has(materia.id_materia)
                                                    const asignacionInfo = isAssigned ? getAsignacionInfo(materia.id_materia) : null
                                                    const docenteAsignado = asignacionInfo ? allDocentes.find(d => d.id_docente === asignacionInfo.id_docente) : null
                                                    
                                                    return (
                                                    <div
                                                        key={materia.id_materia}
                                                        onClick={() => !isAssigned && setSelectedMateria(materia.id_materia.toString())}
                                                        className={`
                                                    relative flex flex-col gap-2 p-2.5 rounded-md border-2 transition-all
                                                    ${isAssigned 
                                                        ? 'border-muted bg-muted/50 opacity-60 cursor-not-allowed'
                                                        : selectedMateria === materia.id_materia.toString()
                                                            ? 'border-primary bg-primary/5 cursor-pointer'
                                                            : 'border-border bg-background hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
                                                    }
                                                `}
                                                    >
                                                        {/* Top row: Radio/Check + Name + Badge */}
                                                        <div className="flex items-center gap-2">
                                                            {/* Radio indicator or assigned badge */}
                                                            {isAssigned ? (
                                                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <div className={`
                                                        w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                                        ${selectedMateria === materia.id_materia.toString()
                                                                    ? 'border-primary bg-primary'
                                                                    : 'border-muted-foreground/30'
                                                                }
                                                    `}>
                                                                {selectedMateria === materia.id_materia.toString() && (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                                                )}
                                                            </div>
                                                            )}

                                                            {/* Materia name */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium leading-tight line-clamp-2 ${
                                                                    isAssigned 
                                                                        ? 'text-muted-foreground'
                                                                        : selectedMateria === materia.id_materia.toString()
                                                                            ? 'text-primary'
                                                                            : 'text-foreground'
                                                                    }`}>
                                                                    ({materia.nivel} grado) - {materia.nombre_materia}
                                                                </p>
                                                            </div>

                                                            {/* Assigned badge */}
                                                            {isAssigned && (
                                                                <span className="shrink-0 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                                                    Asignada
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Assignment details: Docente + Horarios */}
                                                        {isAssigned && asignacionInfo && (
                                                            <div className="ml-6 space-y-1 text-xs text-muted-foreground border-l-2 border-muted pl-2">
                                                                {docenteAsignado && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        <span className="truncate">{docenteAsignado.nombre_completo}</span>
                                                                    </div>
                                                                )}
                                                                {asignacionInfo.horarios && asignacionInfo.horarios.length > 0 && (
                                                                    <div className="flex items-start gap-1.5">
                                                                        <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {asignacionInfo.horarios.map((h: Horario, idx: number) => (
                                                                                <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                                                                                    {h.dia}: {h.hora_inicio}-{h.hora_fin}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )})
                                            }
                                            {materias.filter(m => m.nombre_materia.toLowerCase().includes(materiaSearchTerm.toLowerCase())).length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <p className="text-sm">No se encontraron materias que coincidan con la búsqueda</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedMateria && materias.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-2">
                                        <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-green-800 dark:text-green-200 truncate">
                                            <strong>{materias.find(m => m.id_materia.toString() === selectedMateria)?.nombre_materia}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Horarios Section */}
                            {selectedMateria && (
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <Label className="text-sm font-semibold text-primary">Horarios de la Materia *</Label>
                                    </div>
                                    
                                    {/* Add Horario Form */}
                                    <div className="bg-muted/30 border rounded-lg p-3 space-y-3">
                                        <p className="text-xs text-muted-foreground">Agrega los días y horarios en que se impartirá la materia</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="dia" className="text-xs text-info">Día de la semana</Label>
                                                <Select value={selectedDia} onValueChange={setSelectedDia}>
                                                    <SelectTrigger id="dia" className="h-9">
                                                        <SelectValue placeholder="Selecciona un día" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dias.map(dia => (
                                                            <SelectItem key={dia.id} value={dia.id.toString()}>
                                                                {dia.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="hora-inicio" className="text-xs text-info">Hora inicio</Label>
                                                <Input
                                                    id="hora-inicio"
                                                    type="time"
                                                    value={horaInicio}
                                                    onChange={(e) => setHoraInicio(e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="hora-fin" className="text-xs text-info">Hora fin</Label>
                                                <Input
                                                    id="hora-fin"
                                                    type="time"
                                                    value={horaFin}
                                                    onChange={(e) => setHoraFin(e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddHorario}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Horario
                                        </Button>
                                    </div>

                                    {/* Lista de Horarios Agregados */}
                                    {horarios.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Horarios agregados ({horarios.length})
                                            </p>
                                            <div className="space-y-2">
                                                {horarios.map((horario, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-background border rounded-lg p-2.5 hover:border-primary/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <div className="text-sm">
                                                                <span className="font-medium">{horario.dia}</span>
                                                                <span className="text-muted-foreground mx-2">•</span>
                                                                <span className="text-muted-foreground">
                                                                    {horario.hora_inicio} - {horario.hora_fin}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveHorario(index)}
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {horarios.length === 0 && (
                                        <div className="text-center py-4 border-2 border-dashed rounded-lg">
                                            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                No hay horarios agregados
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Agrega al menos un horario para continuar
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Fixed footer with actions */}
                    <div className="border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAssignDialogOpen(false)}
                            disabled={isSavingAssignment}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveAssignment}
                            disabled={!selectedMateria || horarios.length === 0 || isSavingAssignment}
                        >
                            {isSavingAssignment ? (

                                <span className="ml-2">Asignando...</span>

                            ) : (
                                'Asignar Materia'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Virtualized Grid Component with Infinite Scroll
interface VirtualizedDocenteGridProps {
    docentes: Docente[]
    hasMore: boolean
    isLoadingMore: boolean
    loadMore: () => void
    onAssign: (docente: Docente) => void
    isLoadingMaterias: boolean
    materiasCount: number
}

function VirtualizedDocenteGrid({
    docentes,
    hasMore,
    isLoadingMore,
    loadMore,
    onAssign,
    isLoadingMaterias,
    materiasCount
}: VirtualizedDocenteGridProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || isLoadingMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(loadMoreRef.current)

        return () => observer.disconnect()
    }, [hasMore, isLoadingMore, loadMore])

    return (
        <>
            {/* Grid layout - only render visible items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docentes.map((docente) => (
                    <Card
                        key={docente.id_docente}
                        className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden"
                    >
                        <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                                        <span className="text-xl font-bold text-primary">
                                            {docente.nombre_completo.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                            {docente.nombre_completo}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground truncate" title={docente.correo}>
                                    {docente.correo}
                                </span>
                            </div>

                            {/* Academic Degree */}
                            <div className="flex items-center gap-2">
                                <GraduationCapIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Badge variant="secondary" className="font-normal">
                                    {docente.grado_academico}
                                </Badge>
                            </div>

                            <Separator className="my-3" />

                            {/* Action Button */}
                            <Button
                                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                variant="outline"
                                size="sm"
                                onClick={() => onAssign(docente)}
                                disabled={isLoadingMaterias || materiasCount === 0}
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Asignar Materia
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Invisible loader trigger for infinite scroll */}
            {hasMore && (
                <div
                    ref={loadMoreRef}
                    className="h-20 flex items-center justify-center"
                >
                    {isLoadingMore && (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    )}
                </div>
            )}
        </>
    )
}
