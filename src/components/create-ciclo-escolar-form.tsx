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
import { Toast } from 'primereact/toast'
import { createCicloEscolar, getPeriodos } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { Periodo } from "@/lib/modelos"

const createCicloEscolarSchema = z.object({
  anio: z.string().min(1, "El año es requerido").transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 2000 && val <= 2100, {
      message: "Ingresa un año válido entre 2000 y 2100"
    }),
  id_cat_periodo: z.string().min(1, "El periodo es requerido").transform((val) => parseInt(val, 10)),
});

type CreateCicloEscolarFormValues = z.infer<typeof createCicloEscolarSchema>;

interface CreateCicloEscolarFormProps {
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function CreateCicloEscolarForm({ onSuccess }: CreateCicloEscolarFormProps) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [isLoadingPeriodos, setIsLoadingPeriodos] = useState(true);

  const form = useForm<CreateCicloEscolarFormValues>({
    resolver: zodResolver(createCicloEscolarSchema),
    defaultValues: {
      anio: "" as any,
      id_cat_periodo: "" as any,
    },
  });

  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        setIsLoadingPeriodos(true);
        const data = await getPeriodos();
        setPeriodos(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        }
      } finally {
        setIsLoadingPeriodos(false);
      }
    };
    fetchPeriodos();
  }, []);

  const onSubmit = async (data: CreateCicloEscolarFormValues) => {
    setIsSubmitting(true);
    try {
      await createCicloEscolar(data);
      const periodo = periodos.find(p => p.id === data.id_cat_periodo);
      onSuccess?.({
        summary: "Ciclo Escolar Creado",
        detail: `El ciclo escolar ${data.anio}-${periodo?.nombre || ''} ha sido creado con éxito.`,
      });
      form.reset();
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.current.show({
            severity: "error",
            summary: "Error al crear ciclo escolar",
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
            name="anio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ej. 2024" 
                    {...field}
                    min="2000"
                    max="2100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_cat_periodo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value?.toString()}
                  disabled={isLoadingPeriodos}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPeriodos ? "Cargando..." : "Selecciona un periodo"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.id} value={periodo.id.toString()}>
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting || isLoadingPeriodos}>
              {isSubmitting ? "Creando..." : "Crear Ciclo Escolar"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}