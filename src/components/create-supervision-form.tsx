
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supervisions, teachers, subjects, users } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"

const createSupervisionSchema = z.object({
  teacher: z.string().min(1, "Por favor, seleccione un docente."),
  subject: z.string().min(1, "Por favor, seleccione una materia."),
  date: z.date({
    required_error: "Se requiere una fecha para la supervisión.",
  }),
  coordinator: z.string().min(1, "Por favor, seleccione un coordinador."),
});

type CreateSupervisionFormValues = z.infer<typeof createSupervisionSchema>;

const coordinators = users.filter(u => u.rol === 'coordinator');

// This is a mock function, in a real app this would be an API call
const addSupervision = (data: CreateSupervisionFormValues) => {
    const newId = Math.max(...supervisions.map(s => s.id), 0) + 1;
    const newSupervision = {
        id: newId,
        date: data.date,
        teacher: data.teacher,
        subject: data.subject,
        coordinator: data.coordinator,
    };
    supervisions.push(newSupervision);
    supervisions.sort((a, b) => a.date.getTime() - b.date.getTime()); // Keep it sorted
    console.log("Supervisión creada:", newSupervision);
};

export function CreateSupervisionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CreateSupervisionFormValues>({
    resolver: zodResolver(createSupervisionSchema),
    defaultValues: {
        coordinator: user?.rol !== 'administrator' ? `${user?.nombre} ${user?.apellido_paterno}`.trim() : "",
    }
  });

  const onSubmit = (data: CreateSupervisionFormValues) => {
    try {
      addSupervision(data);
      toast({
        title: "Supervisión Agendada",
        description: `La supervisión para ${data.teacher} ha sido agendada con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al agendar",
            description: error.message,
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {user?.rol === 'administrator' && (
             <FormField
                control={form.control}
                name="coordinator"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coordinador</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un coordinador" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {coordinators.map((coordinator) => (
                            <SelectItem key={coordinator.id} value={`${coordinator.nombre} ${coordinator.apellido_paterno}`.trim()}>
                                {`${coordinator.nombre} ${coordinator.apellido_paterno}`}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente a Evaluar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un docente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materia</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una materia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Supervisión</FormLabel>
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
                        format(field.value, "PPP", { locale: es })
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
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                El docente será notificado de la fecha agendada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Agendar Supervisión</Button>
      </form>
    </Form>
  )
}
