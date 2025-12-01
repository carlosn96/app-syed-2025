
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
import { createGroup, getCarrerasForCoordinador } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CareerSummary } from "@/lib/modelos"

const createGroupSchema = z.object({
  grupo: z.string().min(1, "El nombre del grupo es requerido."),
  id_carrera: z.coerce.number().min(1, "Debes seleccionar una carrera."),
  modalidad: z.string().min(1, "La modalidad es requerida."),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await getCarrerasForCoordinador();
        setCareers(data);
      } catch (error) {
        console.error("Failed to fetch careers for coordinator", error);
      }
    };
    fetchCareers();
  }, []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      grupo: "",
      modalidad: "",
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

  return (
    <>
      <Toast ref={toast} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="grupo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. COMPINCO2024A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="id_carrera"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrera</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione una carrera" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {careers.map((career) => (
                        <SelectItem key={career.id} value={String(career.id)}>
                            {career.name}
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
            name="modalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Escolarizada" {...field} />
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
