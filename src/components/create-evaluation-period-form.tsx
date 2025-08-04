
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { careers, evaluationPeriods } from "@/lib/data"
import { useState } from "react"
import { Checkbox } from "./ui/checkbox"
import { ScrollArea } from "./ui/scroll-area"

const evaluationPeriodSchema = z.object({
  name: z.string().min(1, "El nombre del periodo es requerido."),
  startDate: z.date({
    required_error: "Se requiere una fecha de inicio.",
  }),
  endDate: z.date({
    required_error: "Se requiere una fecha de fin.",
  }),
  careerNames: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Tienes que seleccionar al menos una carrera.",
  }),
}).refine(data => data.endDate >= data.startDate, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
    path: ["endDate"],
});


type EvaluationPeriodFormValues = z.infer<typeof evaluationPeriodSchema>;

const uniqueCareerNames = [...new Set(careers.map(item => item.name))];

const addEvaluationPeriod = (data: EvaluationPeriodFormValues) => {
    const newId = Math.max(...evaluationPeriods.map(p => p.id), 0) + 1;
    const newPeriod = {
        id: newId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        careers: data.careerNames,
    };
    evaluationPeriods.push(newPeriod);
    evaluationPeriods.sort((a,b) => b.startDate.getTime() - a.startDate.getTime());
    console.log("Periodo de evaluación creado:", newPeriod);
}

export function CreateEvaluationPeriodForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const { toast } = useToast()

  const form = useForm<EvaluationPeriodFormValues>({
    resolver: zodResolver(evaluationPeriodSchema),
    defaultValues: {
      name: "",
      careerNames: [],
    },
  })
  
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      form.setValue('careerNames', uniqueCareerNames);
    } else {
      form.setValue('careerNames', []);
    }
  };

  function onSubmit(data: EvaluationPeriodFormValues) {
    try {
        addEvaluationPeriod(data);
        toast({
            title: "Periodo de Evaluación Creado",
            description: `El periodo "${data.name}" ha sido agendado.`,
        });
        form.reset();
        onSuccess?.();
    } catch (error) {
         if (error instanceof Error) {
            toast({
                variant: "destructive",
                title: "Error al crear",
                description: error.message,
            });
        }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Periodo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Periodo de Evaluación 2024-A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es})
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Fin</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es})
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < (form.getValues("startDate") || new Date())}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="careerNames"
          render={() => (
             <FormItem>
              <div className="mb-4">
                <FormLabel>Carreras</FormLabel>
                <FormDescription>
                  Selecciona las carreras que participarán en este periodo de evaluación.
                </FormDescription>
              </div>
              <ScrollArea className="h-32 w-full rounded-md border bg-black/10">
                <div className="p-4 space-y-2">
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={selectAll}
                                onCheckedChange={handleSelectAll}
                            />
                        </FormControl>
                        <FormLabel className="font-bold">
                            Seleccionar Todas
                        </FormLabel>
                    </FormItem>
                    {uniqueCareerNames.map((careerName) => (
                        <FormField
                        key={careerName}
                        control={form.control}
                        name="careerNames"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={careerName}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(careerName)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value ?? []), careerName])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== careerName
                                            )
                                        )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                   {careerName}
                                </FormLabel>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Crear Periodo
        </Button>
      </form>
    </Form>
  )
}
