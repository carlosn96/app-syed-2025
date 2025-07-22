
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
import { careers, planteles, subjects } from "@/lib/data"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const createCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  campus: z.string().min(1, "Por favor, seleccione un plantel."),
  semesters: z.coerce.number().min(1, "Debe haber al menos 1 semestre.").max(12, "No puede haber más de 12 semestres."),
  subjectIds: z.array(z.number()).optional(),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

// This is a mock function, in a real app this would be an API call
const addCareer = (data: CreateCareerFormValues) => {
    const newId = Math.max(...careers.map(c => c.id), 0) + 1;
    const newCareer = {
        id: newId,
        name: data.name,
        campus: data.campus,
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

export function CreateCareerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const subjectsBySemester = subjects.reduce((acc, subject) => {
    const semester = subject.semester;
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(subject);
    return acc;
  }, {} as Record<number, typeof subjects>);

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      name: "",
      campus: "",
      semesters: 8,
      subjectIds: [],
    },
  });

  const onSubmit = (data: CreateCareerFormValues) => {
    try {
      addCareer(data);
      toast({
        title: "Carrera Creada",
        description: `La carrera ${data.name} ha sido creada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear carrera",
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
                <Input placeholder="Ej. Ingeniería en Software" {...field} />
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
                <FormLabel className="text-base">Plan de Estudios</FormLabel>
                <FormDescription>
                  Selecciona las materias que formarán parte de esta carrera.
                </FormDescription>
              </div>
               <ScrollArea className="h-72 w-full rounded-md border">
                 <div className="p-4">
                    {Object.entries(subjectsBySemester).map(([semester, subjectList]) => (
                        <div key={semester} className="mb-4">
                            <h4 className="font-semibold mb-2">Semestre {semester}</h4>
                            {subjectList.map((subject) => (
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
                                            {subject.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                        </div>
                    ))}
                 </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Crear Carrera</Button>
      </form>
    </Form>
  )
}
