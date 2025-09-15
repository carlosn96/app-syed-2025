
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
  FormDescription,
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
import { createCareer, getPlanteles, getUsers } from "@/services/api"
import { Checkbox } from "./ui/checkbox"
import { ScrollArea } from "./ui/scroll-area"
import { useState, useEffect } from "react"
import { Plantel, User } from "@/lib/modelos"

const createCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  coordinator: z.string().optional().or(z.literal("unassigned")),
  campuses: z.array(z.string()).refine(value => value.length > 0, {
    message: "Debes seleccionar al menos un plantel.",
  }),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

interface CreateCareerFormProps {
  onSuccess?: () => void;
  careerName?: string;
}

export function CreateCareerForm({ onSuccess, careerName }: CreateCareerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const [usersData, plantelesData] = await Promise.all([
            getUsers(),
            getPlanteles()
        ]);
        setCoordinators(usersData.filter(u => u.rol === 'coordinador'));
        setPlanteles(plantelesData);
    };
    fetchData();
  }, []);

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      name: careerName || "",
      campuses: [],
      coordinator: "unassigned",
    },
  });

  const onSubmit = async (data: CreateCareerFormValues) => {
    setIsSubmitting(true);
    try {
        for (const campus of data.campuses) {
            const careerData = {
                name: data.name,
                modality: "Nuevo Plan",
                campus: campus,
                coordinator: data.coordinator === 'unassigned' ? "No asignado" : data.coordinator || "No asignado",
                semesters: 1, 
            };
            await createCareer(careerData);
        }
      
      toast({
        title: "Operación Exitosa",
        description: `La carrera ${data.name} ha sido creada en los planteles seleccionados. Ahora puedes configurar sus planes de estudio.`,
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
                <Input placeholder="Ej. Ingeniería en Software" {...field} disabled={!!careerName} />
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
        <FormField
          control={form.control}
          name="campuses"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Planteles</FormLabel>
                <FormDescription>
                  Selecciona los planteles donde se impartirá esta carrera.
                </FormDescription>
              </div>
              <ScrollArea className="h-32 w-full rounded-md border bg-black/10">
                <div className="p-4 space-y-2">
                    {planteles.map((plantel) => (
                        <FormField
                        key={plantel.id}
                        control={form.control}
                        name="campuses"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={plantel.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(plantel.name)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value ?? []), plantel.name])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== plantel.name
                                            )
                                        )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                   {plantel.name}
                                </FormLabel>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : (careerName ? 'Crear Plan de Estudio' : 'Crear Carrera')}
        </Button>
      </form>
    </Form>
  )
}
