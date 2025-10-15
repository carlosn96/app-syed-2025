
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
import { updateCriterion } from "@/services/api"
import { SupervisionCriterion } from "@/lib/modelos"
import { useRef, useState } from "react"

const editCriterionSchema = z.object({
  text: z.string().min(1, "El texto del criterio es requerido."),
});

type EditCriterionFormValues = z.infer<typeof editCriterionSchema>;

interface EditCriterionFormProps {
    criterion: SupervisionCriterion;
    onSuccess?: () => void;
}

export function EditCriterionForm({ criterion, onSuccess }: EditCriterionFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditCriterionFormValues>({
    resolver: zodResolver(editCriterionSchema),
    defaultValues: {
      text: criterion.text,
    },
  });

  const onSubmit = async (data: EditCriterionFormValues) => {
    if (!criterion || !criterion.rubricCategory) {
        toast.current?.show({ severity: "error", summary: "Error", detail: "Datos del criterio incompletos." });
        return;
    }
    setIsSubmitting(true);
    
    try {
      await updateCriterion(criterion.id as number, criterion.rubricCategory, data.text);
      toast.current?.show({
        severity: "success",
        summary: "Criterio Actualizado",
        detail: `El criterio ha sido actualizado correctamente.`,
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al actualizar",
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
    </>
  )
}
