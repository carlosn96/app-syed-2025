
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type EvaluationFormValues = {
  [key: string]: {
    criteria?: { [key: string]: "yes" | "no" },
    checkboxes?: { [key: string]: boolean },
    other?: string,
    observations?: string,
  }
}

const createValidationSchema = (rubrics: SupervisionRubric[]) => {
  const schemaObject = rubrics.reduce((acc, rubric) => {
    let rubricSchema: any = {};

    if (rubric.type === 'radio') {
      const criteriaSchema = rubric.criteria.reduce((critAcc, crit) => {
        critAcc[crit.id] = z.enum(["yes", "no"]).optional();
        return critAcc;
      }, {} as Record<string, z.ZodType<any, any>>);
      rubricSchema.criteria = z.object(criteriaSchema);
    }

    if (rubric.type === 'checkbox') {
        const checkboxSchema = rubric.criteria.reduce((critAcc, crit) => {
            critAcc[crit.id] = z.boolean().optional();
            return critAcc;
        }, {} as Record<string, z.ZodType<any, any>>);
        rubricSchema.checkboxes = z.object(checkboxSchema);
        
        if (rubric.criteria.some(c => c.id.endsWith('_other'))) {
            rubricSchema.other = z.string().optional();
        }
    }
    
    if (rubric.type === 'summary') {
      rubricSchema.observations = z.string().optional();
    }

    acc[`rubric_${rubric.id}`] = z.object(rubricSchema);
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
            const defaultRubric: any = {};
            if (rubric.type === 'radio') {
                defaultRubric.criteria = rubric.criteria.reduce((cAcc, c) => ({ ...cAcc, [c.id]: undefined }), {});
            }
            if (rubric.type === 'checkbox') {
                defaultRubric.checkboxes = rubric.criteria.reduce((cAcc, c) => ({ ...cAcc, [c.id]: false }), {});
                if (rubric.criteria.some(c => c.id.endsWith('_other'))) {
                  defaultRubric.other = '';
                }
            }
            if (rubric.type === 'summary') {
                defaultRubric.observations = '';
            }
            acc[`rubric_${rubric.id}`] = defaultRubric;
            return acc;
        }, {} as any),
    });
    
    const { control, handleSubmit, watch, formState: { errors } } = form;

    if (!supervision) {
        return <div>Supervisión no encontrada.</div>
    }

    const totalSteps = supervisionRubrics.length
    const progress = ((currentStep + 1) / totalSteps) * 100
    const currentRubric = supervisionRubrics[currentStep];

    const isOtherChecked = watch(`rubric_${currentRubric.id}.checkboxes.${currentRubric.id}_other` as any);

    const handleNext = async () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const onSubmit = (data: EvaluationFormValues) => {
        let totalCriteria = 0;
        let metCriteria = 0;

        supervisionRubrics.forEach(rubric => {
            if (rubric.type === 'radio') {
                const rubricData = data[`rubric_${rubric.id}`];
                if (rubricData && rubricData.criteria) {
                    const criteriaKeys = Object.keys(rubricData.criteria);
                    totalCriteria += criteriaKeys.filter(key => rubricData.criteria![key] !== undefined).length;
                    metCriteria += criteriaKeys.filter(key => rubricData.criteria![key] === 'yes').length;
                }
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

    const renderRubricContent = () => {
        const rubricKey = `rubric_${currentRubric.id}`;

        switch (currentRubric.type) {
            case 'radio':
                return (
                    <div className="space-y-6">
                        {currentRubric.criteria.map((criterion, index) => {
                            const criterionKey = `${rubricKey}.criteria.${criterion.id}`;
                            return (
                                <div key={criterion.id}>
                                    <Separator className="mb-6" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <Label className="md:col-span-2 pt-1 font-normal text-base">{index + 1}. {criterion.text}</Label>
                                        <Controller
                                            name={criterionKey as any}
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 items-center">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${criterionKey}-yes`} /><Label htmlFor={`${criterionKey}-yes`}>Cumple</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${criterionKey}-no`} /><Label htmlFor={`${criterionKey}-no`}>No Cumple</Label></div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-4">
                        {currentRubric.criteria.map((criterion, index) => {
                           const isOtherField = criterion.id.endsWith('_other');
                           const checkboxKey = `${rubricKey}.checkboxes.${criterion.id}`;
                           const otherInputKey = `${rubricKey}.other`;

                           if (isOtherField) {
                                return (
                                    <div key={criterion.id} className="space-y-4">
                                         <div className="flex items-center space-x-2">
                                            <Controller
                                                name={checkboxKey as any}
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id={checkboxKey}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor={checkboxKey} className="font-normal">{criterion.text}</Label>
                                        </div>
                                        {isOtherChecked && (
                                            <Controller
                                                name={otherInputKey as any}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Por favor, especifique..." className="ml-6" />
                                                )}
                                            />
                                        )}
                                    </div>
                                )
                           }
                           
                           return (
                                <div key={criterion.id} className="flex items-center space-x-2">
                                    <Controller
                                        name={checkboxKey as any}
                                        control={control}
                                        render={({ field }) => (
                                             <Checkbox
                                                id={checkboxKey}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <Label htmlFor={checkboxKey} className="font-normal">{criterion.text}</Label>
                                </div>
                           )
                        })}
                    </div>
                );
            case 'summary':
                const summaryKey = `${rubricKey}.observations`;
                 return (
                    <div className="space-y-2">
                        <Label htmlFor={summaryKey} className="text-base font-semibold">{currentRubric.criteria[0].text}</Label>
                         <Controller
                            name={summaryKey as any}
                            control={control}
                            render={({ field }) => (
                                 <Textarea
                                    id={summaryKey}
                                    placeholder="Añade tus conclusiones y comentarios finales aquí..."
                                    rows={8}
                                    {...field}
                                />
                            )}
                        />
                    </div>
                 )
            default:
                return null;
        }
    }
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <Card className="rounded-xl">
                 <CardHeader>
                    <div className='mb-4'>
                        <Progress value={progress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            Paso {currentStep + 1} de {totalSteps}: {currentRubric.title}
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
                            {renderRubricContent()}
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
