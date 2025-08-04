
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
import { supervisionRubrics } from "@/lib/data"

const createRubricSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  category: z.enum(["Contable", "No Contable"], {
    required_error: "Por favor, seleccione una categoría.",
  }),
});

type CreateRubricFormValues = z.infer<typeof createRubricSchema>;

const addRubric = (data: CreateRubricFormValues) => {
    const newId = Math.max(...supervisionRubrics.map(r => r.id), 0) + 1;
    const newRubric = {
        id: newId,
        title: data.title,
        category: data.category,
        type: "checkbox",
        criteria: [],
    };
    supervisionRubrics.push(newRubric);
    console.log("Rúbrica creada:", newRubric);
};

export function CreateRubricForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateRubricFormValues>({
    resolver: zodResolver(createRubricSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = (data: CreateRubricFormValues) => {
    try {
      addRubric(data);
      toast({
        title: "Rúbrica Creada",
        description: `La rúbrica "${data.title}" ha sido creada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear la rúbrica",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Rúbrica</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Presentación Personal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Contable">Contable</SelectItem>
                  <SelectItem value="No Contable">No Contable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Rúbrica</Button>
      </form>
    </Form>
  )
}
