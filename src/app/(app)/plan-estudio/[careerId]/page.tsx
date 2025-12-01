
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/auth-context'
import { getStudyPlanByCareerId, getSubjects, getCareers, deleteStudyPlan } from '@/services/api'
import { Skeleton } from '@/components/ui/skeleton'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { Toast } from 'primereact/toast'

interface EnrichedStudyPlanRecord extends StudyPlanRecord {
  subjectName: string;
}

export default function PlanEstudioPage() {
    const params = useParams()
    const router = useRouter();
    const { user } = useAuth()
    const toast = useRef<Toast>(null);

    const careerId = Number(params.careerId);

    const [studyPlans, setStudyPlans] = useState<EnrichedStudyPlanRecord[]>([]);
    const [careerInfo, setCareerInfo] = useState<Career | null>(null);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [planToDelete, setPlanToDelete] = useState<{ id: number, name: string } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [planData, subjectsData, careersData] = await Promise.all([
                getStudyPlanByCareerId(careerId),
                getSubjects(), 
                getCareers()
            ]);

            const currentCareer = careersData.find(c => c.id === careerId) || null;
            setCareerInfo(currentCareer as any);

            if (planData.length === 0 && !currentCareer) {
                setError("No se encontró información para esta carrera.");
                setStudyPlans([]);
            } else if (planData.length === 0 && currentCareer) {
                 // Career exists but has no study plan, which is a valid state
                setStudyPlans([]);
            } else {
                const enrichedPlanData = planData.map(plan => {
                    const subject = subjectsData.find(s => s.id === plan.id_materia);
                    return {
                        ...plan,
                        subjectName: subject?.name || 'Materia Desconocida'
                    }
                });
                setStudyPlans(enrichedPlanData);
            }

        } catch (err: any) {
             if (err instanceof Error && err.message.includes("Unexpected end of JSON input")) {
                setStudyPlans([]);
                setError(null);
                try {
                    const careersData = await getCareers();
                    const currentCareer = careersData.find(c => c.id === careerId) || null;
                    setCareerInfo(currentCareer as any);
                } catch (careerError) {
                    setError("Error al cargar la información de la carrera.");
                }
            } else {
                setError((err as Error).message || "Error al cargar los datos del plan de estudio.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isNaN(careerId)) {
            setError("ID de carrera inválido.");
            setIsLoading(false);
            return;
        }
        fetchData();
    }, [careerId]);

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

    const handleDeletePlan = async () => {
        if (!planToDelete) return;
        try {
            await deleteStudyPlan(planToDelete.id);
            toast.current?.show({
                severity: "success",
                summary: "Plan de Estudio Eliminado",
                detail: `El plan de estudios para la modalidad ${planToDelete.name} ha sido eliminado.`,
            });
            fetchData();
        } catch (error) {
            if (error instanceof Error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al eliminar",
                    detail: error.message,
                });
            }
        } finally {
            setPlanToDelete(null);
        }
    };

    const getOrdinal = (n: number) => `${n}°`;

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
            <Toast ref={toast} />
            <FloatingBackButton />
             <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el plan de estudios completo para la modalidad
                            <span className="font-bold text-white"> {planToDelete?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlan}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className='flex flex-col'>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                        Planes de Estudio: {careerInfo?.name || `Carrera #${careerId}`}
                    </h1>
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
            
            {modalities.length > 0 ? (
                modalities.map(([modalityId, modalityData]) => {
                     const semesters = [...new Set(modalityData.subjects.map(s => s.nivel_orden))].sort((a,b) => a-b);
                     
                     return (
                        <Card key={modalityId} className="rounded-xl">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Modalidad: {modalityData.name}</CardTitle>
                                        <CardDescription>
                                            Materias asignadas a esta modalidad, agrupadas por grado.
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline">
                                            <Link href={`/plan-estudio/${careerId}/editar/${modalityId}`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar Plan
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" onClick={() => setPlanToDelete({ id: modalityId, name: modalityData.name })}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar Plan
                                        </Button>
                                    </div>
                                </div>
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
                                                    <div className='rounded-xl overflow-hidden mt-4'>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Nombre de la Materia</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {semesterSubjects.map(subject => (
                                                                    <TableRow key={subject.id_materia}>
                                                                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
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
