
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { careers, planteles, users } from "@/lib/data"

const createCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  campus: z.string().min(1, "Por favor, seleccione un plantel."),
  coordinator: z.string().optional(),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

const coordinators = users.filter(u => u.rol === 'coordinator');

interface CreateCareerFormProps {
  onSuccess?: () => void;
  careerName?: string;
}

// This is a mock function, in a real app this would be an API call
const addCareer = (data: CreateCareerFormValues) => {
    const newId = Math.max(...careers.map(c => c.id), 0) + 1;
    // For simplicity, we add a default modality. This can be edited later.
    const newCareer = {
        id: newId,
        name: data.name,
        modality: "Nuevo Plan",
        campus: data.campus,
        coordinator: data.coordinator || "No asignado",
        semesters: 1, // Default value, can be edited later
    };
    careers.push(newCareer);
    console.log("Carrera creada:", newCareer);
};

export function CreateCareerForm({ onSuccess, careerName }: CreateCareerFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      name: careerName || "",
      campus: "",
      coordinator: "",
    },
  });

  const onSubmit = (data: CreateCareerFormValues) => {
    try {
      addCareer(data);
      toast({
        title: "Operación Exitosa",
        description: `La carrera ${data.name} ha sido creada. Ahora puedes crear sus planes de estudio.`,
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Carrera</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Ingeniería en Software" {...field} disabled={!!careerName} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="campus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un plantel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {planteles.map((plantel) => (
                    <SelectItem key={plantel.id} value={plantel.name}>
                      {plantel.name}
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
          name="coordinator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinador (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un coordinador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value="">Sin asignar</SelectItem>
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
        <Button type="submit" className="w-full">{careerName ? 'Crear Plan de Estudio' : 'Crear Carrera'}</Button>
      </form>
    </Form>
  )
}
