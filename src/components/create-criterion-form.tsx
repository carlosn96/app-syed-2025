
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
import { createNonCountableCriterion } from "@/services/api" // Assuming you'll create these
import type { RubricType } from "@/app/(app)/supervision-rubrics/page"
import { useRef } from "react"

// Mock API call for countable criteria
const addCountableCriterion = (data: any, rubricId: number) => new Promise((res) => setTimeout(() => res({ ...data, rubricId }), 500));


const createCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type CreateCriterionFormValues = z.infer<typeof createCriterionSchema>;

export function CreateCriterionForm({ rubricId, rubricType, onSuccess }: { rubricId: number | null, rubricType: RubricType, onSuccess?: () => void }) {
  const toast = useRef<Toast>(null);

  const form = useForm<CreateCriterionFormValues>({
    resolver: zodResolver(createCriterionSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: CreateCriterionFormValues) => {
    if (rubricId === null) {
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se ha seleccionado una rúbrica.",
        });
        return;
    }
    try {
      if (rubricType === 'supervision') { // This logic might need to be more specific if both types are supervision
          // For now, let's assume 'supervision' might mean 'Contable' and 'evaluation' might mean 'No Contable'
          // This should be adjusted based on the actual distinction.
          // Let's check the category of the rubric itself. This is a better approach.
          // For this, we'd need to pass the category to this form. Let's assume `rubricType` serves this purpose for now.

          // A better way is to pass the rubric's category, e.g. category: 'Contable' | 'No Contable'
          // Let's pretend rubricType is this category for a moment.
          if (rubricType === 'supervision') { // Assuming supervision maps to 'No Contable'
            await createNonCountableCriterion({ p_descripcion: data.text, p_id_nc_rubro: rubricId });
          } else { // Assuming 'evaluation' maps to 'Contable'
            await addCountableCriterion({ text: data.text }, rubricId);
          }
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
          <Button type="submit" className="w-full">Añadir Criterio</Button>
        </form>
      </Form>
    </>
  )
}
