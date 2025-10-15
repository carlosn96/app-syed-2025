
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
import { Toast } from 'primereact/toast';
import { createStudyPlan } from "@/services/api" // Assuming a similar function for study plans
import { useState, useRef } from "react"

const createStudyPlanSchema = z.object({
  modality: z.string().min(1, "El nombre de la modalidad es requerido."),
  semesters: z.coerce.number().positive("El número de semestres debe ser positivo.").min(1, "El número no puede ser mayor a 12."),
});

type CreateStudyPlanFormValues = z.infer<typeof createStudyPlanSchema>;

interface CreateStudyPlanFormProps {
  onSuccess?: () => void;
  careerName: string;
  campus: string;
  coordinator: string;
}


export function CreateStudyPlanForm({ onSuccess, careerName, campus, coordinator }: CreateStudyPlanFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateStudyPlanFormValues>({
    resolver: zodResolver(createStudyPlanSchema),
    defaultValues: {
      modality: "",
      semesters: 1,
    },
  });

  const onSubmit = async (data: CreateStudyPlanFormValues) => {
    setIsSubmitting(true);
    if (!campus || !coordinator) {
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo determinar el plantel o coordinador para este plan.",
        });
        setIsSubmitting(false);
        return;
    }
    const newPlanData = {
        name: careerName,
        ...data,
        campus,
        coordinator,
    };
    try {
      await createStudyPlan(newPlanData); 
      toast.current?.show({
        severity: "success",
        summary: "Plan de Estudio Creado",
        detail: `La modalidad ${data.modality} ha sido creada para ${careerName}.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al crear",
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
            name="modality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Modalidad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. INCO, LAET" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semesters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración en Semestres</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Plan de Estudio'}
          </Button>
        </form>
      </Form>
    </>
  )
}
