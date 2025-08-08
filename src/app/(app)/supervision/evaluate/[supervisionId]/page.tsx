
"use client"

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { MessageSquarePlus, MessageSquareX } from 'lucide-react'
import { ProgressRing } from '@/components/ui/progress-ring'
import { usePageNavigation } from '@/context/page-navigation-context'

type EvaluationFormValues = {
  [key: string]: {
    criteria?: { [key: string]: { checked: boolean; comment?: string } },
    checkboxes?: { [key: string]: boolean },
    other?: string,
  },
  classTopic?: string;
  finalComments?: string;
}

const createValidationSchema = (rubrics: SupervisionRubric[]) => {
  const schemaObject: Record<string, z.ZodType<any, any>> = rubrics.reduce((acc, rubric) => {
    let rubricSchema: any = {};

    if (rubric.type === 'checkbox') {
        if (rubric.category === 'Contable') {
            const criteriaSchema = rubric.criteria.reduce((critAcc, crit) => {
                critAcc[crit.id] = z.object({
                    checked: z.boolean().optional(),
                    comment: z.string().optional(),
                });
                return critAcc;
            }, {} as Record<string, z.ZodType<any, any>>);
            rubricSchema.criteria = z.object(criteriaSchema);
        } else { // No Contable
            const checkboxesSchema = rubric.criteria.reduce((critAcc, crit) => {
                critAcc[crit.id] = z.boolean().optional();
                return critAcc;
            }, {} as Record<string, z.ZodType<any, any>>);

            rubricSchema.checkboxes = z.object(checkboxesSchema);
            if (rubric.criteria.some(c => c.id.endsWith('_other'))) {
                rubricSchema.other = z.string().optional();
            }
        }
    }

    acc[`rubric_${rubric.id}`] = z.object(rubricSchema);
    return acc;
  }, {} as Record<string, z.ZodType<any, any>>);
  
  schemaObject.classTopic = z.string().optional();
  schemaObject.finalComments = z.string().optional();

  return z.object(schemaObject);
};


export default function EvaluateSupervisionPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const supervisionId = Number(params.supervisionId)
    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

    const { setPageNav } = usePageNavigation();

    const toggleComment = (key: string) => {
        setOpenComments(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const supervision = useMemo(() => {
        return supervisions.find(s => s.id === supervisionId)
    }, [supervisionId])

    const validationSchema = useMemo(() => createValidationSchema(supervisionRubrics), []);
    
    const [evaluationType, setEvaluationType] = useState<'Contable' | 'No Contable' | 'Estadistica'>('Contable');
    
    const rubricsByType = useMemo(() => ({
        'Contable': supervisionRubrics.filter(r => r.category === 'Contable'),
        'No Contable': supervisionRubrics.filter(r => r.category === 'No Contable')
    }), []);

    const allTabs = useMemo(() => [
        ...rubricsByType['Contable'].map(r => ({ id: `rubric_${r.id}`, label: r.title, group: 'Contable' })),
        ...rubricsByType['No Contable'].map(r => ({ id: `rubric_${r.id}`, label: r.title, group: 'No Contable' })),
        { id: 'Estadistica', label: 'Estadística General', group: 'Estadistica' }
    ], [rubricsByType]);
    
    const [activeTabs, setActiveTabs] = useState<Record<string, string>>(() => {
        const initialTabs: Record<string, string> = {};
        if (rubricsByType['Contable'].length > 0) initialTabs['Contable'] = `rubric_${rubricsByType['Contable'][0].id}`;
        if (rubricsByType['No Contable'].length > 0) initialTabs['No Contable'] = `rubric_${rubricsByType['No Contable'][0].id}`;
        return initialTabs;
    });

    const handleEvaluationTypeChange = (type: 'Contable' | 'No Contable' | 'Estadistica') => {
        setEvaluationType(type);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('tab', type);
        router.replace(newUrl.toString(), { scroll: false });
    };

    const handleSubTabChange = (category: 'Contable' | 'No Contable', value: string) => {
        setActiveTabs(prev => ({ ...prev, [category]: value }));
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('subtab', value);
        router.replace(newUrl.toString(), { scroll: false });
    }

    useEffect(() => {
        const tab = searchParams.get('tab') as any;
        if (tab && ['Contable', 'No Contable', 'Estadistica'].includes(tab)) {
            setEvaluationType(tab);
        }
        const subtab = searchParams.get('subtab');
        if (subtab) {
             const category = allTabs.find(t => t.id === subtab)?.group as 'Contable' | 'No Contable';
             if (category) {
                setActiveTabs(prev => ({...prev, [category]: subtab}));
             }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        const pageNavItems = [
            { id: 'Contable', label: 'Contables', onSelect: () => handleEvaluationTypeChange('Contable'), isActive: evaluationType === 'Contable' },
            { id: 'No Contable', label: 'No Contables', onSelect: () => handleEvaluationTypeChange('No Contable'), isActive: evaluationType === 'No Contable' },
            { id: 'Estadistica', label: 'Estadística General', onSelect: () => handleEvaluationTypeChange('Estadistica'), isActive: evaluationType === 'Estadistica' },
        ];
        setPageNav(pageNavItems);
        return () => setPageNav([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evaluationType, setPageNav]);


    const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            ...supervisionRubrics.reduce((acc, rubric) => {
                const defaultRubric: any = {};
                if (rubric.category === 'Contable') {
                    defaultRubric.criteria = rubric.criteria.reduce((cAcc, c) => ({ ...cAcc, [c.id]: { checked: false, comment: '' } }), {});
                } else if (rubric.type === 'checkbox') {
                    defaultRubric.checkboxes = rubric.criteria.reduce((cAcc, c) => ({ ...cAcc, [c.id]: false }), {});
                    if (rubric.criteria.some(c => c.id.endsWith('_other'))) {
                      defaultRubric.other = '';
                    }
                }
                acc[`rubric_${rubric.id}`] = defaultRubric;
                return acc;
            }, {} as any),
            classTopic: '',
            finalComments: ''
        }
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
                metCriteria = Object.values(rubricData.criteria).filter(val => val.checked === true).length;
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
            case 'checkbox':
                 if (rubric.category === 'Contable') {
                    return (
                        <div className="space-y-6">
                            {rubric.criteria.map((criterion, index) => {
                                const criterionCheckedKey = `${rubricKey}.criteria.${criterion.id}.checked`;
                                const criterionCommentKey = `${rubricKey}.criteria.${criterion.id}.comment`;
                                const commentKey = `${rubricKey}_${criterion.id}`;
                                const isCommentOpen = !!openComments[commentKey];

                                return (
                                    <div key={criterion.id}>
                                        {index > 0 && <Separator className="mb-6" />}
                                        <div className="flex items-start space-x-4">
                                            <Controller
                                                name={criterionCheckedKey as any}
                                                control={control}
                                                render={({ field }) => (
                                                     <Checkbox
                                                        id={criterionCheckedKey}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="mt-1"
                                                    />
                                                )}
                                            />
                                            <div className="flex-grow space-y-2">
                                                <div className='flex items-center justify-between'>
                                                  <Label htmlFor={criterionCheckedKey} className="font-normal text-base leading-snug">{index + 1}. {criterion.text}</Label>
                                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => toggleComment(commentKey)}>
                                                      {isCommentOpen ? <MessageSquareX size={16} /> : <MessageSquarePlus size={16}/>}
                                                      <span className='sr-only'>{isCommentOpen ? "Cerrar comentario" : "Añadir comentario"}</span>
                                                  </Button>
                                                </div>
                                                 {isCommentOpen && (
                                                    <Controller
                                                        name={criterionCommentKey as any}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="Añadir comentario opcional..."
                                                                className="h-8 text-sm"
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    );
                 } else { // Non-countable checkboxes
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
                 }
            default:
                return null;
        }
    }

    const renderRubricCategory = (rubrics: SupervisionRubric[], category: 'Contable' | 'No Contable') => {
      if (rubrics.length === 0) return null;
      
      const currentTab = activeTabs[category] || `rubric_${rubrics[0].id}`;

      return (
          <Tabs 
            value={currentTab} 
            onValueChange={(value) => handleSubTabChange(category, value)}
            className="w-full flex flex-col items-center"
          >
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
                            Docente: <span className='text-primary'>{supervision.teacher}</span> | Carrera: <span className='text-primary'>{supervision.career}</span>
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-0">
                        <Tabs value={evaluationType} onValueChange={(val) => handleEvaluationTypeChange(val as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                                <TabsTrigger value="Contable">Contables</TabsTrigger>
                                <TabsTrigger value="No Contable">No Contables</TabsTrigger>
                                <TabsTrigger value="Estadistica">Estadistica General</TabsTrigger>
                            </TabsList>

                            <TabsContent value="Contable" className="mt-8">
                                {renderRubricCategory(rubricsByType['Contable'], 'Contable')}
                            </TabsContent>
                            <TabsContent value="No Contable" className="mt-8">
                                {renderRubricCategory(rubricsByType['No Contable'], 'No Contable')}
                            </TabsContent>
                            <TabsContent value="Estadistica" className="mt-8">
                                <Card>
                                    <CardContent className="space-y-8 pt-6">
                                        <div className="p-6 bg-black/20 rounded-lg">
                                            <div className='flex flex-col items-center justify-center'>
                                                <h3 className="text-xl font-headline font-semibold text-white mb-4 text-center">Calificación Final Promedio</h3>
                                                <ProgressRing value={calculatedScores.final} />
                                            </div>
                                            <Separator className="my-6"/>
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
                                            </div>
                                        </div>
                                        <div className="p-6 bg-black/20 rounded-lg space-y-2">
                                            <Label htmlFor="classTopic" className="text-base font-semibold">Tema de la Clase Evaluada</Label>
                                            <Controller
                                                name="classTopic"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        id="classTopic"
                                                        placeholder="Ej. Introducción a la Programación Orientada a Objetos"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="p-6 bg-black/20 rounded-lg space-y-2">
                                            <Label htmlFor="finalComments" className="text-base font-semibold">Conclusiones y comentarios sobre la clase</Label>
                                            <Controller
                                                name="finalComments"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        id="finalComments"
                                                        placeholder="Añade tus conclusiones y comentarios finales aquí..."
                                                        rows={8}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </div>
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
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
