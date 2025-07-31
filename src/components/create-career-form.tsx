
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
import { careers, planteles, subjects, users } from "@/lib/data"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const createCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  modality: z.string().min(1, "La modalidad es requerida."),
  campus: z.string().min(1, "Por favor, seleccione un plantel."),
  coordinator: z.string().min(1, "Por favor, seleccione un coordinador."),
  semesters: z.coerce.number().min(1, "Debe haber al menos 1 semestre.").max(12, "No puede haber más de 12 semestres."),
  subjectIds: z.array(z.number()).optional(),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

const coordinators = users.filter(u => u.rol === 'coordinator');

interface CreateCareerFormProps {
  onSuccess?: () => void;
  careerName?: string;
}

// This is a mock function, in a real app this would be an API call
const addCareer = (data: CreateCareerFormValues) => {
    const newId = Math.max(...careers.map(c => c.id), 0) + 1;
    const newCareer = {
        id: newId,
        name: data.name,
        modality: data.modality,
        campus: data.campus,
        coordinator: data.coordinator,
        semesters: data.semesters,
    };
    careers.push(newCareer);

    if (data.subjectIds) {
        data.subjectIds.forEach(subjectId => {
            const subject = subjects.find(s => s.id === subjectId);
            if (subject) {
                // In a real app, you would handle this relationship in a database.
                // For now, we can log it or modify a copy of the subject.
                console.log(`Asignando materia ${subject.name} a la carrera ${newCareer.name}`);
            }
        });
    }

    console.log("Carrera creada:", newCareer);
    console.log("Materias asignadas (IDs):", data.subjectIds);
};

export function CreateCareerForm({ onSuccess, careerName }: CreateCareerFormProps) {
  const { toast } = useToast();

  const sortedSubjects = [...subjects].sort((a, b) => a.semester - b.semester);

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      name: careerName || "",
      modality: "",
      campus: "",
      coordinator: "",
      semesters: 8,
      subjectIds: [],
    },
  });

  const numberOfSemesters = form.watch("semesters");

  const onSubmit = (data: CreateCareerFormValues) => {
    try {
      addCareer(data);
      toast({
        title: "Operación Exitosa",
        description: `El plan de estudios ${data.modality} para ${data.name} ha sido creado.`,
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
          name="modality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidad / Plan de Estudio</FormLabel>
              <FormControl>
                <Input placeholder="Ej. INCO, ICOM, LAE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="campus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un plantel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {planteles.map((plantel) => (
                    <SelectItem key={plantel.id} value={plantel.name}>
                      {plantel.name}
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
          name="coordinator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un coordinador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
          name="semesters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Semestres</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="subjectIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Asignar Materias (Opcional)</FormLabel>
                <FormDescription>
                  Selecciona las materias existentes que formarán parte de este plan.
                </FormDescription>
              </div>
               <ScrollArea className="h-40 w-full rounded-md border">
                 <div className="p-4">
                    {sortedSubjects
                        .filter(subject => subject.semester <= numberOfSemesters)
                        .map((subject) => (
                        <FormField
                        key={subject.id}
                        control={form.control}
                        name="subjectIds"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={subject.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(subject.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value ?? []), subject.id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== subject.id
                                            )
                                        )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                   {subject.semester}° - {subject.name} ({subject.career})
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

        <Button type="submit" className="w-full">{careerName ? 'Crear Plan de Estudio' : 'Crear Carrera'}</Button>
      </form>
    </Form>
  )
}
