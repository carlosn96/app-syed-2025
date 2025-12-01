
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { getCareers, getModalities, getSubjects, createStudyPlan } from '@/services/api'
import { CareerSummary, Modality, Subject } from '@/lib/modelos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Search } from 'lucide-react'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface MateriaSeleccionada {
    id_materia: number;
    id_cat_nivel: number;
}

export default function CrearPlanEstudioPage() {
    const params = useParams()
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const careerId = Number(params.careerId);
    
    const [career, setCareer] = useState<CareerSummary | null>(null);
    const [modalities, setModalities] = useState<Modality[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
    const [numberOfSemesters, setNumberOfSemesters] = useState<number>(1);
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, number[]>>({});
    const [searchTerm, setSearchTerm] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            if (isNaN(careerId)) return;
            try {
                setIsLoading(true);
                const [careersData, modalitiesData, subjectsData] = await Promise.all([
                    getCareers(),
                    getModalities(),
                    getSubjects()
                ]);
                const currentCareer = careersData.find(c => c.id === careerId);
                setCareer(currentCareer || null);
                setModalities(modalitiesData);
                setSubjects(subjectsData);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos necesarios.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [careerId]);

    const handleProceedToSubjects = () => {
        if (!selectedModalityId || numberOfSemesters < 1) {
            toast.current?.show({ severity: 'warn', summary: 'Datos incompletos', detail: 'Por favor, selecciona una modalidad y define el número de semestres.' });
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
        for (let i = 1; i <= numberOfSemesters; i++) {
            const term = searchTerm[i]?.toLowerCase() || '';
            result[i] = subjects.filter(subject => subject.name.toLowerCase().includes(term));
        }
        return result;
    }, [subjects, searchTerm, numberOfSemesters]);

    const handleSubmit = async () => {
        if (!selectedModalityId) return;

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
            id_modalidad: selectedModalityId,
            materias: materias,
        };

        try {
            await createStudyPlan(payload);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plan de estudio creado correctamente.' });
            router.push(`/plan-estudio/${careerId}`);
        } catch (error) {
             if (error instanceof Error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al crear",
                    detail: error.message,
                });
            }
        }
    };

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
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                <>
                <div className="space-y-2">
                    <Label htmlFor="modality-select">Modalidad</Label>
                    <Select onValueChange={(value) => setSelectedModalityId(Number(value))}>
                        <SelectTrigger id="modality-select">
                            <SelectValue placeholder="Selecciona una modalidad" />
                        </SelectTrigger>
                        <SelectContent>
                            {modalities.map(m => (
                                <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                {filteredSubjects[sem].map(subject => (
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
                <Button onClick={handleSubmit}>Guardar Plan de Estudio</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="flex flex-col gap-8">
            <Toast ref={toast} />
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Crear Plan de Estudio
                </h1>
                <p className="text-muted-foreground">
                    Define un nuevo plan para la carrera: {isLoading ? "Cargando..." : career?.name || `Carrera #${careerId}`}
                </p>
            </div>
            
            {step === 1 ? renderStep1() : renderStep2()}
        </div>
    )
}

    