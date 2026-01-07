
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
import { createPlantel } from "@/services/api"
import { useState } from "react"
import { Plantel } from "@/lib/modelos"

const createPlantelSchema = z.object({
  nombre: z.string().min(1, "El nombre del plantel es requerido."),
  ubicacion: z.string().min(1, "La ubicación es requerida."),
});

type CreatePlantelFormValues = z.infer<typeof createPlantelSchema>;

interface CreatePlantelFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreatePlantelForm({ onSuccess }: CreatePlantelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePlantelFormValues>({
    resolver: zodResolver(createPlantelSchema),
    defaultValues: {
      nombre: "",
      ubicacion: "",
    },
  });

  const onSubmit = async (data: CreatePlantelFormValues) => {
    setIsSubmitting(true);
    try {
      await createPlantel(data);
      toast.success(`El plantel ${data.nombre} ha sido creado con éxito.`);
      onSuccess?.({
        summary: "Plantel Creado",
        detail: `El plantel ${data.nombre} ha sido creado con éxito.`,
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
                <FormLabel>Nombre del Plantel</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Plantel Centro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Av. Principal 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Plantel'}
          </Button>
        </form>
      </Form>
    </>
  )
}
