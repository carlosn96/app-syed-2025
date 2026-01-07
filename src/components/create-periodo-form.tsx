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
import { createPeriodo } from "@/services/api"
import { useState } from "react"

const createPeriodoSchema = z.object({
  nombre: z.string().min(1, "El nombre del periodo es requerido.").max(10, "El nombre es muy largo"),
});

type CreatePeriodoFormValues = z.infer<typeof createPeriodoSchema>;

interface CreatePeriodoFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreatePeriodoForm({ onSuccess }: CreatePeriodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePeriodoFormValues>({
    resolver: zodResolver(createPeriodoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const onSubmit = async (data: CreatePeriodoFormValues) => {
    setIsSubmitting(true);
    try {
      await createPeriodo(data);
      toast.success(`El periodo ${data.nombre} ha sido creado con éxito.`);
      onSuccess?.({
        summary: "Periodo Creado",
        detail: `El periodo ${data.nombre} ha sido creado con éxito.`,
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
                <FormLabel>Nombre del Periodo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. A, B, C" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Periodo"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}