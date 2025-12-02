
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
import { createGroup, getStudyPlanByCareerId } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Group, StudyPlanRecord } from "@/lib/modelos"

const createGroupSchema = z.object({
  id_plan_estudio: z.coerce.number().min(1, "Debes seleccionar un plan de estudio."),
  id_ciclo: z.coerce.number().min(1, "Debes seleccionar un ciclo."),
  id_nivel: z.coerce.number().min(1, "Debes seleccionar un nivel."),
  grupo: z.string().min(1, "El nombre del grupo es requerido."),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlanRecord[]>([]);
  const [allStudyPlans, setAllStudyPlans] = useState<StudyPlanRecord[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      // Assuming you might need to fetch all plans for a coordinator, adjust as needed
      // This is a placeholder for fetching relevant plans. 
      // For now, let's fetch for a sample careerId, this should be improved.
      try {
        const plans = await getStudyPlanByCareerId(0); // Fetch all plans initially.
        setAllStudyPlans(plans);
      } catch (error) {
         console.error("Failed to fetch study plans", error);
      }
    };
    fetchPlans();
  }, []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      grupo: "",
    },
  });

  const onSubmit = async (data: CreateGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await createGroup(data);
      onSuccess?.({
        summary: "Grupo Creado",
        detail: `El grupo ${data.grupo} ha sido creado.`,
      });
      form.reset();
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.current.show({
            severity: "error",
            summary: "Error al crear grupo",
            detail: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for cycles and levels, replace with API calls if available
  const cycles = [{id: 1, name: "2025-A"}, {id: 2, name: "2025-B"}];
  const levels = Array.from({length: 12}, (_, i) => ({ id: i + 1, name: `${i+1}° Semestre`}));

  return (
    <>
      <Toast ref={toast} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_plan_estudio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan de Estudio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione un plan" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {allStudyPlans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.carrera} - {plan.modalidad}
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
            name="id_ciclo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione un ciclo" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={String(cycle.id)}>
                            {cycle.name}
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
            name="id_nivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione un nivel" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {levels.map((level) => (
                        <SelectItem key={level.id} value={String(level.id)}>
                            {level.name}
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
            name="grupo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. A1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Grupo'}
          </Button>
        </form>
      </Form>
    </>
  )
}
