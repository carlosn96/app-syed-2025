
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
import { Toast } from 'primereact/toast';
import { assignModalityToCareer, getModalities } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { Modality } from "@/lib/modelos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const createStudyPlanSchema = z.object({
  id_modalidad: z.coerce.number().min(1, "Debes seleccionar una modalidad."),
});

type CreateStudyPlanFormValues = z.infer<typeof createStudyPlanSchema>;

interface CreateStudyPlanFormProps {
  onSuccess?: () => void;
  careerId: number;
}


export function CreateStudyPlanForm({ onSuccess, careerId }: CreateStudyPlanFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalities, setModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const fetchModalities = async () => {
      try {
        const data = await getModalities();
        setModalities(data);
      } catch (error) {
        console.error("Error fetching modalities", error);
      }
    }
    fetchModalities();
  }, []);

  const form = useForm<CreateStudyPlanFormValues>({
    resolver: zodResolver(createStudyPlanSchema),
  });

  const onSubmit = async (data: CreateStudyPlanFormValues) => {
    setIsSubmitting(true);
    try {
      await assignModalityToCareer({ id_carrera: careerId, id_modalidad: data.id_modalidad });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al asignar modalidad",
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
                            modalities.map(m => (
                                <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>
                            ))
                        ) : (
                            <SelectItem value="loading" disabled>Cargando modalidades...</SelectItem>
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
