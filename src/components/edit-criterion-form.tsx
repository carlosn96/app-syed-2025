
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
import { updateCriterion, updateEvaluationCriterion } from "@/services/api"
import { SupervisionCriterion, EvaluationCriterion } from "@/lib/modelos"
import { useState } from "react"

const editCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type EditCriterionFormValues = z.infer<typeof editCriterionSchema>;

interface EditCriterionFormProps {
    criterion: SupervisionCriterion | EvaluationCriterion;
    rubricType: 'supervision' | 'evaluation';
    onSuccess?: () => void;
}

export function EditCriterionForm({ criterion, rubricType, onSuccess }: EditCriterionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditCriterionFormValues>({
    resolver: zodResolver(editCriterionSchema),
    defaultValues: {
      text: ('text' in criterion ? criterion.text : criterion.description) || '',
    },
  });

  const onSubmit = async (data: EditCriterionFormValues) => {
    if (!criterion) {
        toast.error("Datos del criterio incompletos.");
        return;
    }
    setIsSubmitting(true);
    
    try {
        if (rubricType === 'supervision' && 'rubricCategory' in criterion && criterion.rubricCategory) {
             await updateCriterion(criterion.id as number, criterion.rubricCategory, data.text);
        } else {
            await updateEvaluationCriterion(criterion.id as number, { descripcion: data.text });
        }
      toast.success("El criterio ha sido actualizado correctamente.");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del Criterio</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej. El docente utiliza ejemplos relevantes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  )
}
