
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { careers } from "@/lib/data"
import { useState } from "react"
import { Checkbox } from "./ui/checkbox"

const evaluationPeriodSchema = z.object({
  name: z.string().min(1, "El nombre del periodo es requerido."),
  startDate: z.date({
    required_error: "Se requiere una fecha de inicio.",
  }),
  endDate: z.date({
    required_error: "Se requiere una fecha de fin.",
  }),
  careerIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una carrera.",
  }),
})

type EvaluationPeriodFormValues = z.infer<typeof evaluationPeriodSchema>

const uniqueCareers = [...new Map(careers.map(item => [item['name'], item])).values()];

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
      careerIds: [],
    },
  })
  
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      form.setValue('careerIds', uniqueCareers.map(c => String(c.id)));
    } else {
      form.setValue('careerIds', []);
    }
  };

  function onSubmit(data: EvaluationPeriodFormValues) {
    console.log(data)
    toast({
      title: "Periodo de Evaluación Creado",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <Button type="submit" className="w-full">
          Crear Periodo
        </Button>
      </form>
    </Form>
  )
}

    