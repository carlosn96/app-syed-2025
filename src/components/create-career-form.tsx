
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
import { createCareer } from "@/services/api"
import { useState, useEffect } from "react"
import { User } from "@/lib/modelos"

const createCareerSchema = z.object({
  nombre: z.string().min(1, "El nombre de la carrera es requerido."),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

interface CreateCareerFormProps {
  onSuccess?: () => void;
  careerName?: string;
}

export function CreateCareerForm({ onSuccess, careerName }: CreateCareerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      nombre: careerName || "",
    },
  });

  const onSubmit = async (data: CreateCareerFormValues) => {
    setIsSubmitting(true);
    try {
        await createCareer(data);
      
      toast({
        title: "Carrera Creada",
        description: `La carrera ${data.nombre} ha sido creada. Ahora puedes asignarle planes de estudio.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear",
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
              <FormLabel>Nombre de la Carrera</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Ingeniería en Software" {...field} disabled={!!careerName} />
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
  )
}
