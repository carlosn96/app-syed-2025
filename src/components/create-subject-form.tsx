
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
import { subjects, teachers, careers } from "@/lib/data"

const createSubjectSchema = z.object({
  name: z.string().min(1, "El nombre de la materia es requerido."),
  teacher: z.string().min(1, "Por favor, seleccione un docente."),
  career: z.string().min(1, "Por favor, seleccione una carrera."),
});

type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

// This is a mock function, in a real app this would be an API call
const addSubject = (data: CreateSubjectFormValues) => {
    const newId = Math.max(...subjects.map(s => s.id), 0) + 1;
    // For now, we add a mock semester, this would be handled differently
    // when we can assign subjects to a career's curriculum dynamically.
    const newSubject = {
        id: newId,
        ...data,
        semester: 1 
    };
    subjects.push(newSubject);
    console.log("Materia creada:", newSubject);
};

export function CreateSubjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      teacher: "",
      career: "",
    },
  });

  const onSubmit = (data: CreateSubjectFormValues) => {
    try {
      addSubject(data);
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
          name="career"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.name}>
                      {career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Materia</Button>
      </form>
    </Form>
  )
}
