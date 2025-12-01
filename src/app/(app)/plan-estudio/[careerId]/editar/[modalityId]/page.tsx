
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { getCareers, getModalities, getSubjects, getStudyPlanByModality, updateStudyPlan } from '@/services/api'
import { CareerSummary, Modality, Subject, StudyPlanRecord } from '@/lib/modelos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Search } from 'lucide-react'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MateriaSeleccionada {
    id_materia: number;
    id_cat_nivel: number;
}

export default function EditarPlanEstudioPage() {
    const params = useParams()
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const careerId = Number(params.careerId);
    const modalityId = Number(params.modalityId);
    
    const [career, setCareer] = useState<CareerSummary | null>(null);
    const [modality, setModality] = useState<Modality | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [numberOfSemesters, setNumberOfSemesters] = useState<number>(1);
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, number[]>>({});
    const [searchTerm, setSearchTerm] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            if (isNaN(careerId) || isNaN(modalityId)) return;
            try {
                setIsLoading(true);
                const [careersData, modalitiesData, subjectsData, planData] = await Promise.all([
                    getCareers(),
                    getModalities(),
                    getSubjects(),
                    getStudyPlanByModality(modalityId)
                ]);

                const currentCareer = careersData.find(c => c.id === careerId);
                setCareer(currentCareer || null);
                
                const currentModality = modalitiesData.find(m => m.id === modalityId);
                setModality(currentModality || null);

                setSubjects(subjectsData);

                if (planData && planData.length > 0) {
                    const maxSemester = planData.reduce((max, p) => p.nivel_orden > max ? p.nivel_orden : max, 0);
                    setNumberOfSemesters(maxSemester);

                    const initialSelectedSubjects = planData.reduce((acc, record) => {
                        const semester = record.nivel_orden;
                        if (!acc[semester]) {
                            acc[semester] = [];
                        }
                        acc[semester].push(record.id_materia);
                        return acc;
                    }, {} as Record<number, number[]>);
                    setSelectedSubjects(initialSelectedSubjects);
                }

            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del plan.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [careerId, modalityId]);
    
    const handleProceedToSubjects = () => {
        if (numberOfSemesters < 1) {
            toast.current?.show({ severity: 'warn', summary: 'Datos incompletos', detail: 'Por favor, define el número de semestres.' });
            return;
        }
        setStep(2);
    };

    const handleSubjectSelection = (semester: number, subjectId: number, isSelected: boolean) => {
        setSelectedSubjects(prev => {
            const currentSemesterSubjects = prev[semester] || [];
            if (isSelected) {
                return { ...prev, [semester]: [...currentSemesterSubjects, subjectId] };
            } else {
                return { ...prev, [semester]: currentSemesterSubjects.filter(id => id !== subjectId) };
            }
        });
    };

    const filteredSubjects = useMemo(() => {
        const result: Record<number, Subject[]> = {};
        const allSelectedIds = new Set(Object.values(selectedSubjects).flat());

        for (let i = 1; i <= numberOfSemesters; i++) {
            const term = searchTerm[i]?.toLowerCase() || '';
            const currentSemesterSelectedIds = new Set(selectedSubjects[i] || []);

            result[i] = subjects.filter(subject => {
                const nameMatches = subject.name.toLowerCase().includes(term);
                const isSelectedInOtherSemester = allSelectedIds.has(subject.id) && !currentSemesterSelectedIds.has(subject.id);
                
                return nameMatches && !isSelectedInOtherSemester;
            });
        }
        return result;
    }, [subjects, searchTerm, numberOfSemesters, selectedSubjects]);

    const handleSubmit = async () => {
        if (!modalityId) return;

        const materias: MateriaSeleccionada[] = Object.entries(selectedSubjects).flatMap(([semester, subjectIds]) => 
            subjectIds.map(subjectId => ({
                id_materia: subjectId,
                id_cat_nivel: Number(semester)
            }))
        );

        if (materias.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Plan vacío', detail: 'Debes seleccionar al menos una materia.' });
            return;
        }
        
        const payload = {
            id_carrera: careerId,
            id_modalidad: modalityId,
            materias: materias,
        };

        try {
            await updateStudyPlan(modalityId, payload);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plan de estudio actualizado correctamente.' });
            router.push(`/plan-estudio/${careerId}`);
        } catch (error) {
             if (error instanceof Error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al actualizar",
                    detail: error.message,
                });
            }
        }
    };
    
    const renderStep1 = () => (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Paso 1: Define la Estructura</CardTitle>
                <CardDescription>
                    Ajusta la duración en semestres para este plan de estudios. La modalidad no se puede cambiar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                <>
                <div className="space-y-2">
                    <Label htmlFor="modality-select">Modalidad</Label>
                    <Input id="modality-select" value={modality?.nombre || ''} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="semesters">Duración en Semestres</Label>
                    <Input id="semesters" type="number" min="1" max="12" value={numberOfSemesters} onChange={e => setNumberOfSemesters(Number(e.target.value))} />
                </div>
                </>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleProceedToSubjects} className="w-full" disabled={isLoading}>
                    Continuar a la Selección de Materias
                </Button>
            </CardFooter>
        </Card>
    );

    const renderStep2 = () => (
        <Card className="rounded-xl">
             <CardHeader>
                <CardTitle>Paso 2: Asigna las Materias</CardTitle>
                <CardDescription>
                    Selecciona las materias correspondientes para cada semestre del plan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="sem-1" className="w-full">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${numberOfSemesters > 0 ? numberOfSemesters : 1}, minmax(0, 1fr))`}}>
                        {Array.from({ length: numberOfSemesters }, (_, i) => i + 1).map(sem => (
                             <TabsTrigger key={`tab-${sem}`} value={`sem-${sem}`}>{sem}°</TabsTrigger>
                        ))}
                    </TabsList>
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
                            <ScrollArea className="h-72 w-full rounded-md border p-4">
                                <div className="space-y-2">
                                {(filteredSubjects[sem] || []).map(subject => (
                                    <div key={subject.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`sub-${sem}-${subject.id}`}
                                            checked={(selectedSubjects[sem] || []).includes(subject.id)}
                                            onCheckedChange={(checked) => handleSubjectSelection(sem, subject.id, !!checked)}
                                        />
                                        <label htmlFor={`sub-${sem}-${subject.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {subject.name}
                                        </label>
                                    </div>
                                ))}
                                </div>
                           </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Regresar</Button>
                <Button onClick={handleSubmit}>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="flex flex-col gap-8">
            <Toast ref={toast} />
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Editar Plan de Estudio
                </h1>
                <p className="text-muted-foreground">
                    Modificando el plan para la carrera: {isLoading ? "Cargando..." : `${career?.name || 'Carrera desconocida'} - ${modality?.nombre || 'Modalidad desconocida'}`}
                </p>
            </div>
            
             {isLoading ? (
                <div className="space-y-6">
                    <Card className="rounded-xl">
                        <CardHeader>
                            <Skeleton className="h-7 w-1/3" />
                            <Skeleton className="h-5 w-2/3 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                step === 1 ? renderStep1() : renderStep2()
            )}
        </div>
    )
}
