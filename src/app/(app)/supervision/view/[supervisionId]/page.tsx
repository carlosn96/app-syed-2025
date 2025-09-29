
"use client"

import { useParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { Supervision, EvaluationResult, SupervisionRubric } from '@/lib/modelos'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSupervisions, getSupervisionRubrics } from '@/services/api'
import { Skeleton } from '@/components/ui/skeleton'
import { FloatingBackButton } from '@/components/ui/floating-back-button'

const getScoreColor = (score: number) => {
    if (score < 60) return 'bg-destructive/80';
    if (score < 80) return 'bg-yellow-500/80';
    return 'bg-success/80';
};

export default function ViewSupervisionPage() {
    const params = useParams()
    const supervisionId = Number(params.supervisionId)
    
    const [supervisionData, setSupervisionData] = useState<{ supervision: Supervision; evaluationData: EvaluationResult; rubrics: SupervisionRubric[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const allSupervisions = await getSupervisions();
          const rubrics = await getSupervisionRubrics();
          const supervision = allSupervisions.find(s => s.id === supervisionId);
          if (!supervision) {
            throw new Error("Supervisión no encontrada");
          }
          // Assuming evaluationData is part of the supervision object from API
          const evaluationData = supervision.evaluationData || {}; 
          setSupervisionData({ supervision, evaluationData, rubrics });
        } catch(err: any) {
          setError(err.message || "Error al cargar los datos de la supervisión");
        } finally {
          setIsLoading(false);
        }
      }
      fetchData();
    }, [supervisionId]);

    if (isLoading) {
        return (
          <div className="flex flex-col gap-8">
            <Card className="rounded-xl">
              <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-96 w-full" /></CardContent>
            </Card>
          </div>
        );
    }

    if (error || !supervisionData) {
        return <p className="text-destructive text-center">{error || "No se encontraron datos."}</p>
    }

    const { supervision, evaluationData, rubrics } = supervisionData;

    if (supervision.status !== 'Completada' || !evaluationData) {
        return (
             <div className="flex flex-col gap-8">
                 <FloatingBackButton />
                 <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Evaluación No Disponible</CardTitle>
                        <CardDescription>
                            Esta supervisión aún no ha sido completada o los datos de la evaluación no están disponibles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p>Docente: <span className='text-primary'>{supervision.teacher}</span></p>
                         <p>Carrera: <span className='text-primary'>{supervision.career}</span></p>
                         <div className="flex items-center gap-2">
                            <span>Estado:</span>
                            <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>{supervision.status}</Badge>
                         </div>
                    </CardContent>
                 </Card>
             </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <Card className="rounded-xl">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Detalle de Supervisión</CardTitle>
                            <CardDescription>
                                Docente: <span className='text-primary'>{supervision.teacher}</span> | Carrera: <span className='text-primary'>{supervision.career}</span>
                            </CardDescription>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground">Calificación Final</p>
                             <p className={`text-3xl font-bold rounded-md px-3 py-1 text-white ${getScoreColor(supervision.score || 0)}`}>
                                {supervision.score}%
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {rubrics.map(rubric => {
                        const rubricResult = evaluationData[`rubric_${rubric.id}`];
                        if (!rubricResult) return null;

                        return (
                            <div key={rubric.id}>
                                <h3 className="text-xl font-headline font-semibold text-white mb-2">{rubric.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{rubric.type}</p>
                                
                                <div className="space-y-4">
                                    {rubric.criteria.map((criterion, index) => {
                                        const criterionResult = rubricResult.criteria[`criterion_${criterion.id}`];
                                        const meetsCriteria = criterionResult === 'yes';

                                        return (
                                            <div key={criterion.id} className="p-3 bg-black/10 rounded-lg">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="flex-grow text-base">{index + 1}. {criterion.text}</p>
                                                    <div className={`flex items-center gap-2 font-semibold ${meetsCriteria ? 'text-green-400' : 'text-red-400'}`}>
                                                        {meetsCriteria ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                                        <span>{meetsCriteria ? 'Cumplió' : 'No Cumplió'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {rubricResult.observations && (
                                     <div className="mt-6">
                                        <Separator className="mb-4" />
                                        <h4 className="text-base font-semibold">Observaciones</h4>
                                        <p className="text-muted-foreground mt-2 text-sm p-3 bg-black/20 rounded-lg whitespace-pre-wrap">
                                            {rubricResult.observations}
                                        </p>
                                    </div>
                                )}
                                
                                <Separator className="mt-8" />
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

    