"use client"

import { useState, useEffect, useRef } from "react"
import toast from 'react-hot-toast'
import { Search, Eye, Mail, GraduationCap, BookOpen } from "lucide-react"

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
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import { ResponsiveDataView, DataCard, DataField, DataColumn } from "@/components/ui/responsive-data-view"

import { Docente, MateriaRecord } from "@/lib/modelos"
import {
    getCarrerasForCoordinador,
    getPlantelesForCoordinador,
    getTurnosCoordinador,
    getCiclosEscolaresCoordinador,
    getDocentesForCoordinadorByDetails
} from "@/services/api"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function DocentesPorCicloPage() {
    const { user } = useAuth()

    // Filters
    const [selectedCarrera, setSelectedCarrera] = useState<string>("")
    const [selectedPlantel, setSelectedPlantel] = useState<string>("")
    const [selectedTurno, setSelectedTurno] = useState<string>("")
    const [selectedCicloEscolar, setSelectedCicloEscolar] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")

    // Data
    const [docentes, setDocentes] = useState<Docente[]>([])
    const [carreras, setCarreras] = useState<{ id_carrera: number; carrera: string }[]>([])
    const [planteles, setPlanteles] = useState<{ id: number; name: string }[]>([])
    const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([])
    const [ciclosEscolares, setCiclosEscolares] = useState<{ id_ciclo: number; anio: number; id_cat_periodo: number; periodo_nombre: string }[]>([])

    // Loading states
    const [isLoadingDocentes, setIsLoadingDocentes] = useState(false)
    const [isLoadingFilters, setIsLoadingFilters] = useState(true)

    // Details dialog
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null)

    // Load filter options
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                setIsLoadingFilters(true)
                const [carrerasData, plantelesData, turnosData, ciclosData] = await Promise.all([
                    getCarrerasForCoordinador(),
                    getPlantelesForCoordinador(),
                    getTurnosCoordinador(),
                    getCiclosEscolaresCoordinador()
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

                // Seleccionar automáticamente la primera carrera
                if (mappedCarreras.length > 0) {
                    setSelectedCarrera(mappedCarreras[0].id_carrera.toString())
                }

            } catch (error) {
                console.error("Error loading filter options:", error)
                toast.error("No se pudieron cargar las opciones de filtro")
            } finally {
                setIsLoadingFilters(false)
            }
        }

        loadFilterOptions()
    }, [user])

    // Load docentes when all filters are selected
    useEffect(() => {
        const loadDocentes = async () => {
            // Only fetch if all required filters are selected
            if (!selectedCarrera || !selectedPlantel || !selectedTurno || !selectedCicloEscolar) {
                setDocentes([])
                return
            }

            try {
                setIsLoadingDocentes(true)
                const data = await getDocentesForCoordinadorByDetails(
                    parseInt(selectedCarrera),
                    parseInt(selectedCicloEscolar),
                    parseInt(selectedPlantel),
                    parseInt(selectedTurno)
                )
                setDocentes(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error loading docentes:", error)
                toast.error("No se pudieron cargar los docentes")
                setDocentes([])
            } finally {
                setIsLoadingDocentes(false)
            }
        }

        loadDocentes()
    }, [selectedCarrera, selectedPlantel, selectedTurno, selectedCicloEscolar])

    // Filter docentes
    const filteredDocentes = docentes.filter(docente => {
        const matchesSearch = docente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            docente.correo.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    // Check if all filters are selected
    const canShowDocentes = selectedCarrera && selectedPlantel && selectedTurno && selectedCicloEscolar

    // Handle view details
    const handleViewDetails = (docente: Docente) => {
        setSelectedDocente(docente)
        setIsDetailsDialogOpen(true)
    }

    const clearFilters = () => {
        setSelectedCarrera("")
        setSelectedPlantel("")
        setSelectedTurno("")
        setSelectedCicloEscolar("")
        setSearchTerm("")
    }

    // Get current filter context for display
    const getFilterContext = () => ({
        carrera: carreras.find(c => c.id_carrera.toString() === selectedCarrera)?.carrera || '',
        plantel: planteles.find(p => p.id.toString() === selectedPlantel)?.name || '',
        turno: turnos.find(t => t.id.toString() === selectedTurno)?.nombre || '',
        ciclo: (() => {
            const ciclo = ciclosEscolares.find(c => c.id_ciclo.toString() === selectedCicloEscolar);
            return ciclo ? `${ciclo.anio} - ${ciclo.periodo_nombre}` : '';
        })()
    })

    // Table columns configuration
    const columns: DataColumn<Docente>[] = [
        {
            key: 'nombre',
            header: 'Nombre',
            cell: (docente) => (
                <span className="font-medium">{docente.nombre_completo}</span>
            )
        },
        {
            key: 'correo',
            header: 'Correo',
            cell: (docente) => docente.correo
        },
        {
            key: 'grado',
            header: 'Grado Académico',
            cell: (docente) => (
                <Badge variant="outline">{docente.grado_academico}</Badge>
            )
        },
        {
            key: 'acciones',
            header: 'Acciones',
            className: 'text-right',
            cell: (docente) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(docente)}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    Ver detalles
                </Button>
            )
        }
    ]

    // Mobile card renderer
    const renderMobileCard = (docente: Docente) => (
        <DataCard
            actions={
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewDetails(docente)}
                    className="w-full gap-2"
                >
                    <Eye className="h-4 w-4" />
                    Ver detalles
                </Button>
            }
        >
            <div className="space-y-2">
                <h3 className="font-semibold text-base text-slate-900">
                    {docente.nombre_completo}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{docente.correo}</span>
                </div>
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Badge variant="outline">{docente.grado_academico}</Badge>
                </div>
            </div>
        </DataCard>
    )

    return (
        <div className="flex flex-col gap-6">
            

            <PageTitle>Docentes por Ciclo</PageTitle>

            {/* Filters Section */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
                    <CardDescription>
                        Selecciona todos los filtros para visualizar los docentes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingFilters ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full rounded-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Carrera Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="carrera">Carrera *</Label>
                                    <Select value={selectedCarrera} onValueChange={setSelectedCarrera}>
                                        <SelectTrigger id="carrera">
                                            <SelectValue placeholder="Selecciona carrera" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carreras.map(carrera => (
                                                <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                    {carrera.carrera}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Plantel Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="plantel">Plantel *</Label>
                                    <Select value={selectedPlantel} onValueChange={setSelectedPlantel}>
                                        <SelectTrigger id="plantel">
                                            <SelectValue placeholder="Selecciona plantel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {planteles.map(plantel => (
                                                <SelectItem key={plantel.id} value={plantel.id.toString()}>
                                                    {plantel.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Turno Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="turno">Turno *</Label>
                                    <Select value={selectedTurno} onValueChange={setSelectedTurno}>
                                        <SelectTrigger id="turno">
                                            <SelectValue placeholder="Selecciona turno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {turnos.map(turno => (
                                                <SelectItem key={turno.id} value={turno.id.toString()}>
                                                    {turno.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Ciclo Escolar Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="ciclo-escolar">Ciclo Escolar *</Label>
                                    <Select value={selectedCicloEscolar} onValueChange={setSelectedCicloEscolar}>
                                        <SelectTrigger id="ciclo-escolar">
                                            <SelectValue placeholder="Selecciona ciclo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ciclosEscolares.map(ciclo => (
                                                <SelectItem key={ciclo.id_ciclo} value={ciclo.id_ciclo.toString()}>
                                                    {ciclo.anio} - {ciclo.periodo_nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Search and Clear */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="search">Buscar docente</Label>
                                    <div className="relative mt-2">
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

                                {(selectedCarrera || selectedPlantel || selectedTurno || selectedCicloEscolar) && (
                                    <div className="flex items-end">
                                        <Button variant="outline" onClick={clearFilters}>
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Filter Status */}
                            {!canShowDocentes && (
                                <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        * Por favor selecciona todos los filtros requeridos para visualizar los docentes
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Filters Info */}
            {canShowDocentes && (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {getFilterContext().carrera}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {getFilterContext().plantel}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {getFilterContext().turno}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {getFilterContext().ciclo}
                    </Badge>
                </div>
            )}

            {/* Docentes List */}
            {canShowDocentes && (
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                                <CardTitle className="text-lg">Docentes</CardTitle>
                                <CardDescription>
                                    {filteredDocentes.length} docente(s) encontrado(s)
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingDocentes ? (
                            <div className="space-y-4">
                                {/* Mobile skeleton */}
                                <div className="md:hidden space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="p-4 border rounded-xl space-y-3">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-9 w-full mt-2" />
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop skeleton */}
                                <div className="hidden md:block space-y-2">
                                    <div className="flex gap-4 p-3 border-b">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex gap-4 p-3 border-b">
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-8 w-28 ml-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ResponsiveDataView
                                data={filteredDocentes}
                                columns={columns}
                                keyExtractor={(docente) => docente.id_docente}
                                renderMobileCard={renderMobileCard}
                                maxHeight="500px"
                                emptyMessage="No se encontraron docentes con los criterios seleccionados"
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Detalles del Docente
                        </DialogTitle>
                        <DialogDescription>
                            Información del docente según los filtros seleccionados
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDocente && (
                        <div className="space-y-4 py-2">
                            {/* Context Info */}
                            <div className="bg-muted/50 border border-border rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Contexto de consulta
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="secondary" className="text-xs">
                                        {getFilterContext().carrera}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {getFilterContext().plantel}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {getFilterContext().turno}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {getFilterContext().ciclo}
                                    </Badge>
                                </div>
                            </div>
                            <Separator />
                            {/* Docente Info */}
                            <div className="space-y-3">
                                <DataField
                                    label="Nombre completo"
                                    value={
                                        <span className="font-semibold text-slate-900">
                                            {selectedDocente.nombre_completo}
                                        </span>
                                    }
                                />
                                <DataField
                                    label="Correo electrónico"
                                    value={selectedDocente.correo}
                                />
                                <DataField
                                    label="Grado académico"
                                    value={
                                        <Badge variant="outline">{selectedDocente.grado_academico}</Badge>
                                    }
                                />
                            </div>

                            <Separator />





                            {/* Materias Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Materias que imparte</span>
                                </div>

                                {selectedDocente.materias && selectedDocente.materias.length > 0 ? (
                                    <ScrollArea className="h-auto max-h-48">
                                        <div className="space-y-2">
                                            {selectedDocente.materias.map((materia) => (
                                                <div
                                                    key={materia.id_materia}
                                                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                                >
                                                    <span className="text-sm">{materia.nombre_materia}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="text-center py-4 text-sm text-muted-foreground bg-slate-50 rounded-lg">
                                        No hay materias asignadas en este contexto
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
