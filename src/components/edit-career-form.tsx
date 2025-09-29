
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
  coordinatorId: z.string().optional(),
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
        const coordinatorUsers = usersData.filter(u => u.rol === 'coordinador');
        setCoordinators(coordinatorUsers);
    };
    fetchData();
  }, []);

  const initialCoordinator = coordinators.find(c => `${c.nombre} ${c.apellido_paterno}`.trim() === career.coordinator);

  const form = useForm<EditCareerFormValues>({
    resolver: zodResolver(editCareerSchema),
    defaultValues: {
      name: career.name,
      coordinatorId: initialCoordinator?.id.toString() || "unassigned",
    },
  });

   useEffect(() => {
    if (coordinators.length > 0) {
        const initialCoordinator = coordinators.find(c => `${c.nombre} ${c.apellido_paterno}`.trim() === career.coordinator);
        form.reset({
            name: career.name,
            coordinatorId: initialCoordinator?.id.toString() || "unassigned",
        });
    }
  }, [coordinators, career, form]);

  const onSubmit = async (data: EditCareerFormValues) => {
    setIsSubmitting(true);
    try {
        const careerData = {
            carrera: data.name,
            id_coordinador: data.coordinatorId === 'unassigned' ? null : Number(data.coordinatorId),
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
          name="coordinatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinador (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un coordinador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {coordinators.map((coordinator) => (
                    <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
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
