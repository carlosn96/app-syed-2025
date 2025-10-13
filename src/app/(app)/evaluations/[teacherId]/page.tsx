
"use client"

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Teacher } from '@/lib/modelos';
import { getTeachers, createEvaluation } from '@/services/api';
import { Toast } from 'primereact/toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';


const evaluationOptions = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
  { value: 'necesita_mejorar', label: 'Necesita Mejorar' },
  { value: 'deficiente', label: 'Deficiente' },
] as const;

type EvaluationOptionValue = typeof evaluationOptions[number]['value'];

const evaluationSchema = z.object({
  clarity: z.enum(['excelente', 'bueno', 'regular', 'necesita_mejorar', 'deficiente'], { required_error: 'Debes seleccionar una opción.' }),
  engagement: z.enum(['excelente', 'bueno', 'regular', 'necesita_mejorar', 'deficiente'], { required_error: 'Debes seleccionar una opción.' }),
  punctuality: z.enum(['excelente', 'bueno', 'regular', 'necesita_mejorar', 'deficiente'], { required_error: 'Debes seleccionar una opción.' }),
  knowledge: z.enum(['excelente', 'bueno', 'regular', 'necesita_mejorar', 'deficiente'], { required_error: 'Debes seleccionar una opción.' }),
  feedback: z.string().min(10, { message: 'Por favor, proporciona retroalimentación de al menos 10 caracteres.' }),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

const ratingMap: Record<EvaluationOptionValue, number> = {
  excelente: 100,
  bueno: 80,
  regular: 60,
  necesita_mejorar: 40,
  deficiente: 20,
};


export default function StudentEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useRef<Toast>(null);
  const teacherId = Number(params.teacherId);
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
        setIsLoading(true);
        try {
            const allTeachers = await getTeachers();
            const currentTeacher = allTeachers.find(t => t.id === teacherId) || null;
            setTeacher(currentTeacher);
        } catch (error) {
            console.error("Failed to fetch teacher", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchTeacher();
  }, [teacherId]);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
  });
  
  const { control, handleSubmit } = form;

  const onSubmit = async (data: EvaluationFormValues) => {
    if (!user || !teacher) return;
    
    const clarityScore = ratingMap[data.clarity];
    const engagementScore = ratingMap[data.engagement];
    const punctualityScore = ratingMap[data.punctuality];
    const knowledgeScore = ratingMap[data.knowledge];

    const newEvaluation = {
        student: "Alumno Anónimo", // In a real app, this would come from the user context
        teacherName: teacher.name,
        groupName: user.grupo || "Desconocido",
        feedback: data.feedback,
        overallRating: Math.round((clarityScore + engagementScore + punctualityScore + knowledgeScore) / 4),
        ratings: {
            clarity: data.clarity,
            engagement: data.engagement,
            punctuality: data.punctuality,
            knowledge: data.knowledge,
        }
    };

    try {
        await createEvaluation(newEvaluation);
        toast.current?.show({
            severity: "success",
            summary: "Evaluación Enviada",
            detail: `Gracias por evaluar a ${teacher.name}.`,
        });
        router.push('/evaluations');
    } catch (error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al enviar",
            detail: "No se pudo guardar la evaluación. Inténtalo de nuevo."
        })
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Card className="rounded-xl">
          <CardHeader>
            <Skeleton className="h-7 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-6 w-24" />)}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return <div>Docente no encontrado</div>;
  }

  const ratingCategories = [
    { name: 'clarity', label: 'Claridad en la Explicación' },
    { name: 'engagement', label: 'Compromiso y Motivación' },
    { name: 'punctuality', label: 'Puntualidad y Organización' },
    { name: 'knowledge', label: 'Dominio del Tema' },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <Card className="rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Evaluación para {teacher.name}</CardTitle>
            <CardDescription>
              Tus respuestas son anónimas. Selecciona la opción que mejor describa el desempeño del docente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {ratingCategories.map((category, index) => (
                <div key={category.name}>
                    <Controller
                        name={category.name}
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <Label className="text-base">{category.label}</Label>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2"
                                    >
                                        {evaluationOptions.map(option => (
                                            <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={option.value} id={`${category.name}-${option.value}`} />
                                                </FormControl>
                                                <Label htmlFor={`${category.name}-${option.value}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                 {fieldState.error && <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>}
                            </FormItem>
                        )}
                    />
                    {index < ratingCategories.length -1 && <Separator className="mt-8" />}
                </div>
            ))}
             <Separator className="mt-8"/>
             <div>
                <Controller
                    name="feedback"
                    control={control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                             <Label htmlFor="feedback" className="text-base">Comentarios Adicionales</Label>
                             <CardDescription>Proporciona retroalimentación constructiva sobre el desempeño del docente.</CardDescription>
                             <FormControl>
                                <Textarea
                                    id="feedback"
                                    placeholder="Escribe tus comentarios aquí..."
                                    className="mt-2"
                                    rows={5}
                                    {...field}
                                />
                             </FormControl>
                              {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Enviar Evaluación
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

type FormItemProps = {
    children: React.ReactNode
}
function FormItem({ children }: FormItemProps) {
    return <div className="space-y-2">{children}</div>
}

function FormControl({ children }: FormItemProps) {
    return <div>{children}</div>
}
