
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
import { assignCarreraToCoordinador } from "@/services/api"
import { useState, useRef } from "react"
import { Career } from "@/lib/modelos"

const assignCareerSchema = z.object({
  id_carrera: z.coerce.number().min(1, "Por favor, seleccione una carrera."),
});

type AssignCareerFormValues = z.infer<typeof assignCareerSchema>;

interface AssignCareerToCoordinatorFormProps {
  coordinadorId: number;
  availableCareers: Career[];
  onSuccess?: () => void;
}

export function AssignCareerToCoordinatorForm({ coordinadorId, availableCareers, onSuccess }: AssignCareerToCoordinatorFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignCareerFormValues>({
    resolver: zodResolver(assignCareerSchema),
  });

  const onSubmit = async (data: AssignCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await assignCarreraToCoordinador({ id_coordinador: coordinadorId, id_carrera: data.id_carrera });
      toast.current?.show({
        severity: "success",
        summary: "Carrera Asignada",
        detail: `La carrera ha sido asignada al coordinador con éxito.`,
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
            name="id_carrera"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrera a Asignar</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una carrera" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCareers.length > 0 ? (
                      availableCareers.map((career) => (
                          <SelectItem key={career.id} value={String(career.id)}>
                          {career.name}
                          </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No hay más carreras para asignar</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || availableCareers.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Carrera'}
          </Button>
        </form>
      </Form>
    </>
  )
}
