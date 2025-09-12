
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supervisionRubrics, evaluationRubrics } from "@/lib/data"
import { RubricType } from "@/app/(app)/supervision-rubrics/page"

const createCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type CreateCriterionFormValues = z.infer<typeof createCriterionSchema>;

const addCriterion = (data: CreateCriterionFormValues, rubricId: number, rubricType: RubricType) => {
    let rubric;
    if (rubricType === 'supervision') {
        rubric = supervisionRubrics.find(r => r.id === rubricId);
    } else {
        rubric = evaluationRubrics.find(r => r.id === rubricId);
    }
    
    if (!rubric) {
        throw new Error("No se encontró la rúbrica.");
    }
    
    const newId = `${rubricId}_${rubric.criteria.length + 1}`;
    const newCriterion = {
        id: newId,
        text: data.text,
    };
    rubric.criteria.push(newCriterion);
    console.log("Criterio añadido:", newCriterion, "a la rúbrica:", rubric.title || rubric.category);
};

export function CreateCriterionForm({ rubricId, rubricType, onSuccess }: { rubricId: number | null, rubricType: RubricType, onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateCriterionFormValues>({
    resolver: zodResolver(createCriterionSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = (data: CreateCriterionFormValues) => {
    if (rubricId === null) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se ha seleccionado una rúbrica.",
        });
        return;
    }
    try {
      addCriterion(data, rubricId, rubricType);
      toast({
        title: "Criterio Añadido",
        description: `El criterio ha sido añadido a la rúbrica con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al añadir criterio",
            description: error.message,
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del Criterio</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej. El docente utiliza ejemplos relevantes para la vida cotidiana de los alumnos." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Añadir Criterio</Button>
      </form>
    </Form>
  )
}
