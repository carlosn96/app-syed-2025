
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
import toast from 'react-hot-toast';
import { assignCarreraToCoordinador, getCoordinadores, removeCarreraFromCoordinador } from "@/services/api"
import { useState, useEffect } from "react"
import { CareerSummary, Coordinador } from "@/lib/modelos"
import { Loader, Trash2 } from "lucide-react"

const assignCareerSchema = z.object({
  id_coordinador: z.coerce.number().min(1, "Por favor, seleccione un coordinador."),
});

type AssignCareerFormValues = z.infer<typeof assignCareerSchema>;

interface AssignCareerToCoordinatorFormProps {
  career: CareerSummary;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function AssignCareerToCoordinatorForm({ career, onSuccess }: AssignCareerToCoordinatorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState<Coordinador[]>([]);
  const [isLoadingCoordinators, setIsLoadingCoordinators] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const form = useForm<AssignCareerFormValues>({
    resolver: zodResolver(assignCareerSchema),
    defaultValues: {
      id_coordinador: undefined
    }
  });

  useEffect(() => {
    const fetchCoordinators = async () => {
      setIsLoadingCoordinators(true);
      try {
        const coordinatorData = await getCoordinadores();
        setCoordinators(coordinatorData);
      } catch (error) {
        console.error("Failed to fetch coordinators:", error);
      } finally {
        setIsLoadingCoordinators(false);
      }
    }
    fetchCoordinators();
  }, []);

  useEffect(() => {
    if (career.coordinator && coordinators.length > 0) {
      const currentCoordinator = coordinators.find(c => c.nombre_completo === career.coordinator);
      if (currentCoordinator) {
        form.setValue('id_coordinador', currentCoordinator.id_coordinador);
      } else {
        form.setValue('id_coordinador', undefined);
      }
    } else {
      form.setValue('id_coordinador', undefined);
    }
  }, [career, coordinators, form]);

  const handleRemove = async () => {
    if (!career.coordinator) return;

    const currentCoordinator = coordinators.find(c => c.nombre_completo === career.coordinator);
    if (!currentCoordinator) {
      toast("No se pudo encontrar el coordinador asignado actualmente.");
      return;
    }

    setIsRemoving(true);
    try {
      await removeCarreraFromCoordinador({ id_coordinador: currentCoordinator.id_coordinador, id_carrera: career.id });
      toast.success(`Se ha removido la asignación de ${currentCoordinator.nombre_completo} de ${career.name}.`);
      onSuccess?.({
        summary: "Coordinador Removido",
        detail: `Se ha removido la asignación de ${currentCoordinator.nombre_completo} de ${career.name}.`,
      });
      form.reset({ id_coordinador: undefined });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const onSubmit = async (data: AssignCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await assignCarreraToCoordinador({ id_coordinador: data.id_coordinador, id_carrera: career.id });
      const coordinatorName = coordinators.find(c => c.id_coordinador === data.id_coordinador)?.nombre_completo || '';
      toast.success(`${coordinatorName} ha sido asignado a ${career.name}.`);
      onSuccess?.({
        summary: "Coordinador Asignado",
        detail: `${coordinatorName} ha sido asignado a ${career.name}.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_coordinador"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Coordinador</FormLabel>
                  {career.coordinator && !isLoadingCoordinators && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={handleRemove}
                      disabled={isRemoving || isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isRemoving ? "Removiendo..." : "Remover"}
                    </Button>
                  )}
                </div>
                 <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoadingCoordinators || isRemoving || isSubmitting}
                 >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCoordinators ? "Cargando..." : "Seleccione un coordinador"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCoordinators ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader className="h-4 w-4 animate-spin" />
                      </div>
                    ) : coordinators.length > 0 ? (
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
          <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingCoordinators || isRemoving || coordinators.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Coordinador'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    