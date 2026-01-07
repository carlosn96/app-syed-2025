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
import toast from 'react-hot-toast'
import { assignCarreraToCoordinador, removeCarreraFromCoordinador, getCareers } from "@/services/api"
import { useState, useEffect } from "react"
import { CareerSummary, AssignedCareer } from "@/lib/modelos"
import { Loader } from "lucide-react"

const assignCareerSchema = z.object({
  id_carrera: z.coerce.number().min(1, "Por favor, seleccione una carrera."),
});

type AssignCareerFormValues = z.infer<typeof assignCareerSchema>;

interface ManageCoordinatorCareersFormProps {
  coordinadorId: number;
  assignedCareers: AssignedCareer[];
  onSuccess?: () => void;
}

export function ManageCoordinatorCareersForm({ 
  coordinadorId, 
  assignedCareers,
  onSuccess 
}: ManageCoordinatorCareersFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  const form = useForm<AssignCareerFormValues>({
    resolver: zodResolver(assignCareerSchema),
    defaultValues: {
      id_carrera: undefined
    }
  });

  useEffect(() => {
    const fetchCareers = async () => {
      setIsLoadingCareers(true);
      try {
        const careerData = await getCareers();
        setAllCareers(careerData);
      } catch (error) {
        console.error("Failed to fetch careers:", error);
        toast.error("No se pudieron cargar las carreras disponibles.");
      } finally {
        setIsLoadingCareers(false);
      }
    }
    fetchCareers();
  }, []);

  // Filtrar carreras que no están asignadas
  const availableCareers = allCareers.filter(
    career => !assignedCareers.some(assigned => assigned.id_carrera === career.id)
  );

  const handleRemove = async (carreraId: number, carreraName: string) => {
    setIsRemoving(carreraId);
    try {
      await removeCarreraFromCoordinador({ 
        id_coordinador: coordinadorId, 
        id_carrera: carreraId 
      });
      toast.success(`Se ha removido la carrera "${carreraName}" del coordinador.`);
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
          severity: "error",
          summary: "Error al remover",
          detail: error.message,
        });
      }
    } finally {
      setIsRemoving(null);
    }
  };

  const onSubmit = async (data: AssignCareerFormValues) => {
    setIsSubmitting(true);
    try {
      await assignCarreraToCoordinador({ 
        id_coordinador: coordinadorId, 
        id_carrera: data.id_carrera 
      });
      const careerName = allCareers.find(c => c.id === data.id_carrera)?.name || '';
      toast.success(`La carrera "${careerName}" ha sido asignada al coordinador.`);
      form.reset();
      onSuccess?.();
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
      <div className="space-y-6">
        {/* Formulario para asignar nueva carrera */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">Asignar Nueva Carrera</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id_carrera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ? String(field.value) : ""}
                      disabled={isLoadingCareers || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCareers ? "Cargando..." : "Seleccione una carrera"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCareers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader className="h-4 w-4 animate-spin" />
                          </div>
                        ) : availableCareers.length > 0 ? (
                          availableCareers.map((career) => (
                            <SelectItem key={career.id} value={String(career.id)}>
                              {career.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {assignedCareers.length > 0 
                              ? "Todas las carreras ya están asignadas"
                              : "No hay carreras disponibles"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoadingCareers || availableCareers.length === 0}
              >
                {isSubmitting ? 'Asignando...' : 'Asignar Carrera'}
              </Button>
            </form>
          </Form>
        </div>

        {/* Lista de carreras asignadas */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">Carreras Asignadas</h3>
          {assignedCareers.length > 0 ? (
            <div className="space-y-2">
              {assignedCareers.map((career) => (
                <div 
                  key={career.id_carrera} 
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <span className="font-medium">{career.carrera}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(career.id_carrera, career.carrera)}
                    disabled={isRemoving === career.id_carrera || isSubmitting}
                  >
                    {isRemoving === career.id_carrera ? "Removiendo..." : "Remover"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No hay carreras asignadas actualmente.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
