
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
import { useToast } from "@/hooks/use-toast"
import { updatePlantel } from "@/services/api"
import { useState } from "react"
import { Plantel } from "@/lib/modelos"

const editPlantelSchema = z.object({
  nombre: z.string().min(1, "El nombre del plantel es requerido."),
  ubicacion: z.string().min(1, "La ubicación es requerida."),
});

type EditPlantelFormValues = z.infer<typeof editPlantelSchema>;

interface EditPlantelFormProps {
  plantel: Plantel;
  onSuccess?: () => void;
}

export function EditPlantelForm({ plantel, onSuccess }: EditPlantelFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditPlantelFormValues>({
    resolver: zodResolver(editPlantelSchema),
    defaultValues: {
      nombre: plantel.name,
      ubicacion: plantel.location,
    },
  });

  const onSubmit = async (data: EditPlantelFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePlantel(plantel.id, data);
      toast({
        title: "Plantel Actualizado",
        description: `El plantel ${data.nombre} ha sido actualizado con éxito.`,
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: error.message,
        });
      }
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
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  )
}
