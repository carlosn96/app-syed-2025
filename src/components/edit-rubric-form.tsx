
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
import { Toast } from 'primereact/toast';
import { useRef, useState } from "react"
import { SupervisionRubric } from "@/lib/modelos"
import { updateRubric } from "@/services/api"

const editRubricSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
});

type EditRubricFormValues = z.infer<typeof editRubricSchema>;

interface EditRubricFormProps {
  rubric: SupervisionRubric;
  onSuccess?: () => void;
}

export function EditRubricForm({ rubric, onSuccess }: EditRubricFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditRubricFormValues>({
    resolver: zodResolver(editRubricSchema),
    defaultValues: {
      title: rubric.title,
    },
  });

  const onSubmit = async (data: EditRubricFormValues) => {
    setIsSubmitting(true);
    try {
      await updateRubric(rubric.id as number, rubric.category, { p_nombre: data.title });
      toast.current?.show({
        severity: "success",
        summary: "Rúbrica Actualizada",
        detail: `La rúbrica ha sido actualizada a "${data.title}".`,
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

    