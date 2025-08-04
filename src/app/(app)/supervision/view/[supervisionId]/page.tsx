
"use client"

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { supervisions, supervisionRubrics, Supervision, EvaluationResult } from '@/lib/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const getScoreColor = (score: number) => {
    if (score < 60) return 'bg-destructive/80';
    if (score < 80) return 'bg-yellow-500/80';
    return 'bg-success/80';
};

export default function ViewSupervisionPage() {
    const params = useParams()
    const supervisionId = Number(params.supervisionId)
    
    const supervisionData = useMemo(() => {
        const supervision = supervisions.find(s => s.id === supervisionId) as Supervision & { evaluationData?: EvaluationResult };
        if (!supervision) return null;
        
        // This is a mock: in a real app, you would fetch the evaluation data from your backend
        // For now, we'll try to find it in the supervisions object if it was mocked there.
        const evaluationData = supervision.evaluationData || null;

        return { supervision, evaluationData };
    }, [supervisionId])


    if (!supervisionData || !supervisionData.supervision) {
        return <div>Supervisión no encontrada.</div>
    }

    const { supervision, evaluationData } = supervisionData;

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
                         <p>Materia: <span className='text-primary'>{supervision.subject}</span></p>
                         <p>Estado: <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>{supervision.status}</Badge></p>
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
                                Docente: <span className='text-primary'>{supervision.teacher}</span> | Materia: <span className='text-primary'>{supervision.subject}</span>
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
                    {supervisionRubrics.map(rubric => {
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
