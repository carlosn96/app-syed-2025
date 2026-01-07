
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { useState } from "react"
import { SupervisionRubric, EvaluationRubric } from "@/lib/modelos"
import { updateRubric, updateEvaluationRubric } from "@/services/api"

const editRubricSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
});

type EditRubricFormValues = z.infer<typeof editRubricSchema>;

interface EditRubricFormProps {
  rubric: SupervisionRubric | EvaluationRubric;
  rubricType: 'supervision' | 'evaluation';
  onSuccess?: () => void;
}

export function EditRubricForm({ rubric, rubricType, onSuccess }: EditRubricFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditRubricFormValues>({
    resolver: zodResolver(editRubricSchema),
    defaultValues: {
      title: rubric.title || rubric.name,
    },
  });

  const onSubmit = async (data: EditRubricFormValues) => {
    setIsSubmitting(true);
    try {
      if (rubricType === 'supervision' && 'category' in rubric) {
        await updateRubric(rubric.id, (rubric as SupervisionRubric).category, { p_nombre: data.title });
      } else {
        await updateEvaluationRubric(rubric.id, { nombre: data.title });
      }
      toast.success(`La rúbrica ha sido actualizada a "${data.title}".`);
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la Rúbrica</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Presentación Personal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </Form>
    </>
  )
}
