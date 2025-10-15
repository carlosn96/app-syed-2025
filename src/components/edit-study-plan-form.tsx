
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
import { updateCareer, getUsers } from "@/services/api"
import { useState, useEffect, useRef } from "react"
import { Career, User } from "@/lib/modelos"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

const editStudyPlanSchema = z.object({
  coordinator: z.string().optional().or(z.literal("unassigned")),
  semesters: z.coerce.number().positive("El número de semestres debe ser positivo.").min(1).max(12),
});

type EditStudyPlanFormValues = z.infer<typeof editStudyPlanSchema>;

interface EditStudyPlanFormProps {
  modality: Career;
  onSuccess?: () => void;
}

export function EditStudyPlanForm({ modality, onSuccess }: EditStudyPlanFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState<User[]>([]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      const usersData = await getUsers();
      setCoordinators(usersData.filter(u => u.rol === 'coordinador'));
    };
    fetchCoordinators();
  }, []);

  const form = useForm<EditStudyPlanFormValues>({
    resolver: zodResolver(editStudyPlanSchema),
    defaultValues: {
      coordinator: modality.coordinator || "unassigned",
      semesters: modality.semesters,
    },
  });

  const onSubmit = async (data: EditStudyPlanFormValues) => {
    setIsSubmitting(true);
    const updatedData = {
        ...data,
        coordinator: data.coordinator === 'unassigned' ? "No asignado" : data.coordinator,
    };

    try {
      await updateCareer(modality.id, updatedData as Partial<Career>);
      toast.current?.show({
        severity: "success",
        summary: "Plan de Estudio Actualizado",
        detail: `La modalidad ha sido actualizada con éxito.`,
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al actualizar",
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
            name="coordinator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un coordinador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={`${coordinator.nombre} ${coordinator.apellido_paterno}`.trim()}>
                         {`${coordinator.nombre} ${coordinator.apellido_paterno}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Form>
    </>
  )
}
