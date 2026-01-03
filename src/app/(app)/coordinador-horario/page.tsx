"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Grid3x3, List, Clock, BookOpen, Users, GraduationCap, AlertCircle, ChevronLeft, ChevronRight, Filter, Building2, Briefcase, ChevronDown } from 'lucide-react';
import { getGroups, getMateriasAsignadas, getCiclosEscolaresCoordinador, getDiasCoordinador, getPlantelesForCoordinador, getCarrerasForCoordinador, getTurnosCoordinador } from '@/services/api';
import { DocenteMateria, Group, Horario, Plantel, CareerSummary } from '@/lib/modelos';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ViewMode = 'day' | 'grid';

interface ExtendedDocenteMateria extends DocenteMateria {
    materia?: string;
    nombre_grupo?: string;
    nombre_docente?: string;
}

interface DaySchedule {
    [hour: string]: ExtendedDocenteMateria[];
}

interface WeekSchedule {
    [day: string]: DaySchedule;
}

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

const COLOR_CLASSES = [
    'border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-card',
    'border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-card',
    'border-l-4 border-l-success bg-gradient-to-br from-success/5 to-card',
    'border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-card',
    'border-l-4 border-l-info bg-gradient-to-br from-info/5 to-card',
];

export default function CoordinadorHorarioPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedDay, setSelectedDay] = useState<string>('Lunes');
    const [selectedCiclo, setSelectedCiclo] = useState<string>('');
    const [selectedPlantel, setSelectedPlantel] = useState<string>('');
    const [selectedCarrera, setSelectedCarrera] = useState<string>('');
    const [selectedTurno, setSelectedTurno] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');

    const [groups, setGroups] = useState<Group[]>([]);
    const [ciclos, setCiclos] = useState<{ id_ciclo: number; anio: number; id_cat_periodo: number; periodo_nombre: string }[]>([]);
    const [planteles, setPlanteles] = useState<Plantel[]>([]);
    const [carreras, setCarreras] = useState<CareerSummary[]>([]);
    const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([]);
    const [materiasAsignadas, setMateriasAsignadas] = useState<ExtendedDocenteMateria[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);

    // Color map para materias
    const materiaColorMap = useMemo(() => {
        const map = new Map<number, string>();
        materiasAsignadas.forEach((materia, index) => {
            map.set(materia.id_materia, COLOR_CLASSES[index % COLOR_CLASSES.length]);
        });
        return map;
    }, [materiasAsignadas]);

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [ciclosData, plantelesData, carrerasData, turnosData] = await Promise.all([
                    getCiclosEscolaresCoordinador(),
                    getPlantelesForCoordinador(),
                    getCarrerasForCoordinador(),
                    getTurnosCoordinador()
                ]);

                setCiclos(ciclosData);
                setPlanteles(plantelesData);
                setCarreras(Array.isArray(carrerasData) ? carrerasData : [carrerasData]);
                setTurnos(turnosData);

                if (ciclosData.length > 0) {
                    setSelectedCiclo(String(ciclosData[0].id_ciclo));
                }
                if (plantelesData.length > 0) {
                    setSelectedPlantel(String(plantelesData[0].id));
                }
                const carrerasArray = Array.isArray(carrerasData) ? carrerasData : [carrerasData];
                if (carrerasArray.length > 0) {
                    setSelectedCarrera(String(carrerasArray[0].id));
                }
                if (turnosData.length > 0) {
                    setSelectedTurno(String(turnosData[0].id));
                }
            } catch (err) {
                setError('Error al cargar datos iniciales');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Cargar grupos cuando cambian los filtros
    useEffect(() => {
        const loadGroups = async () => {
            if (!selectedCiclo) return;

            try {
                setLoading(true);
                const groupsData = await getGroups();
                
                // Filtrar grupos según los filtros seleccionados
                let filteredGroups = groupsData;
                
                if (selectedPlantel) {
                    filteredGroups = filteredGroups.filter(g => g.id_plantel === Number(selectedPlantel));
                }
                if (selectedCarrera) {
                    filteredGroups = filteredGroups.filter(g => g.id_carrera === Number(selectedCarrera));
                }
                if (selectedTurno) {
                    filteredGroups = filteredGroups.filter(g => g.id_turno === Number(selectedTurno));
                }
                
                setGroups(filteredGroups);

                if (filteredGroups.length > 0 && !selectedGroup) {
                    setSelectedGroup(String(filteredGroups[0].id_grupo));
                } else if (filteredGroups.length === 0) {
                    setSelectedGroup('');
                    setMateriasAsignadas([]);
                }
            } catch (err) {
                setError('Error al cargar grupos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadGroups();
    }, [selectedCiclo, selectedPlantel, selectedCarrera, selectedTurno]);

    // Cargar materias asignadas cuando cambia el grupo
    useEffect(() => {
        const loadMaterias = async () => {
            if (!selectedGroup || !selectedCiclo) return;

            try {
                setLoading(true);
                const materiasData = await getMateriasAsignadas(Number(selectedGroup), Number(selectedCiclo));
                console.log("Materias Asignadas Loaded:", materiasData);
                
                // Buscar el grupo seleccionado directamente al momento de enriquecer
                setGroups(prevGroups => {
                    const selectedGroupData = prevGroups.find(g => g.id_grupo === Number(selectedGroup));
                    const enrichedMaterias: ExtendedDocenteMateria[] = materiasData.map(m => ({
                        ...m,
                        nombre_grupo: selectedGroupData?.acronimo || `Grupo ${selectedGroup}`
                    }));
                    console.log("Materias Asignadas Enriched:", enrichedMaterias);
                    setMateriasAsignadas(enrichedMaterias);
                    return prevGroups;
                });
                
                setError(null);
            } catch (err) {
                setError('Error al cargar horarios');
                console.error(err);
                setMateriasAsignadas([]);
            } finally {
                setLoading(false);
            }
        };

        loadMaterias();
    }, [selectedGroup, selectedCiclo]);

    // Organizar horarios por día y hora
    const scheduleByWeek: WeekSchedule = useMemo(() => {
        const schedule: WeekSchedule = {};

        DAYS_ORDER.forEach(day => {
            schedule[day] = {};
        });

        materiasAsignadas.forEach(materia => {
            materia.horarios.forEach(horario => {
                const day = horario.dia || '';
                if (!day || !schedule[day]) return;

                const startHour = horario.hora_inicio.substring(0, 5);

                if (!schedule[day][startHour]) {
                    schedule[day][startHour] = [];
                }

                schedule[day][startHour].push(materia);
            });
        });

        return schedule;
    }, [materiasAsignadas]);

    // Calcular duración de clase en bloques de 1 hora
    const getClassDuration = (startTime: string, endTime: string): number => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        return Math.ceil(durationMinutes / 60);
    };

    const renderScheduleCard = (materia: ExtendedDocenteMateria, horario: Horario, index: number) => {
        const duration = getClassDuration(horario.hora_inicio, horario.hora_fin);
        const colorClass = materiaColorMap.get(materia.id_materia) || COLOR_CLASSES[0];

        return (
            <Card
                key={`${materia.id_materia}-${horario.id_dia}-${index}`}
                className={cn(
                    "transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                    colorClass
                )}
                style={{
                    gridRow: viewMode === 'grid' ? `span ${duration}` : undefined,
                    minHeight: viewMode === 'grid' ? `${duration * 80}px` : undefined
                }}
            >
                <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold line-clamp-2 flex-1">
                            {materia.materia || `Materia ${materia.id_materia}`}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0 font-mono">
                            {horario.hora_inicio.substring(0, 5)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{materia.nombre_docente || `Docente ID: ${materia.id_docente}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                            {`${horario.hora_inicio.substring(0, 5)} - ${horario.hora_fin.substring(0, 5)}`}
                        </span>
                        <span className="text-xs font-medium text-primary ml-auto">
                            {duration * 60}min
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderDayView = () => {
        const daySchedule = scheduleByWeek[selectedDay] || {};

        if (Object.keys(daySchedule).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Calendar className="h-12 w-12" />
                    </div>
                    <p className="text-lg font-medium">No hay clases programadas</p>
                    <p className="text-sm">para {selectedDay}</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">{selectedDay}</h3>
                            <p className="text-sm text-muted-foreground">
                                {Object.keys(daySchedule).length} bloques horarios
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                const currentIndex = DAYS_ORDER.indexOf(selectedDay);
                                const prevIndex = (currentIndex - 1 + DAYS_ORDER.length) % DAYS_ORDER.length;
                                setSelectedDay(DAYS_ORDER[prevIndex]);
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                const currentIndex = DAYS_ORDER.indexOf(selectedDay);
                                const nextIndex = (currentIndex + 1) % DAYS_ORDER.length;
                                setSelectedDay(DAYS_ORDER[nextIndex]);
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {HOURS.map(hour => {
                        const classes = daySchedule[hour];
                        if (!classes || classes.length === 0) return null;

                        return (
                            <div key={hour} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="font-mono text-sm px-3 py-1.5 shrink-0">
                                        {hour}
                                    </Badge>
                                    <Separator className="flex-1" />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {classes.map((materia, idx) => {
                                        const horario = materia.horarios.find(h =>
                                            h.dia === selectedDay && h.hora_inicio.substring(0, 5) === hour
                                        );
                                        if (!horario) return null;
                                        return renderScheduleCard(materia, horario, idx);
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderGridView = () => {
        const hasSchedule = Object.values(scheduleByWeek).some(day => Object.keys(day).length > 0);

        if (!hasSchedule) {
            return (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Grid3x3 className="h-12 w-12" />
                    </div>
                    <p className="text-lg font-medium">No hay horarios disponibles</p>
                    <p className="text-sm">Seleccione un grupo con materias asignadas</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-[1200px]">
                    {/* Header */}
                    <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-3 mb-4 sticky top-0 bg-background z-10 pb-4">
                        <div className="flex items-center justify-center">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {DAYS_ORDER.map(day => (
                            <div key={day} className="text-center">
                                <div className="font-semibold text-sm mb-1">{day}</div>
                                <Badge variant="outline" className="text-xs">
                                    {Object.keys(scheduleByWeek[day] || {}).length} clases
                                </Badge>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-3 auto-rows-fr">
                        {HOURS.map(hour => (
                            <React.Fragment key={hour}>
                                <div className="flex items-start justify-center py-2 sticky left-0 bg-background z-10">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {hour}
                                    </Badge>
                                </div>
                                {DAYS_ORDER.map(day => {
                                    const classes = scheduleByWeek[day]?.[hour] || [];

                                    return (
                                        <div key={`${day}-${hour}`} className="min-h-[100px] p-1.5 rounded-lg border-2 border-dashed border-muted/50 hover:border-muted transition-colors">
                                            {classes.length > 0 && (
                                                <div className="space-y-2 h-full">
                                                    {classes.map((materia, idx) => {
                                                        const horario = materia.horarios.find(h =>
                                                            h.dia === day && h.hora_inicio.substring(0, 5) === hour
                                                        );
                                                        if (!horario) return null;
                                                        return renderScheduleCard(materia, horario, idx);
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const FilterPanel = () => (
        <div className="space-y-6 p-6">
            {/* Ciclo Escolar */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ciclo Escolar
                </Label>
                <RadioGroup value={selectedCiclo} onValueChange={setSelectedCiclo}>
                    <ScrollArea className="max-h-[180px] pr-3">
                        <div className="space-y-2">
                            {ciclos.map(ciclo => (
                                <div key={ciclo.id_ciclo}>
                                    <RadioGroupItem
                                        value={String(ciclo.id_ciclo)}
                                        id={`ciclo-${ciclo.id_ciclo}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`ciclo-${ciclo.id_ciclo}`}
                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-foreground"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">{ciclo.anio} - {ciclo.periodo_nombre}</div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </RadioGroup>
            </div>

            <Separator />

            {/* Plantel */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Plantel
                </Label>
                <RadioGroup value={selectedPlantel} onValueChange={setSelectedPlantel}>
                    <ScrollArea className="max-h-[180px] pr-3">
                        <div className="space-y-2">
                            {planteles.map(plantel => (
                                <div key={plantel.id}>
                                    <RadioGroupItem
                                        value={String(plantel.id)}
                                        id={`plantel-${plantel.id}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`plantel-${plantel.id}`}
                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-foreground"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-foreground truncate">{plantel.name}</div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </RadioGroup>
            </div>

            <Separator />

            {/* Carrera */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Carrera
                </Label>
                <RadioGroup value={selectedCarrera} onValueChange={setSelectedCarrera}>
                    <ScrollArea className="max-h-[180px] pr-3">
                        <div className="space-y-2">
                            {carreras.map(carrera => (
                                <div key={carrera.id}>
                                    <RadioGroupItem
                                        value={String(carrera.id)}
                                        id={`carrera-${carrera.id}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`carrera-${carrera.id}`}
                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-foreground"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-foreground truncate">{carrera.name}</div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </RadioGroup>
            </div>

            <Separator />

            {/* Turno */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Turno
                </Label>
                <RadioGroup value={selectedTurno} onValueChange={setSelectedTurno}>
                    <ScrollArea className="max-h-[180px] pr-3">
                        <div className="space-y-2">
                            {turnos.map(turno => (
                                <div key={turno.id}>
                                    <RadioGroupItem
                                        value={String(turno.id)}
                                        id={`turno-${turno.id}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`turno-${turno.id}`}
                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-foreground"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">{turno.nombre}</div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </RadioGroup>
            </div>

            <Separator />

            {/* Grupo */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Grupo
                </Label>
                {groups.length > 0 ? (
                    <RadioGroup value={selectedGroup} onValueChange={setSelectedGroup}>
                        <ScrollArea className="max-h-[180px] pr-3">
                            <div className="space-y-2">
                                {groups.map(group => (
                                    <div key={group.id_grupo}>
                                        <RadioGroupItem
                                            value={String(group.id_grupo)}
                                            id={`group-${group.id_grupo}`}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={`group-${group.id_grupo}`}
                                            className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 cursor-pointer transition-all hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-foreground"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-foreground truncate">{group.acronimo}</div>
                                                <div className="text-xs text-primary text-muted-foreground truncate">
                                                    {group.carrera} • {group.nivel}
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </RadioGroup>
                ) : (
                    <div className="text-sm text-muted-foreground text-center p-4 border-2 border-dashed rounded-lg bg-muted/20">
                        {selectedCiclo ? 'No hay grupos disponibles con los filtros seleccionados' : 'Seleccione los filtros para ver grupos'}
                    </div>
                )}
            </div>

            <Separator />

        </div>
    );

    const selectedCicloData = ciclos.find(c => c.id_ciclo === Number(selectedCiclo));
    const selectedPlantelData = planteles.find(p => p.id === Number(selectedPlantel));
    const selectedCarreraData = carreras.find(c => c.id === Number(selectedCarrera));
    const selectedTurnoData = turnos.find(t => t.id === Number(selectedTurno));
    const selectedGroupData = groups.find(g => g.id_grupo === Number(selectedGroup));

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Horarios de Clases</h1>
                    <p className="text-muted-foreground mt-1">
                        Consulte y gestione los horarios de las materias asignadas
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {materiasAsignadas.length > 0 && (
                        <>
                            <Badge variant="secondary" className="px-3 py-1.5">
                                {materiasAsignadas.length} Materias
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1.5">
                                {materiasAsignadas.reduce((acc, m) => acc + m.horarios.length, 0)} Bloques
                            </Badge>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Filter Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden w-full gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[350px] p-0">
                    <SheetHeader className="px-6 py-4 border-b">
                        <SheetTitle>Filtros</SheetTitle>
                        <SheetDescription>Configure la vista de horarios</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-80px)]">
                        <FilterPanel />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Context Info */}
            {(selectedCicloData || selectedPlantelData || selectedCarreraData || selectedTurnoData || selectedGroupData) && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedCicloData && (
                                <Badge variant="outline" className="gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {selectedCicloData.anio} - {selectedCicloData.periodo_nombre}
                                </Badge>
                            )}
                            {selectedPlantelData && (
                                <Badge variant="outline" className="gap-2">
                                    <Building2 className="h-3 w-3" />
                                    {selectedPlantelData.name}
                                </Badge>
                            )}
                            {selectedCarreraData && (
                                <Badge variant="outline" className="gap-2">
                                    <GraduationCap className="h-3 w-3" />
                                    {selectedCarreraData.name}
                                </Badge>
                            )}
                            {selectedTurnoData && (
                                <Badge variant="outline" className="gap-2">
                                    <Clock className="h-3 w-3" />
                                    {selectedTurnoData.nombre}
                                </Badge>
                            )}
                            {selectedGroupData && (
                                <Badge variant="outline" className="gap-2">
                                    <Users className="h-3 w-3" />
                                    {selectedGroupData.acronimo}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex gap-6">
                {/* Desktop Filter Panel */}
                <div 
                    className={cn(
                        "hidden md:block transition-all duration-300 ease-in-out sticky top-6 h-fit",
                        isFilterPanelCollapsed ? "w-[60px]" : "w-[320px]"
                    )}
                >
                    <Card className="h-fit">
                        <CardHeader 
                            className="pb-4 cursor-pointer select-none hover:bg-accent/50 transition-colors rounded-t-lg"
                            onClick={() => setIsFilterPanelCollapsed(!isFilterPanelCollapsed)}
                        >
                            {!isFilterPanelCollapsed ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Filter className="h-5 w-5" />
                                            Filtros
                                        </CardTitle>
                                        <CardDescription>Configure la vista de horarios</CardDescription>
                                    </div>
                                    <ChevronLeft className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Filter className="h-5 w-5 text-muted-foreground" />
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </CardHeader>
                        {!isFilterPanelCollapsed && (
                            <>
                                <Separator />
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <FilterPanel />
                                </ScrollArea>
                            </>
                        )}
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg">Horario</CardTitle>
                                        <CardDescription>
                                            {viewMode === 'grid' ? 'Vista semanal completa' : `Vista del día ${selectedDay}`}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* View Mode Selector */}
                                        <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/50">
                                            <Button
                                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('grid')}
                                                className="gap-2 h-8"
                                            >
                                                <Grid3x3 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Cuadrícula</span>
                                            </Button>
                                            <Button
                                                variant={viewMode === 'day' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('day')}
                                                className="gap-2 h-8"
                                            >
                                                <List className="h-4 w-4" />
                                                <span className="hidden sm:inline">Por Día</span>
                                            </Button>
                                        </div>
                                        {/* Day Selector (only in day mode) */}
                                        {viewMode === 'day' && (
                                            <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
                                                {DAYS_ORDER.map(day => (
                                                    <Button
                                                        key={day}
                                                        variant={selectedDay === day ? 'default' : 'ghost'}
                                                        size="sm"
                                                        onClick={() => setSelectedDay(day)}
                                                        className="h-8 w-10 p-0 text-xs font-medium"
                                                    >
                                                        {day.substring(0, 3)}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="p-6">
                                {viewMode === 'grid' ? renderGridView() : renderDayView()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}