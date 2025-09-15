
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
import type { RubricType } from "@/app/(app)/supervision-rubrics/page"

// Mock API call
const addCriterion = (data: any, rubricId: number, rubricType: RubricType) => new Promise((res) => setTimeout(() => res({ ...data, rubricId, rubricType }), 500));

const createCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type CreateCriterionFormValues = z.infer<typeof createCriterionSchema>;

export function CreateCriterionForm({ rubricId, rubricType, onSuccess }: { rubricId: number | null, rubricType: RubricType, onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateCriterionFormValues>({
    resolver: zodResolver(createCriterionSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: CreateCriterionFormValues) => {
    if (rubricId === null) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se ha seleccionado una rúbrica.",
        });
        return;
    }
    try {
      await addCriterion(data, rubricId, rubricType);
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
