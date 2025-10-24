
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assignModalityToCareer } from "@/services/api"
import { useState } from "react"
import { Modality } from "@/lib/modelos"

const assignModalitySchema = z.object({
  id_modalidad: z.coerce.number().min(1, "Por favor, seleccione una modalidad."),
});

type AssignModalityFormValues = z.infer<typeof assignModalitySchema>;

interface AssignModalityFormProps {
  careerId: number;
  availableModalities: Modality[];
  onSuccess?: (modalityName: string) => void;
}

export function AssignModalityForm({ careerId, availableModalidades, onSuccess }: AssignModalityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignModalityFormValues>({
    resolver: zodResolver(assignModalitySchema),
    defaultValues: {
      id_modalidad: undefined
    }
  });

  const onSubmit = async (data: AssignModalityFormValues) => {
    setIsSubmitting(true);
    try {
      await assignModalityToCareer({ id_carrera: careerId, id_modalidad: data.id_modalidad });
      const modalityName = availableModalidades.find(m => m.id === data.id_modalidad)?.nombre || '';
      form.reset();
      onSuccess?.(modalityName);
    } catch (error) {
      // Error handling is done in the parent component via toast
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_modalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad</FormLabel>
                 <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value ? String(field.value) : ""}
                  >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una modalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableModalidades.length > 0 ? (
                      availableModalidades.map((modality) => (
                          <SelectItem key={modality.id} value={String(modality.id)}>
                          {modality.nombre}
                          </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No hay más modalidades para asignar</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || availableModalidades.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Modalidad'}
          </Button>
        </form>
      </Form>
  )
}
