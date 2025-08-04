
"use client"

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { teachers, evaluations } from '@/lib/data';

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
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { FloatingBackButton } from '@/components/ui/floating-back-button';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

const evaluationSchema = z.object({
  clarity: z.array(z.number()).default([5]),
  engagement: z.array(z.number()).default([5]),
  punctuality: z.array(z.number()).default([5]),
  knowledge: z.array(z.number()).default([5]),
  feedback: z.string().min(10, { message: 'Por favor, proporciona retroalimentación de al menos 10 caracteres.' }),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function StudentEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = Number(params.teacherId);

  const teacher = useMemo(() => teachers.find(t => t.id === teacherId), [teacherId]);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
  });
  
  const { control, handleSubmit, watch } = form;
  const watchedValues = watch();

  const onSubmit = (data: EvaluationFormValues) => {
    if (!user || !teacher) return;
    
    const newEvaluation = {
        id: Math.max(...evaluations.map(e => e.id), 0) + 1,
        student: `${user.nombre} ${user.apellido_paterno}`,
        teacherName: teacher.name,
        feedback: data.feedback,
        date: new Date().toISOString(),
        overallRating: Math.round((data.clarity[0] + data.engagement[0] + data.punctuality[0] + data.knowledge[0]) / 4),
        ratings: {
            clarity: data.clarity[0],
            engagement: data.engagement[0],
            punctuality: data.punctuality[0],
            knowledge: data.knowledge[0],
            feedback: 0
        }
    };

    evaluations.push(newEvaluation);
    console.log("Nueva evaluación guardada:", newEvaluation);
    
    toast({
        title: "Evaluación Enviada",
        description: `Gracias por evaluar a ${teacher.name}.`,
    });
    
    router.push('/evaluations');
  };

  if (!teacher) {
    return <div>Docente no encontrado</div>;
  }

  const ratingCategories = [
    { name: 'clarity', label: 'Claridad en la Explicación' },
    { name: 'engagement', label: 'Compromiso y Motivación' },
    { name: 'punctuality', label: 'Puntualidad y Organización' },
    { name: 'knowledge', label: 'Dominio del Tema' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <FloatingBackButton />
      <Card className="rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Evaluación para {teacher.name}</CardTitle>
            <CardDescription>
              Tus respuestas son anónimas. Califica de 1 a 10.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {ratingCategories.map(category => (
                <div key={category.name}>
                    <Controller
                        name={category.name as keyof EvaluationFormValues}
                        control={control}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center mb-2">
                                    <Label htmlFor={category.name}>{category.label}</Label>
                                    <span className="font-bold text-lg text-primary w-12 text-center">
                                      {field.value?.[0] || 5}
                                    </span>
                                </div>
                                <FormControl>
                                    <Slider
                                        id={category.name}
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            ))}
             <div>
                <Controller
                    name="feedback"
                    control={control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                             <Label htmlFor="feedback">Comentarios Adicionales</Label>
                             <FormControl>
                                <Textarea
                                    id="feedback"
                                    placeholder="Escribe tus comentarios aquí..."
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
