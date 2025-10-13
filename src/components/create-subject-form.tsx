
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
import { createSubject } from "@/services/api"
import { useEffect, useState, useRef } from "react"

const createSubjectSchema = z.object({
  name: z.string().min(1, "El nombre de la materia es requerido."),
  semester: z.coerce.number().min(1, "El grado debe ser al menos 1.").max(12, "El grado no puede ser mayor a 12."),
});

type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

interface CreateSubjectFormProps {
  onSuccess?: () => void;
  careerName?: string; 
  modalityName?: string;
  semester?: number | null;
}


export function CreateSubjectForm({ onSuccess, careerName, semester, modalityName }: CreateSubjectFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      semester: semester ?? 1,
    },
  });

  useEffect(() => {
    if (semester !== null && semester !== undefined) {
      form.setValue("semester", semester);
    }
  }, [semester, form]);

  const onSubmit = async (data: CreateSubjectFormValues) => {
    setIsSubmitting(true);
    const subjectData = {
        ...data,
        career: careerName || "Sin Asignar",
        modality: modalityName || "Sin Asignar"
    };
    try {
      await createSubject(subjectData);
      toast.current?.show({
        severity: "success",
        summary: "Materia Creada",
        detail: `La materia ${data.name} ha sido creada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al crear materia",
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Materia</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Cálculo Diferencial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={semester !== null && semester !== undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Materia'}
          </Button>
        </form>
      </Form>
    </>
  )
}
