
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
import toast from 'react-hot-toast';
import { 
  updateGroup, 
  getNivelesCoordinador
} from "@/services/api"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Group } from "@/lib/modelos"

const editGroupSchema = z.object({
  acronimo: z.string().min(1, "El acrónimo es requerido.").max(15, "El acrónimo no puede exceder 15 caracteres."),
  codigo_inscripcion: z.string().min(1, "El código de inscripción es requerido."),
  id_nivel: z.coerce.number().min(1, "Debes seleccionar un nivel."),
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

interface EditGroupFormProps {
  group: Group;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function EditGroupForm({ group, onSuccess }: EditGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [niveles, setNiveles] = useState<{ id: number; nombre: string }[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(true);

  const form = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      acronimo: group.acronimo,
      codigo_inscripcion: group.codigo_inscripcion,
      id_nivel: group.id_nivel,
    },
  });

  // Cargar niveles
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const nivelesData = await getNivelesCoordinador();
        setNiveles(nivelesData);
      } catch (error) {
        console.error("Error al cargar niveles:", error);
        toast.error("No se pudieron cargar los niveles.");
      } finally {
        setLoadingNiveles(false);
      }
    };
    
    fetchNiveles();
  }, []);

  const onSubmit = async (data: EditGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await updateGroup(group.id_grupo, data);
      onSuccess?.({
        summary: "Grupo Actualizado",
        detail: `El grupo ${data.acronimo} ha sido actualizado.`,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="acronimo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acrónimo del Grupo</FormLabel>
              <FormControl>
                <Input {...field} maxLength={15} placeholder="Ej: 1A, 2B, 3C" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="codigo_inscripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Inscripción</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Código único del grupo" />
              </FormControl>
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
              <Select 
                onValueChange={field.onChange} 
                value={String(field.value)}
                disabled={loadingNiveles}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingNiveles ? "Cargando niveles..." : "Seleccione un nivel"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel.id} value={String(nivel.id)}>
                      {nivel.nombre}
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
