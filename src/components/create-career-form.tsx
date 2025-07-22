
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
import { careers, planteles } from "@/lib/data"

const createCareerSchema = z.object({
  name: z.string().min(1, "El nombre de la carrera es requerido."),
  campus: z.string().min(1, "Por favor, seleccione un plantel."),
  semesters: z.coerce.number().min(1, "Debe haber al menos 1 semestre.").max(12, "No puede haber más de 12 semestres."),
});

type CreateCareerFormValues = z.infer<typeof createCareerSchema>;

// This is a mock function, in a real app this would be an API call
const addCareer = (data: CreateCareerFormValues) => {
    const newId = Math.max(...careers.map(c => c.id), 0) + 1;
    const newCareer = {
        id: newId,
        ...data
    };
    careers.push(newCareer);
    console.log("Carrera creada:", newCareer);
};

export function CreateCareerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateCareerFormValues>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: {
      name: "",
      campus: "",
      semesters: 8,
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
        <Button type="submit" className="w-full">Crear Carrera</Button>
      </form>
    </Form>
  )
}
