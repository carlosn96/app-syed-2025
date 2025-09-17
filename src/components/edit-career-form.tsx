
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
import { updateCareer, getUsers } from "@/services/api"
import { useState, useEffect } from "react"
import { CareerSummary, User } from "@/lib/modelos"

const editCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  coordinator: z.string().optional().or(z.literal("unassigned")),
});

type EditCareerFormValues = z.infer<typeof editCareerSchema>;

interface EditCareerFormProps {
  career: CareerSummary;
  onSuccess?: () => void;
}

export function EditCareerForm({ career, onSuccess }: EditCareerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const usersData = await getUsers();
        setCoordinators(usersData.filter(u => u.rol === 'coordinador'));
    };
    fetchData();
  }, []);

  const form = useForm<EditCareerFormValues>({
    resolver: zodResolver(editCareerSchema),
    defaultValues: {
      name: career.name,
      coordinator: career.coordinator || "unassigned",
    },
  });

  const onSubmit = async (data: EditCareerFormValues) => {
    setIsSubmitting(true);
    try {
        const careerData = {
            carrera: data.name,
            coordinador: data.coordinator === 'unassigned' ? null : data.coordinator,
        };
      await updateCareer(career.id, careerData);
      toast({
        title: "Carrera Actualizada",
        description: `La carrera ${data.name} ha sido actualizada con éxito.`,
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
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
                <Input placeholder="Ej. Ingeniería en Software" {...field} />
              </FormControl>
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  )
}
