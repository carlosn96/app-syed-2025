
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
import { Button } from "@/components/ui/button"
import { assignModalityToCareer } from "@/services/api"
import { useState } from "react"
import { Modality } from "@/lib/modelos"
import { Checkbox } from "./ui/checkbox"
import { ScrollArea } from "./ui/scroll-area"

const assignModalitySchema = z.object({
  id_modalidades: z.array(z.number()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una modalidad.",
  }),
});


type AssignModalityFormValues = z.infer<typeof assignModalitySchema>;

interface AssignModalityFormProps {
  careerId: number;
  availableModalities: Modality[];
  onSuccess?: () => void;
}

export function AssignModalityForm({ careerId, availableModalities, onSuccess }: AssignModalityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignModalityFormValues>({
    resolver: zodResolver(assignModalitySchema),
    defaultValues: {
      id_modalidades: [],
    },
  });

  const onSubmit = async (data: AssignModalityFormValues) => {
    setIsSubmitting(true);
    try {
      // Create an array of promises for each API call
      const assignmentPromises = data.id_modalidades.map(modalityId => 
        assignModalityToCareer({ id_carrera: careerId, id_modalidad: modalityId })
      );
      // Wait for all assignments to complete
      await Promise.all(assignmentPromises);
      
      form.reset();
      onSuccess?.();
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
            name="id_modalidades"
            render={() => (
              <FormItem>
                <FormLabel>Modalidades Disponibles</FormLabel>
                <FormDescription>
                  Selecciona las modalidades que deseas agregar a la carrera.
                </FormDescription>
                <ScrollArea className="h-48 w-full rounded-md border bg-black/10">
                  <div className="p-4">
                     {availableModalities.length > 0 ? (
                        availableModalities.map((modality) => (
                           <FormField
                            key={modality.id}
                            control={form.control}
                            name="id_modalidades"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(modality.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), modality.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== modality.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {modality.nombre}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))
                     ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">No hay más modalidades para asignar.</p>
                        </div>
                     )}
                  </div>
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || !availableModalities || availableModalities.length === 0}>
              {isSubmitting ? 'Asignando...' : 'Asignar Modalidad(es)'}
          </Button>
        </form>
      </Form>
  )
}
