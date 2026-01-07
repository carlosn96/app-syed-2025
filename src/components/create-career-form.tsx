
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
import toast from 'react-hot-toast';
import { createCareer } from "@/services/api"
import { useState } from "react"

const createCareerSchema = z.object({
  nombre: z.string().min(1, "El nombre de la carrera es requerido."),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

interface CreateCareerFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreateCareerForm({ onSuccess }: CreateCareerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const onSubmit = async (data: CreateCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await createCareer({ nombre: data.nombre });
      toast.success(`La carrera ${data.nombre} ha sido creada.`);
      onSuccess?.({
        summary: "Carrera Creada",
        detail: `La carrera ${data.nombre} ha sido creada.`,
      });
      form.reset();
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
            name="nombre"
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
              {isSubmitting ? 'Creando...' : 'Crear Carrera'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    