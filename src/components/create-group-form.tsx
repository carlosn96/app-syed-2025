
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
import { 
  createGroup, 
  getCarrerasForCoordinador, 
  getStudyPlanCoordinatorByCareerId,
  getPlantelesForCareer,
  getTurnosCoordinador,
  getNivelesCoordinador
} from "@/services/api"
import { useState, useRef, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CareerSummary, StudyPlanRecord, Plantel } from "@/lib/modelos"

const createGroupSchema = z.object({
  acronimo: z.string().min(1, "El acrónimo es requerido.").max(15, "El acrónimo no puede exceder 15 caracteres."),
  id_carrera: z.coerce.number().min(1, "Debes seleccionar una carrera."),
  id_plan_estudio: z.coerce.number().min(1, "Debes seleccionar un plan de estudio."),
  id_plantel: z.coerce.number().min(1, "Debes seleccionar un plantel."),
  id_turno: z.coerce.number().min(1, "Debes seleccionar un turno."),
  id_nivel: z.coerce.number().min(1, "Debes seleccionar un nivel."),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for data
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlanRecord[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([]);
  const [niveles, setNiveles] = useState<{ id: number; nombre: string }[]>([]);
  
  // Loading states
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingPlanteles, setLoadingPlanteles] = useState(false);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      acronimo: "",
    },
  });

  const selectedCareer = form.watch("id_carrera");

  // Cargar datos iniciales: carreras del coordinador, turnos y niveles
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [careersData, turnosData, nivelesData] = await Promise.all([
          getCarrerasForCoordinador(),
          getTurnosCoordinador(),
          getNivelesCoordinador()
        ]);
        
        setCareers(Array.isArray(careersData) ? careersData : [careersData]);
        setTurnos(turnosData);
        setNiveles(nivelesData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los datos iniciales.",
        });
      } finally {
        setLoadingCareers(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Cuando se selecciona una carrera, cargar planes de estudio y planteles
  useEffect(() => {
    if (!selectedCareer) {
      setStudyPlans([]);
      setPlanteles([]);
      return;
    }

    const fetchCareerData = async () => {
      try {
        setLoadingPlans(true);
        setLoadingPlanteles(true);
        
        const [plansData, plantelesData] = await Promise.all([
          getStudyPlanCoordinatorByCareerId(selectedCareer),
          getPlantelesForCareer(selectedCareer)
        ]);
        
        setStudyPlans(plansData);
        setPlanteles(plantelesData);
        
        // Resetear campos dependientes cuando cambia la carrera
        form.setValue("id_plan_estudio", 0);
        form.setValue("id_plantel", 0);
      } catch (error) {
        console.error("Error al cargar datos de la carrera:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los planes o planteles.",
        });
      } finally {
        setLoadingPlans(false);
        setLoadingPlanteles(false);
      }
    };

    fetchCareerData();
  }, [selectedCareer, form]);

  const onSubmit = async (data: CreateGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await createGroup(data);
      onSuccess?.({
        summary: "Grupo Creado",
        detail: `El grupo ${data.acronimo} ha sido creado exitosamente.`,
      });
      form.reset();
      setStudyPlans([]);
      setPlanteles([]);
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
          {/* Acrónimo del grupo */}
          <FormField
            control={form.control}
            name="acronimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acrónimo del Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. A1, B2, etc." {...field} maxLength={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Carrera */}
          <FormField
            control={form.control}
            name="id_carrera"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrera</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? String(field.value) : undefined}
                  disabled={loadingCareers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCareers ? "Cargando..." : "Seleccione una carrera"} />
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

          {/* Plan de Estudio */}
          <FormField
            control={form.control}
            name="id_plan_estudio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan de Estudio</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? String(field.value) : undefined}
                  disabled={!selectedCareer || loadingPlans || studyPlans.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedCareer 
                            ? "Primero seleccione una carrera" 
                            : loadingPlans 
                              ? "Cargando..." 
                              : studyPlans.length === 0 
                                ? "No hay planes disponibles"
                                : "Seleccione un plan"
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {studyPlans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.nombre_modalidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Plantel */}
          <FormField
            control={form.control}
            name="id_plantel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plantel</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? String(field.value) : undefined}
                  disabled={!selectedCareer || loadingPlanteles || planteles.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedCareer 
                            ? "Primero seleccione una carrera" 
                            : loadingPlanteles 
                              ? "Cargando..." 
                              : planteles.length === 0 
                                ? "No hay planteles disponibles"
                                : "Seleccione un plantel"
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {planteles.map((plantel) => (
                      <SelectItem key={plantel.id} value={String(plantel.id)}>
                        {plantel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Turno */}
          <FormField
            control={form.control}
            name="id_turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={String(turno.id)}>
                        {turno.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nivel */}
          <FormField
            control={form.control}
            name="id_nivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel Actual</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un nivel" />
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
            {isSubmitting ? 'Creando...' : 'Crear Grupo'}
          </Button>
        </form>
      </Form>
    </>
  )
}

