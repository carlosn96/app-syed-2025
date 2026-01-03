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
import { Toast } from 'primereact/toast'
import { updatePeriodo } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { Periodo } from "@/lib/modelos"

const editPeriodoSchema = z.object({
  nombre: z.string().min(1, "El nombre del periodo es requerido.").max(10, "El nombre es muy largo"),
});

type EditPeriodoFormValues = z.infer<typeof editPeriodoSchema>;

interface EditPeriodoFormProps {
  periodo: Periodo;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function EditPeriodoForm({ periodo, onSuccess }: EditPeriodoFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditPeriodoFormValues>({
    resolver: zodResolver(editPeriodoSchema),
    defaultValues: {
      nombre: periodo.nombre,
    },
  });

  useEffect(() => {
    form.reset({
      nombre: periodo.nombre,
    });
  }, [periodo, form]);

  const onSubmit = async (data: EditPeriodoFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePeriodo(periodo.id, data);
      onSuccess?.({
        summary: "Periodo Actualizado",
        detail: `El periodo ${data.nombre} ha sido actualizado con éxito.`,
      });
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.current.show({
            severity: "error",
            summary: "Error al actualizar periodo",
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
              {isSubmitting ? "Actualizando..." : "Actualizar Periodo"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}