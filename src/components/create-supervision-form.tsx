
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import React, { useState, useEffect, useMemo } from "react"

import {
  Form,
  FormControl,
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
import { supervisions, subjects, users, careers, teachers, Subject } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"

const createSupervisionSchema = z.object({
  teacherId: z.string().min(1, "Por favor, seleccione un docente."),
  subjectId: z.string().min(1, "Por favor, seleccione una materia."),
  coordinatorId: z.string().min(1, "Por favor, seleccione un coordinador."),
  date: z.date({
    required_error: "Se requiere una fecha para la supervisión.",
  }),
});

type CreateSupervisionFormValues = z.infer<typeof createSupervisionSchema>;

const addSupervision = (data: CreateSupervisionFormValues) => {
    const newId = Math.max(...supervisions.map(s => s.id), 0) + 1;
    const teacherName = teachers.find(t => t.id === parseInt(data.teacherId))?.name || "N/A";
    const subjectName = subjects.find(s => s.id === parseInt(data.subjectId))?.name || "N/A";
    const coordinator = users.find(u => u.id === parseInt(data.coordinatorId));
    const coordinatorName = coordinator ? `${coordinator.nombre} ${coordinator.apellido_paterno}`.trim() : "N/A";
    
    const newSupervision = {
        id: newId,
        teacher: teacherName,
        subject: subjectName,
        coordinator: coordinatorName,
        date: data.date,
        status: "Programada",
    };
    supervisions.push(newSupervision);
    supervisions.sort((a,b) => a.date.getTime() - b.date.getTime());
    console.log("Supervisión creada:", newSupervision);
};

export function CreateSupervisionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  const defaultCoordinator = user?.rol === 'coordinator' ? String(user.id) : "";

  const form = useForm<CreateSupervisionFormValues>({
    resolver: zodResolver(createSupervisionSchema),
    defaultValues: {
      teacherId: "",
      subjectId: "",
      coordinatorId: defaultCoordinator,
    }
  });

  const selectedTeacherId = form.watch("teacherId");
  
  const coordinators = useMemo(() => users.filter(u => u.rol === 'coordinator'), []);
  
  const availableTeachers = useMemo(() => {
    if (user?.rol === 'coordinator') {
      const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
      const coordinatedCareers = careers
        .filter(career => career.coordinator === coordinatorName)
        .map(career => career.name);
      
      const relevantSubjects = subjects.filter(subject => coordinatedCareers.includes(subject.career));
      const teacherNames = [...new Set(relevantSubjects.map(subject => subject.teacher))];
      return teachers.filter(teacher => teacherNames.includes(teacher.name));
    }
    return teachers;
  }, [user]);

  useEffect(() => {
    form.resetField("subjectId", { defaultValue: "" });
    if (selectedTeacherId) {
      const teacherName = teachers.find(t => t.id === parseInt(selectedTeacherId))?.name;
      if (teacherName) {
        setAvailableSubjects(subjects.filter(s => s.teacher === teacherName));
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedTeacherId, form]);

  const onSubmit = (data: CreateSupervisionFormValues) => {
    try {
      addSupervision(data);
      toast({
        title: "Supervisión Agendada",
        description: `La supervisión para el ${format(data.date, "PPP", { locale: es })} ha sido agendada.`,
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
        <FormField
          control={form.control}
          name="teacherId"
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
                  {availableTeachers.map((teacher) => (
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
        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materia</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedTeacherId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una materia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
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
          name="coordinatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={user?.rol === 'coordinator'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un coordinador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {coordinators.map((coordinator) => (
                    <SelectItem key={coordinator.id} value={String(coordinator.id)}>
                      {`${coordinator.nombre} ${coordinator.apellido_paterno}`}
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
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0,0,0,0))
                    }
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Agendar Supervisión</Button>
      </form>
    </Form>
  )
}
