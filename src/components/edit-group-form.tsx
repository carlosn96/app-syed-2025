
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
import { updateGroup, getCarrerasForCoordinador } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CareerSummary, Group } from "@/lib/modelos"

const editGroupSchema = z.object({
  grupo: z.string().min(1, "El nombre del grupo es requerido."),
  id_carrera: z.coerce.number().min(1, "Debes seleccionar una carrera."),
  modalidad: z.string().min(1, "La modalidad es requerida."),
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

interface EditGroupFormProps {
  group: Group;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function EditGroupForm({ group, onSuccess }: EditGroupFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);

  const selectedCareer = careers.find(c => c.name === group.career);

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

  const form = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      grupo: group.name,
      id_carrera: selectedCareer?.id,
      modalidad: group.modality,
    },
  });

  useEffect(() => {
    if (selectedCareer) {
      form.setValue('id_carrera', selectedCareer.id);
    }
  }, [selectedCareer, form]);


  const onSubmit = async (data: EditGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await updateGroup(group.id, data);
      onSuccess?.({
        summary: "Grupo Actualizado",
        detail: `El grupo ${data.grupo} ha sido actualizado.`,
      });
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.current.show({
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
            name="grupo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grupo</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <Select onValueChange={field.onChange} value={String(field.value)}>
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
                  <Input {...field} />
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
