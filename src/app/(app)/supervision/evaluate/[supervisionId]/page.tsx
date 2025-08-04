
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supervisions, supervisionRubrics, SupervisionRubric } from '@/lib/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { Progress } from "@/components/ui/progress"
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type EvaluationFormValues = {
  [key: string]: {
    criteria: { [key: string]: "yes" | "no" },
    observations: string
  }
}

const createValidationSchema = (rubrics: SupervisionRubric[]) => {
  const schemaObject = rubrics.reduce((acc, rubric) => {
    const criteriaSchema = rubric.criteria.reduce((critAcc, crit) => {
      critAcc[`criterion_${crit.id}`] = z.enum(["yes", "no"], { required_error: "Debe seleccionar una opción." });
      return critAcc;
    }, {} as Record<string, z.ZodType<any, any>>);

    acc[`rubric_${rubric.id}`] = z.object({
      criteria: z.object(criteriaSchema),
      observations: z.string().optional(),
    });

    return acc;
  }, {} as Record<string, z.ZodType<any, any>>);
  return z.object(schemaObject);
};


export default function EvaluateSupervisionPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const supervisionId = Number(params.supervisionId)
    
    const supervision = useMemo(() => {
        return supervisions.find(s => s.id === supervisionId)
    }, [supervisionId])

    const validationSchema = useMemo(() => createValidationSchema(supervisionRubrics), []);

    const [currentStep, setCurrentStep] = useState(0)
    const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: supervisionRubrics.reduce((acc, rubric) => {
            acc[`rubric_${rubric.id}`] = {
                criteria: rubric.criteria.reduce((critAcc, crit) => {
                    critAcc[`criterion_${crit.id}`] = undefined;
                    return critAcc;
                }, {} as any),
                observations: ''
            };
            return acc;
        }, {} as any),
    });
    
    const { control, handleSubmit, trigger, formState: { errors } } = form;

    if (!supervision) {
        return <div>Supervisión no encontrada.</div>
    }

    const totalSteps = supervisionRubrics.length
    const progress = ((currentStep + 1) / totalSteps) * 100
    const currentRubric = supervisionRubrics[currentStep];

    const handleNext = async () => {
        const rubricKey = `rubric_${currentRubric.id}`;
        const isValid = await trigger(rubricKey as any);
        if (isValid && currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const onSubmit = (data: EvaluationFormValues) => {
        const contableRubrics = supervisionRubrics.filter(r => r.type === 'Contable');
        let totalCriteria = 0;
        let metCriteria = 0;

        contableRubrics.forEach(rubric => {
            const rubricData = data[`rubric_${rubric.id}`];
            if (rubricData) {
                const criteriaKeys = Object.keys(rubricData.criteria);
                totalCriteria += criteriaKeys.filter(key => rubricData.criteria[key] !== 'n/a').length;
                metCriteria += criteriaKeys.filter(key => rubricData.criteria[key] === 'yes').length;
            }
        });

        const score = totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
        
        // Update supervision in mock data
        const supervisionIndex = supervisions.findIndex(s => s.id === supervisionId);
        if(supervisionIndex !== -1) {
            supervisions[supervisionIndex].status = 'Completada';
            supervisions[supervisionIndex].score = score;
        }

        console.log("Evaluación completada. Datos:", data, "Calificación:", score);
        
        toast({
            title: "Supervisión Completada",
            description: `La evaluación para ${supervision.teacher} ha sido guardada con una calificación de ${score}%.`,
        });

        router.push('/supervisions-management');
    }

    const rubricErrors = errors[`rubric_${currentRubric.id}`] as any;
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <Card className="rounded-xl">
                 <CardHeader>
                    <div className='mb-4'>
                        <Progress value={progress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            Paso {currentStep + 1} de {totalSteps}
                        </p>
                    </div>
                    <CardTitle>Evaluación de Supervisión</CardTitle>
                    <CardDescription>
                        Docente: <span className='text-primary'>{supervision.teacher}</span> | Materia: <span className='text-primary'>{supervision.subject}</span>
                    </CardDescription>
                </CardHeader>
                <form>
                    <CardContent className="space-y-8">
                         <div>
                            <h3 className="text-xl font-headline font-semibold text-white mb-2">{currentRubric.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6">{currentRubric.type}</p>
                            
                            <div className="space-y-6">
                                {currentRubric.criteria.map((criterion, index) => {
                                    const criterionKey = `rubric_${currentRubric.id}.criteria.criterion_${criterion.id}`;
                                    const criterionError = rubricErrors?.criteria?.[`criterion_${criterion.id}`];

                                    return (
                                        <div key={criterion.id}>
                                            <Separator className="mb-6" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                                <Label className="md:col-span-2 pt-1 font-normal text-base">{index + 1}. {criterion.text}</Label>
                                                <Controller
                                                    name={criterionKey as any}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className="flex gap-4 items-center"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="yes" id={`${criterionKey}-yes`} />
                                                                <Label htmlFor={`${criterionKey}-yes`}>Cumple</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="no" id={`${criterionKey}-no`} />
                                                                <Label htmlFor={`${criterionKey}-no`}>No Cumple</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    )}
                                                />
                                            </div>
                                            {criterionError && <p className="text-sm font-medium text-destructive mt-2">{criterionError.message}</p>}
                                        </div>
                                    )
                                })}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2">
                                <Label htmlFor={`observations-${currentRubric.id}`} className="text-base font-semibold">Observaciones sobre "{currentRubric.title}"</Label>
                                 <Controller
                                    name={`rubric_${currentRubric.id}.observations` as any}
                                    control={control}
                                    render={({ field }) => (
                                         <Textarea
                                            id={`observations-${currentRubric.id}`}
                                            placeholder="Añade comentarios, fortalezas u oportunidades de mejora..."
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                                Anterior
                            </Button>
                            
                            {currentStep < totalSteps - 1 ? (
                                <Button type="button" onClick={handleNext}>
                                    Siguiente
                                </Button>
                            ) : (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button">Finalizar Supervisión</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>¿Confirmar finalización?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Una vez guardada, la calificación se calculará y el estado de la supervisión cambiará a "Completada". ¿Deseas continuar?
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSubmit(onSubmit)}>Confirmar y Guardar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
