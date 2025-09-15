
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
import { createPlantel } from "@/services/api"
import { useState } from "react"

const createPlantelSchema = z.object({
  name: z.string().min(1, "El nombre del plantel es requerido."),
  location: z.string().min(1, "La ubicación es requerida."),
  director: z.string().min(1, "El nombre del director es requerido."),
});

type CreatePlantelFormValues = z.infer<typeof createPlantelSchema>;

export function CreatePlantelForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePlantelFormValues>({
    resolver: zodResolver(createPlantelSchema),
    defaultValues: {
      name: "",
      location: "",
      director: "",
    },
  });

  const onSubmit = async (data: CreatePlantelFormValues) => {
    setIsSubmitting(true);
    try {
      await createPlantel(data);
      toast({
        title: "Plantel Creado",
        description: `El plantel ${data.name} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear plantel",
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
          name="name"
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
          name="location"
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
        <FormField
          control={form.control}
          name="director"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Director</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Dr. Juan Pérez" {...field} />
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
  )
}
