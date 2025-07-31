
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
import { careers } from "@/lib/data"

const createStudyPlanSchema = z.object({
  modality: z.string().min(1, "El nombre de la modalidad es requerido."),
  semesters: z.coerce.number().positive("El número de semestres debe ser positivo.").min(1, "El número de semestres debe ser al menos 1.").max(12, "El número no puede ser mayor a 12."),
});

type CreateStudyPlanFormValues = z.infer<typeof createStudyPlanSchema>;

interface CreateStudyPlanFormProps {
  onSuccess?: () => void;
  careerName: string;
  campus: string;
  coordinator: string;
}

// This is a mock function, in a real app this would be an API call
const addStudyPlan = (data: CreateStudyPlanFormValues, careerName: string, campus: string, coordinator: string) => {
    const newId = Math.max(...careers.map(c => c.id), 0) + 1;
    const newPlan = {
        id: newId,
        name: careerName,
        modality: data.modality,
        semesters: data.semesters,
        campus,
        coordinator,
    };
    careers.push(newPlan);
    console.log("Plan de estudio creado:", newPlan);
};

export function CreateStudyPlanForm({ onSuccess, careerName, campus, coordinator }: CreateStudyPlanFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateStudyPlanFormValues>({
    resolver: zodResolver(createStudyPlanSchema),
    defaultValues: {
      modality: "",
      semesters: 1,
    },
  });

  const onSubmit = (data: CreateStudyPlanFormValues) => {
    if (!campus || !coordinator) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo determinar el plantel o coordinador para este plan.",
        });
        return;
    }
    try {
      addStudyPlan(data, careerName, campus, coordinator);
      toast({
        title: "Plan de Estudio Creado",
        description: `La modalidad ${data.modality} ha sido creada para ${careerName}.`,
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
    }
  };

  return (
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
        <Button type="submit" className="w-full">Crear Plan de Estudio</Button>
      </form>
    </Form>
  )
}
