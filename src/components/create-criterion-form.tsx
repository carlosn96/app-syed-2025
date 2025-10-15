
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
import { Toast } from 'primereact/toast';
import { createNonCountableCriterion, createCountableCriterion } from "@/services/api"
import { SupervisionRubric } from "@/lib/modelos"
import { useRef, useState } from "react"

const createCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type CreateCriterionFormValues = z.infer<typeof createCriterionSchema>;

export function CreateCriterionForm({ rubric, onSuccess }: { rubric: SupervisionRubric | null, onSuccess?: () => void }) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCriterionFormValues>({
    resolver: zodResolver(createCriterionSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: CreateCriterionFormValues) => {
    if (!rubric) {
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se ha seleccionado una rúbrica.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
      if (rubric.category === 'No Contable') {
        await createNonCountableCriterion({ p_descripcion: data.text, p_id_rubro: rubric.id as number });
      } else {
        await createCountableCriterion({ p_criterio: data.text, p_id_rubro: rubric.id as number });
      }

      toast.current?.show({
        severity: "success",
        summary: "Criterio Añadido",
        detail: `El criterio ha sido añadido a la rúbrica con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al añadir criterio",
            detail: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
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
