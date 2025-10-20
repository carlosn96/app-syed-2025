
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
import { assignCarreraToCoordinador, getCoordinadores } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { CareerSummary, Coordinador } from "@/lib/modelos"

const assignCareerSchema = z.object({
  id_coordinador: z.coerce.number().min(1, "Por favor, seleccione un coordinador."),
});

type AssignCareerFormValues = z.infer<typeof assignCareerSchema>;

interface AssignCareerToCoordinatorFormProps {
  career: CareerSummary;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function AssignCareerToCoordinatorForm({ career, onSuccess }: AssignCareerToCoordinatorFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState<Coordinador[]>([]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      const coordinatorData = await getCoordinadores();
      setCoordinators(coordinatorData);
    }
    fetchCoordinators();
  }, []);

  const form = useForm<AssignCareerFormValues>({
    resolver: zodResolver(assignCareerSchema),
  });

  const onSubmit = async (data: AssignCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await assignCarreraToCoordinador({ id_coordinador: data.id_coordinador, id_carrera: career.id });
      const coordinatorName = coordinators.find(c => c.id_coordinador === data.id_coordinador)?.nombre_completo || '';
      onSuccess?.({
        summary: "Coordinador Asignado",
        detail: `${coordinatorName} ha sido asignado a ${career.name}.`,
      });
      form.reset();
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.current.show({
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
            name="id_coordinador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinador</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un coordinador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {coordinators.length > 0 ? (
                      coordinators.map((coordinator) => (
                          <SelectItem key={coordinator.id_coordinador} value={String(coordinator.id_coordinador)}>
                          {coordinator.nombre_completo}
                          </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No hay coordinadores disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || coordinators.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Coordinador'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    