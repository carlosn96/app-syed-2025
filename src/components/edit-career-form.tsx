
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
import { updateCareer } from "@/services/api"
import { useState, useRef } from "react"
import { CareerSummary } from "@/lib/modelos"

const editCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
});

type EditCareerFormValues = z.infer<typeof editCareerSchema>;

interface EditCareerFormProps {
  career: CareerSummary;
  onSuccess?: () => void;
}

export function EditCareerForm({ career, onSuccess }: EditCareerFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditCareerFormValues>({
    resolver: zodResolver(editCareerSchema),
    defaultValues: {
      name: career.name,
    },
  });

  const onSubmit = async (data: EditCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await updateCareer(career.id, { carrera: data.name });
      toast.current?.show({
        severity: "success",
        summary: "Carrera Actualizada",
        detail: `La carrera ${data.name} ha sido actualizada con éxito.`,
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Carrera</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Ingeniería en Software" {...field} />
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

    