
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
import { updateSubject } from "@/services/api"
import { useState } from "react"
import { Subject } from "@/lib/modelos"

const editSubjectSchema = z.object({
  nombre: z.string().min(1, "El nombre de la materia es requerido."),
});

type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;

interface EditSubjectFormProps {
  subject: Subject;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function EditSubjectForm({ subject, onSuccess }: EditSubjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditSubjectFormValues>({
    resolver: zodResolver(editSubjectSchema),
    defaultValues: {
      nombre: subject.name,
    },
  });

  const onSubmit = async (data: EditSubjectFormValues) => {
    setIsSubmitting(true);
    try {
      await updateSubject(subject.id, { nombre: data.nombre });
      onSuccess?.({
        summary: "Materia Actualizada",
        detail: `La materia ha sido actualizada a ${data.nombre}.`,
      });
    } catch (error) {
        console.error("Error updating subject", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Materia</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Cálculo Diferencial" {...field} />
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
