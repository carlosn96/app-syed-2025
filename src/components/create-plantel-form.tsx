
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
import { useToast } from "@/hooks/use-toast"
import { planteles } from "@/lib/data"

const createPlantelSchema = z.object({
  name: z.string().min(1, "El nombre del plantel es requerido."),
  location: z.string().min(1, "La ubicación es requerida."),
  director: z.string().min(1, "El nombre del director es requerido."),
});

type CreatePlantelFormValues = z.infer<typeof createPlantelSchema>;

// This is a mock function, in a real app this would be an API call
const addPlantel = (data: CreatePlantelFormValues) => {
    const newId = Math.max(...planteles.map(p => p.id), 0) + 1;
    const newPlantel = {
        id: newId,
        name: data.name,
        location: data.location,
        director: data.director,
    };
    planteles.push(newPlantel);
    console.log("Plantel creado:", newPlantel);
};

export function CreatePlantelForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreatePlantelFormValues>({
    resolver: zodResolver(createPlantelSchema),
    defaultValues: {
      name: "",
      location: "",
      director: "",
    },
  });

  const onSubmit = (data: CreatePlantelFormValues) => {
    try {
      addPlantel(data);
      toast({
        title: "Plantel Creado",
        description: `El plantel ${data.name} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear plantel",
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
              <FormLabel>Nombre del Plantel</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Plantel Centro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Av. Principal 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="director"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Director(a)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Dr. Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Plantel</Button>
      </form>
    </Form>
  )
}
