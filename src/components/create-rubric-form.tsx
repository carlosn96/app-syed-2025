
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
import { Toast } from 'primereact/toast';
import { useRef, useState } from "react"
import { createRubric, createEvaluationRubric } from "@/services/api"

const createRubricSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  category: z.enum(["Contable", "No Contable"]).optional(),
});

type CreateRubricFormValues = z.infer<typeof createRubricSchema>;

interface CreateRubricFormProps {
    rubricType: 'supervision' | 'evaluation';
    onSuccess?: () => void;
}

export function CreateRubricForm({ rubricType, onSuccess }: CreateRubricFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRubricFormValues>({
    resolver: zodResolver(createRubricSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (data: CreateRubricFormValues) => {
    setIsSubmitting(true);
    try {
      if (rubricType === 'supervision') {
        if (!data.category) {
            form.setError("category", { message: "La categoría es requerida." });
            setIsSubmitting(false);
            return;
        }
        await createRubric({ nombre: data.title, categoria: data.category });
      } else {
        await createEvaluationRubric({ nombre: data.title });
      }
      
      toast.current?.show({
        severity: "success",
        summary: "Rúbrica Creada",
        detail: `La rúbrica "${data.title}" ha sido creada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al crear la rúbrica",
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
          {rubricType === 'supervision' && (
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
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Rúbrica"}
          </Button>
        </form>
      </Form>
    </>
  )
}
