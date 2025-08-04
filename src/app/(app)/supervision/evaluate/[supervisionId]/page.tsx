

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
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

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

    const [evaluationType, setEvaluationType] = useState<'Contable' | 'No Contable' | 'Avance'>('Contable');
    
    const rubricsByType = useMemo(() => ({
        'Contable': supervisionRubrics.filter(r => r.category === 'Contable'),
        'No Contable': supervisionRubrics.filter(r => r.category === 'No Contable')
    }), []);

    const handleEvaluationTypeChange = (type: 'Contable' | 'No Contable' | 'Avance') => {
        setEvaluationType(type);
    };

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
    
    const { control, handleSubmit, watch } = form;
    const watchedForm = watch();

    const calculatedScores = useMemo(() => {
        const scores: { [key: string]: { score: number, title: string } } = {};
        let totalAverage = 0;
        let countableRubricsCount = 0;

        rubricsByType['Contable'].forEach(rubric => {
            const rubricKey = `rubric_${rubric.id}`;
            const rubricData = watchedForm[rubricKey];
            let totalCriteria = 0;
            let metCriteria = 0;

            if (rubricData?.criteria) {
                totalCriteria = rubric.criteria.length;
                metCriteria = Object.values(rubricData.criteria).filter(val => val === 'yes').length;
            }
            
            const score = totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
            scores[rubricKey] = { score, title: rubric.title };
            totalAverage += score;
            countableRubricsCount++;
        });

        const finalScore = countableRubricsCount > 0 ? Math.round(totalAverage / countableRubricsCount) : 0;
        
        return { individual: scores, final: finalScore };
    }, [watchedForm, rubricsByType]);

    if (!supervision) {
        return <div>Supervisión no encontrada.</div>
    }

    const onSubmit = (data: EvaluationFormValues) => {
        // Update supervision in mock data
        const supervisionIndex = supervisions.findIndex(s => s.id === supervisionId);
        if(supervisionIndex !== -1) {
            supervisions[supervisionIndex].status = 'Completada';
            supervisions[supervisionIndex].score = calculatedScores.final;
        }

        console.log("Evaluación completada. Datos:", data, "Calificación:", calculatedScores.final);
        
        toast({
            title: "Supervisión Completada",
            description: `La evaluación para ${supervision.teacher} ha sido guardada con una calificación de ${calculatedScores.final}%.`,
        });

        router.push('/supervisions-management');
    }

    const renderRubricContent = (rubric: SupervisionRubric) => {
        const rubricKey = `rubric_${rubric.id}`;

        switch (rubric.type) {
            case 'radio':
                return (
                    <div className="space-y-6">
                        {rubric.criteria.map((criterion, index) => {
                            const criterionKey = `${rubricKey}.criteria.${criterion.id}`;
                            return (
                                <div key={criterion.id}>
                                    {index > 0 && <Separator className="mb-6" />}
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
                 const isOtherChecked = watch(`${rubricKey}.checkboxes.${rubric.id}_other` as any);
                return (
                    <div className="space-y-4 columns-1 md:columns-2 lg:columns-3">
                        {rubric.criteria.map((criterion) => {
                           const isOtherField = criterion.id.endsWith('_other');
                           const checkboxKey = `${rubricKey}.checkboxes.${criterion.id}`;
                           const otherInputKey = `${rubricKey}.other`;

                           if (isOtherField) {
                                return (
                                    <div key={criterion.id} className="space-y-4 mt-4 break-inside-avoid">
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
                                <div key={criterion.id} className="flex items-center space-x-2 break-inside-avoid">
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
                        <Label htmlFor={summaryKey} className="text-base font-semibold">{rubric.criteria[0].text}</Label>
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

    const renderRubricCategory = (rubrics: SupervisionRubric[]) => {
      if (rubrics.length === 0) return null;

      const defaultTab = `rubric_${rubrics[0].id}`;

      return (
          <Tabs defaultValue={defaultTab} className="w-full flex flex-col items-center">
              <TabsList className="grid w-full grid-flow-col auto-cols-fr mb-4 h-auto flex-wrap justify-center">
                  {rubrics.map(rubric => (
                      <TabsTrigger key={rubric.id} value={`rubric_${rubric.id}`} className="flex-grow whitespace-normal text-center h-full">
                          {rubric.title}
                      </TabsTrigger>
                  ))}
              </TabsList>
              {rubrics.map(rubric => (
                  <TabsContent key={rubric.id} value={`rubric_${rubric.id}`} className="w-full">
                      <Card>
                          <CardContent className="p-6">
                              {renderRubricContent(rubric)}
                          </CardContent>
                      </Card>
                  </TabsContent>
              ))}
          </Tabs>
      );
    }
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
             <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Evaluación de Supervisión</CardTitle>
                        <CardDescription>
                            Docente: <span className='text-primary'>{supervision.teacher}</span> | Materia: <span className='text-primary'>{supervision.subject}</span>
                        </CardDescription>
                    </CardHeader>
                    
                    <div className="px-6 pb-4">
                        <Tabs defaultValue={evaluationType} onValueChange={(val) => handleEvaluationTypeChange(val as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="Contable">Contables</TabsTrigger>
                                <TabsTrigger value="No Contable">No Contables</TabsTrigger>
                                <TabsTrigger value="Avance">Calificación y Avance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="Contable">
                                <div className="mt-8">
                                    {renderRubricCategory(rubricsByType['Contable'])}
                                </div>
                            </TabsContent>
                            <TabsContent value="No Contable">
                                 <div className="mt-8">
                                    {renderRubricCategory(rubricsByType['No Contable'])}
                                </div>
                            </TabsContent>
                            <TabsContent value="Avance">
                                <CardContent className="space-y-8 pt-8">
                                    <div className="p-6 bg-black/20 rounded-lg">
                                        <h3 className="text-xl font-headline font-semibold text-white mb-4">Resumen de Calificación</h3>
                                        <div className="space-y-4">
                                            {Object.entries(calculatedScores.individual).map(([key, value]) => (
                                                <div key={key}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium">{value.title}</span>
                                                        <span className="text-sm font-semibold">{value.score}%</span>
                                                    </div>
                                                    <Progress value={value.score} />
                                                </div>
                                            ))}
                                            <Separator className="my-4"/>
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Calificación Final Promedio</span>
                                                <span>{calculatedScores.final}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                    </div>
                    
                    <CardContent>
                        <Separator className='my-6' />
                        <div className="flex justify-end items-center">
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
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

    

    
