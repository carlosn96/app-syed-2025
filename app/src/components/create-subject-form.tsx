
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
import { createSubject } from "@/services/api"
import { useState } from "react"

const createSubjectSchema = z.object({
  nombre: z.string().min(1, "El nombre de la materia es requerido."),
});

type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

interface CreateSubjectFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}


export function CreateSubjectForm({ onSuccess }: CreateSubjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const onSubmit = async (data: CreateSubjectFormValues) => {
    setIsSubmitting(true);
    try {
      await createSubject(data);
      onSuccess?.({
        summary: "Materia Creada",
        detail: `La materia ${data.nombre} ha sido creada con éxito.`,
      });
      form.reset();
    } catch (error) {
      // Parent component will show toast
      console.error("Error creating subject:", error);
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
              {isSubmitting ? 'Creando...' : 'Crear Materia'}
          </Button>
        </form>
      </Form>
  )
}
