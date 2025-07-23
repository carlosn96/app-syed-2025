
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFormStatus } from "react-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { teachers } from "@/lib/data"
import { submitEvaluation } from "@/app/(app)/evaluation/actions"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import React, { useActionState } from "react"

const evaluationFormSchema = z.object({
  teacherId: z.string({ required_error: "Por favor, seleccione un docente." }),
  clarity: z.string({ required_error: "Por favor, califique la claridad." }),
  engagement: z.string({ required_error: "Por favor, califique el compromiso." }),
  punctuality: z.string({ required_error: "Por favor, califique la puntualidad." }),
  evaluationText: z
    .string()
    .min(10, { message: "Los comentarios deben tener al menos 10 caracteres." })
    .max(500, { message: "Los comentarios no deben exceder los 500 caracteres." }),
})

type EvaluationFormValues = z.infer<typeof evaluationFormSchema>

const initialState = {
  message: "",
  isFlagged: false,
  flaggingReasons: [],
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        "Enviar Evaluación"
      )}
    </Button>
  )
}

export function EvaluationForm() {
  const [state, formAction] = useActionState(submitEvaluation, initialState)
  const { toast } = useToast()

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      evaluationText: "",
    },
  })
  
  React.useEffect(() => {
    if (state.isSuccess) {
      toast({
        title: "Evaluación Enviada",
        description: "¡Gracias por tus comentarios!",
        action: <CheckCircle2 className="text-green-500" />,
      })
      form.reset();
    }
  }, [state.isSuccess, toast, form])


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un docente a evaluar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['claridad', 'compromiso', 'puntualidad'].map(criterion => (
                 <FormField
                    key={criterion}
                    control={form.control}
                    name={criterion as keyof EvaluationFormValues}
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="capitalize">{criterion}</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-2"
                                >
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <FormItem key={value} className="flex items-center space-x-1 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={String(value)} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{value}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
            ))}
        </div>

        <FormField
          control={form.control}
          name="evaluationText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Proporcione comentarios detallados sobre el desempeño del docente..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tus comentarios serán revisados. Por favor, sé respetuoso y constructivo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.isFlagged && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Contenido Marcado para Revisión</AlertTitle>
            <AlertDescription>
              Tu envío no pudo ser aceptado porque fue marcado por las siguientes razones:
              <ul className="list-disc pl-5 mt-2">
                {state.flaggingReasons?.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
              Por favor, revisa tus comentarios para que sean más constructivos.
            </AlertDescription>
          </Alert>
        )}

        <SubmitButton />
      </form>
    </Form>
  )
}
