
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
import { Toast } from 'primereact/toast';
import { ScrollArea } from "./ui/scroll-area"
import { Checkbox } from "./ui/checkbox"
import { useState, useEffect, useRef, useMemo } from "react"
import { User, Career, CareerSummary } from "@/lib/modelos"
import { getCareers, getUsers, createGroup } from "@/services/api"

const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es requerido."),
  cycle: z.string().min(1, "Por favor, seleccione un ciclo."),
  turno: z.string().min(1, "Por favor, seleccione un turno."),
  id_carrera: z.coerce.number().min(1, "Por favor, seleccione una carrera."),
  id_cat_nivel: z.coerce.number().min(1, "El grado debe ser al menos 1.").max(12, "El grado no puede ser mayor a 12."),
  id_alumnos: z.array(z.number()).optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

const availableCycles = ["2024-A", "2024-B", "2025-A", "2025-B"];
const availableTurnos = ["Matutino", "Vespertino"];
const availableNiveles = Array.from({length: 12}, (_, i) => ({ id: i + 1, label: `${i+1}°`}));

export function CreateGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [studentUsers, setStudentUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const [careersData, usersData] = await Promise.all([
            getCareers(),
            getUsers()
        ]);
        setCareers(careersData);
        setStudentUsers(usersData.filter(u => u.rol === 'alumno'));
    };
    fetchData();
  }, []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      cycle: "",
      turno: "",
      id_alumnos: [],
    },
  });
  
  const onSubmit = async (data: CreateGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await createGroup(data);
      toast.current?.show({
        severity: "success",
        summary: "Grupo Creado",
        detail: `El grupo ${data.name} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. COMPINCO2025A" {...field} />
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
            name="id_cat_nivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableNiveles.map((nivel) => (
                      <SelectItem key={nivel.id} value={String(nivel.id)}>
                        {nivel.label}
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
            name="cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un ciclo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCycles.map((cycle) => (
                      <SelectItem key={cycle} value={cycle}>
                        {cycle}
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
            name="turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTurnos.map((turno) => (
                      <SelectItem key={turno} value={turno}>
                        {turno}
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
            name="id_alumnos"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Alumnos</FormLabel>
                  <FormDescription>
                    Selecciona los alumnos que pertenecerán a este grupo.
                  </FormDescription>
                </div>
                 <ScrollArea className="h-48 w-full rounded-md border">
                   <div className="p-4 space-y-2">
                      {studentUsers.map((student) => (
                          <FormField
                          key={student.id}
                          control={form.control}
                          name="id_alumnos"
                          render={({ field }) => {
                              return (
                              <FormItem
                                  key={student.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                  <FormControl>
                                  <Checkbox
                                      checked={field.value?.includes(student.id)}
                                      onCheckedChange={(checked) => {
                                      return checked
                                          ? field.onChange([...(field.value ?? []), student.id])
                                          : field.onChange(
                                              field.value?.filter(
                                              (value) => value !== student.id
                                              )
                                          )
                                      }}
                                  />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                     {`${student.nombre} ${student.apellido_paterno}`}
                                     <p className="text-xs text-muted-foreground">{student.correo}</p>
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
              {isSubmitting ? 'Creando...' : 'Crear Grupo'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    