
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { Subject, Career, StudyPlanRecord } from '@/lib/modelos'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/auth-context'
import { getStudyPlanByCareerId, getSubjects, getCareers } from '@/services/api'
import { Skeleton } from '@/components/ui/skeleton'
import { FloatingBackButton } from '@/components/ui/floating-back-button'

interface EnrichedStudyPlanRecord extends StudyPlanRecord {
  subjectName: string;
}

export default function PlanEstudioPage() {
    const params = useParams()
    const router = useRouter();
    const { user } = useAuth()

    const careerId = Number(params.careerId);

    const [studyPlans, setStudyPlans] = useState<EnrichedStudyPlanRecord[]>([]);
    const [careerInfo, setCareerInfo] = useState<Career | null>(null);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(careerId)) {
            setError("ID de carrera inválido.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [planData, subjectsData, careersData] = await Promise.all([
                    getStudyPlanByCareerId(careerId),
                    getSubjects(), // Fetch all subjects to map names
                    getCareers()
                ]);

                const currentCareer = careersData.find(c => c.id === careerId) || null;
                setCareerInfo(currentCareer);

                if (planData.length === 0 && currentCareer === null) {
                    // This can happen if the career exists but has no study plan yet.
                    // Or if the career ID is totally invalid.
                    // The getCareers call helps us differentiate.
                    setError("No se encontró información para esta carrera o no tiene un plan de estudios asignado.");
                }
                
                const enrichedPlanData = planData.map(plan => {
                    const subject = subjectsData.find(s => s.id === plan.id_materia);
                    return {
                        ...plan,
                        subjectName: subject?.name || 'Materia Desconocida'
                    }
                });

                setStudyPlans(enrichedPlanData);

            } catch (err: any) {
                setError(err.message || "Error al cargar los datos del plan de estudio.");
                if (err.message.includes('404')) {
                    router.push('/carreras');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [careerId, router]);

    const modalities = useMemo(() => {
        const modalityMap = new Map<number, { name: string; subjects: EnrichedStudyPlanRecord[] }>();
        studyPlans.forEach(plan => {
            if (!modalityMap.has(plan.id_modalidad)) {
                modalityMap.set(plan.id_modalidad, { name: plan.modalidad, subjects: [] });
            }
            modalityMap.get(plan.id_modalidad)!.subjects.push(plan);
        });
        return Array.from(modalityMap.entries());
    }, [studyPlans]);

    const getOrdinal = (n: number) => `${n}°`;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
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
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col gap-8">
                <FloatingBackButton />
                 <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                    <h3 className="text-lg font-semibold text-white">No se pudo cargar el Plan de Estudio</h3>
                    <p className="text-muted-foreground mt-2">
                        {error}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Planes de Estudio: {careerInfo?.name || `Carrera #${careerId}`}
                </h1>
                <p className="text-muted-foreground">
                    Gestiona las modalidades y materias de la carrera.
                </p>
            </div>
            
            {modalities.length > 0 ? (
                modalities.map(([modalityId, modalityData]) => {
                     const semesters = [...new Set(modalityData.subjects.map(s => s.nivel_orden))].sort((a,b) => a-b);
                     
                     return (
                        <Card key={modalityId} className="rounded-xl">
                            <CardHeader>
                                <CardTitle>Modalidad: {modalityData.name}</CardTitle>
                                <CardDescription>
                                    Materias asignadas a esta modalidad, agrupadas por grado.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {semesters.length > 0 ? (
                                     <Tabs defaultValue={`sem-${semesters[0]}`} className="w-full">
                                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0, 1fr))`}}>
                                            {semesters.map(semester => (
                                                <TabsTrigger key={semester} value={`sem-${semester}`} className="text-xs">
                                                    {getOrdinal(semester)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {semesters.map(semester => {
                                            const semesterSubjects = modalityData.subjects.filter(s => s.nivel_orden === semester);
                                            return (
                                                <TabsContent key={semester} value={`sem-${semester}`}>
                                                    <div className="flex justify-end my-4">
                                                        <Button>
                                                            <PlusCircle className="mr-2 h-4 w-4" />
                                                            Añadir Materia al {getOrdinal(semester)} Grado
                                                        </Button>
                                                    </div>
                                                    {semesterSubjects.length > 0 ? (
                                                         <div className='rounded-xl overflow-hidden'>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Nombre de la Materia</TableHead>
                                                                        <TableHead>Acciones</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {semesterSubjects.map(subject => (
                                                                        <TableRow key={subject.id_materia}>
                                                                            <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                                                            <TableCell>
                                                                                <div className="flex gap-2">
                                                                                    <Button size="icon" variant="warning">
                                                                                        <Pencil className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button size="icon" variant="destructive">
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                                                            <h3 className="text-lg font-semibold text-white">Grado Vacío</h3>
                                                            <p className="text-muted-foreground mt-2">Aún no se han asignado materias para este grado.</p>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            )
                                        })}
                                     </Tabs>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                                       <h3 className="text-lg font-semibold text-white">Modalidad Vacía</h3>
                                       <p className="text-muted-foreground mt-2">Aún no se han asignado materias para esta modalidad.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                 <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                    <h3 className="text-lg font-semibold text-white">Sin Planes de Estudio</h3>
                    <p className="text-muted-foreground mt-2">
                       Esta carrera aún no tiene modalidades o planes de estudio asignados.
                    </p>
                </div>
            )}
        </div>
    )
}

    