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
import toast from 'react-hot-toast';
import { updateCicloEscolar, getPeriodos } from "@/services/api"
import { useState, useRef, useEffect } from "react"
import { CicloEscolar, Periodo } from "@/lib/modelos"

const editCicloEscolarSchema = z.object({
  anio: z.string().min(1, "El año es requerido").transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 2000 && val <= 2100, {
      message: "Ingresa un año válido entre 2000 y 2100"
    }),
  id_cat_periodo: z.string().min(1, "El periodo es requerido").transform((val) => parseInt(val, 10)),
});

type EditCicloEscolarFormValues = z.infer<typeof editCicloEscolarSchema>;

interface EditCicloEscolarFormProps {
  ciclo: CicloEscolar;
  onSuccess?: (message: { summary: string, detail: string }) => void;
}

export function EditCicloEscolarForm({ ciclo, onSuccess }: EditCicloEscolarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [isLoadingPeriodos, setIsLoadingPeriodos] = useState(true);

  const form = useForm<EditCicloEscolarFormValues>({
    resolver: zodResolver(editCicloEscolarSchema),
    defaultValues: {
      anio: ciclo.anio.toString() as any,
      id_cat_periodo: ciclo.id_cat_periodo.toString() as any,
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
          toast.error(error.message);
        }
      } finally {
        setIsLoadingPeriodos(false);
      }
    };
    fetchPeriodos();
  }, []);

  useEffect(() => {
    form.reset({
      anio: ciclo.anio.toString() as any,
      id_cat_periodo: ciclo.id_cat_periodo.toString() as any,
    });
  }, [ciclo, form]);

  const onSubmit = async (data: EditCicloEscolarFormValues) => {
    setIsSubmitting(true);
    try {
      await updateCicloEscolar(ciclo.id_ciclo, data);
      const periodo = periodos.find(p => p.id === data.id_cat_periodo);
      onSuccess?.({
        summary: "Ciclo Escolar Actualizado",
        detail: `El ciclo escolar ${data.anio}-${periodo?.nombre || ''} ha sido actualizado con éxito.`,
      });
    } catch (error) {
      if (error instanceof Error && toast.current) {
        toast.error(error.message);
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
            {isSubmitting ? "Actualizando..." : "Actualizar Ciclo Escolar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}