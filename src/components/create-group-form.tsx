
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
import { ScrollArea } from "./ui/scroll-area"
import { Checkbox } from "./ui/checkbox"
import { useState, useEffect } from "react"
import { User, Career } from "@/lib/modelos"
import { getCareers, getUsers, createGroup } from "@/services/api"

const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es requerido."),
  cycle: z.string().min(1, "Por favor, seleccione un ciclo."),
  turno: z.string().min(1, "Por favor, seleccione un turno."),
  career: z.string().min(1, "Por favor, seleccione una carrera."),
  semester: z.coerce.number().min(1, "El grado debe ser al menos 1.").max(12, "El grado no puede ser mayor a 12."),
  studentIds: z.array(z.number()).optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

const availableCycles = ["2024-A", "2024-B", "2025-A", "2025-B"];
const availableTurnos = ["Matutino", "Vespertino"];

export function CreateGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [studentUsers, setStudentUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const [careersData, usersData] = await Promise.all([
            getCareers(),
            getUsers()
        ]);
        const uniqueCareerNames = [...new Set(careersData.map(c => c.name))];
        setCareers(uniqueCareerNames.map(name => ({ name } as Career))); // Simplified for the form
        setStudentUsers(usersData.filter(u => u.rol === 'alumno'));
    };
    fetchData();
  }, []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      career: "",
      semester: 1,
      cycle: "",
      turno: "",
      studentIds: [],
    },
  });
  
  const selectedCycle = form.watch("cycle");

  const onSubmit = async (data: CreateGroupFormValues) => {
    setIsSubmitting(true);
    try {
      await createGroup(data);
      toast({
        title: "Grupo Creado",
        description: `El grupo ${data.name} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear grupo",
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
          name="career"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCycle}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.name} value={career.name}>
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
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grado</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentIds"
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
                        name="studentIds"
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
  )
}
