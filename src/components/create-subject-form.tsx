
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { subjects, teachers } from "@/lib/data"

const createSubjectSchema = z.object({
  name: z.string().min(1, "El nombre de la materia es requerido."),
  teacher: z.string().min(1, "Por favor, seleccione un docente."),
  semester: z.coerce.number().min(1, "El semestre debe ser al menos 1.").max(12, "El semestre no puede ser mayor a 12."),
});

type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

interface CreateSubjectFormProps {
  onSuccess?: () => void;
  careerName?: string; // Optional: To auto-assign the career
}

// This is a mock function, in a real app this would be an API call
const addSubject = (data: CreateSubjectFormValues, careerName?: string) => {
    const newId = Math.max(...subjects.map(s => s.id), 0) + 1;
    const newSubject = {
        id: newId,
        name: data.name,
        teacher: data.teacher,
        semester: data.semester,
        // If careerName is provided, assign it, otherwise default.
        career: careerName || "Sin Asignar"
    };
    subjects.push(newSubject);
    console.log("Materia creada:", newSubject);
};

export function CreateSubjectForm({ onSuccess, careerName }: CreateSubjectFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      teacher: "",
      semester: 1,
    },
  });

  const onSubmit = (data: CreateSubjectFormValues) => {
    try {
      addSubject(data, careerName);
      toast({
        title: "Materia Creada",
        description: `La materia ${data.name} ha sido creada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear materia",
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
              <FormLabel>Nombre de la Materia</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Cálculo Diferencial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un docente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
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
              <FormLabel>Semestre</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Materia</Button>
      </form>
    </Form>
  )
}
