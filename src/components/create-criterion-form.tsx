
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
import toast from 'react-hot-toast';
import { createCriterion, createEvaluationCriterion } from "@/services/api"
import { SupervisionRubric, EvaluationRubric } from "@/lib/modelos"
import { useState } from "react"

const createCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type CreateCriterionFormValues = z.infer<typeof createCriterionSchema>;

interface CreateCriterionFormProps {
    rubric: SupervisionRubric | EvaluationRubric;
    rubricType: 'supervision' | 'evaluation';
    onSuccess?: () => void;
}

export function CreateCriterionForm({ rubric, rubricType, onSuccess }: CreateCriterionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCriterionFormValues>({
    resolver: zodResolver(createCriterionSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: CreateCriterionFormValues) => {
    if (!rubric) {
        toast.error("No se ha seleccionado una rúbrica.");
        return;
    }
    setIsSubmitting(true);
    try {
      if (rubricType === 'supervision') {
        const supervisionRubric = rubric as SupervisionRubric;
        await createCriterion(supervisionRubric.id, supervisionRubric.category, data.text);
      } else {
        await createEvaluationCriterion({ descripcion: data.text, id_rubro: rubric.id });
      }

      toast.success(`El criterio ha sido añadido a la rúbrica con éxito.`);
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Añadiendo..." : "Añadir Criterio"}
          </Button>
        </form>
      </Form>
    </>
  )
}
