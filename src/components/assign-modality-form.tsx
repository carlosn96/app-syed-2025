
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
  FormDescription
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { assignModalityToCareer } from "@/services/api"
import { useState } from "react"
import { Modality } from "@/lib/modelos"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { ScrollArea } from "./ui/scroll-area"

const assignModalitySchema = z.object({
  id_modalidad: z.coerce.number({
      required_error: "Debes seleccionar una modalidad."
  }).min(1, "Debes seleccionar una modalidad."),
});


type AssignModalityFormValues = z.infer<typeof assignModalitySchema>;

interface AssignModalityFormProps {
  careerId: number;
  availableModalities: Modality[];
  onSuccess?: (modalityName: string) => void;
}

export function AssignModalityForm({ careerId, availableModalities, onSuccess }: AssignModalityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignModalityFormValues>({
    resolver: zodResolver(assignModalitySchema),
  });

  const onSubmit = async (data: AssignModalityFormValues) => {
    setIsSubmitting(true);
    try {
      await assignModalityToCareer({ id_carrera: careerId, id_modalidad: data.id_modalidad });
      const selectedModality = availableModalities.find(m => m.id === data.id_modalidad);
      form.reset();
      onSuccess?.(selectedModality?.nombre || '');
    } catch (error) {
      // Error handling is done in the parent component via toast
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
            control={form.control}
            name="id_modalidad"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Modalidades Disponibles</FormLabel>
                <FormDescription>
                    Selecciona la modalidad que deseas agregar a la carrera.
                </FormDescription>
                <FormControl>
                    <RadioGroup
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                        className="flex flex-col space-y-1"
                    >
                        <ScrollArea className="h-48 w-full rounded-md border bg-black/10">
                            <div className="p-4 space-y-2">
                                {availableModalities.length > 0 ? (
                                    availableModalities.map((modality) => (
                                        <FormItem key={modality.id} className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={String(modality.id)} />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {modality.nombre}
                                            </FormLabel>
                                        </FormItem>
                                    ))
                                ) : (
                                     <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-muted-foreground">No hay más modalidades para asignar.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || !availableModalities || availableModalities.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Modalidad'}
          </Button>
        </form>
      </Form>
  )
}
