
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
import { Toast } from 'primereact/toast';
import { assignModalityToCareer, getModalities } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { Modality } from "@/lib/modelos"

const assignModalitySchema = z.object({
  id_modalidad: z.coerce.number().min(1, "Por favor, seleccione una modalidad."),
});

type AssignModalityFormValues = z.infer<typeof assignModalitySchema>;

interface AssignModalityFormProps {
  careerId: number;
  onSuccess?: () => void;
}

export function AssignModalityForm({ careerId, onSuccess }: AssignModalityFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalities, setModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const fetchModalities = async () => {
      const modalitiesData = await getModalities();
      setModalities(modalitiesData);
    }
    fetchModalities();
  }, []);

  const form = useForm<AssignModalityFormValues>({
    resolver: zodResolver(assignModalitySchema),
  });

  const onSubmit = async (data: AssignModalityFormValues) => {
    setIsSubmitting(true);
    try {
      await assignModalityToCareer({ id_carrera: careerId, id_modalidad: data.id_modalidad });
      toast.current?.show({
        severity: "success",
        summary: "Modalidad Asignada",
        detail: `La modalidad ha sido asignada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al asignar",
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
            name="id_modalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una modalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modalities.length > 0 ? (
                      modalities.map((modality) => (
                          <SelectItem key={modality.id_modalidad} value={String(modality.id_modalidad)}>
                          {modality.modalidad}
                          </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No hay modalidades disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || modalities.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Modalidad'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    