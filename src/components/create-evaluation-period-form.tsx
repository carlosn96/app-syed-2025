
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import React, { useState, useEffect, useMemo } from "react"
import { DateRange } from "react-day-picker"

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
import { evaluationPeriods, groups, subjects, users, careers, teachers as allTeachers, Subject } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"
import { Input } from "./ui/input"

const createEvaluationPeriodSchema = z.object({
  groupId: z.string().min(1, "Por favor, seleccione un grupo."),
  subjectId: z.string().min(1, "Por favor, seleccione una materia."),
  teacher: z.string().min(1, "El docente es requerido."),
  dateRange: z.object({
    from: z.date({ required_error: "Se requiere una fecha de inicio." }),
    to: z.date({ required_error: "Se requiere una fecha de fin." }),
  }),
});

type CreateEvaluationPeriodFormValues = z.infer<typeof createEvaluationPeriodSchema>;

const addEvaluationPeriod = (data: CreateEvaluationPeriodFormValues) => {
    const newId = Math.max(...evaluationPeriods.map(s => s.id), 0) + 1;
    const groupName = groups.find(g => g.id === parseInt(data.groupId))?.name || "N/A";
    const subjectName = subjects.find(s => s.id === parseInt(data.subjectId))?.name || "N/A";
    
    const newEvaluationPeriod = {
        id: newId,
        group: groupName,
        subject: subjectName,
        teacher: data.teacher,
        startDate: data.dateRange.from,
        endDate: data.dateRange.to,
    };
    evaluationPeriods.push(newEvaluationPeriod);
    evaluationPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    console.log("Período de evaluación creado:", newEvaluationPeriod);
};

export function CreateEvaluationPeriodForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  const form = useForm<CreateEvaluationPeriodFormValues>({
    resolver: zodResolver(createEvaluationPeriodSchema),
    defaultValues: {
      groupId: "",
      subjectId: "",
      teacher: "",
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
    }
  });

  const selectedGroupId = form.watch("groupId");
  const selectedSubjectId = form.watch("subjectId");

  const availableGroups = useMemo(() => {
    if (user?.rol === 'coordinator') {
        const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
        const coordinatedCareers = careers
            .filter(career => career.coordinator === coordinatorName)
            .map(career => career.name);
        return groups.filter(group => coordinatedCareers.includes(group.career));
    }
    return groups;
  }, [user]);

  useEffect(() => {
    form.resetField("subjectId", { defaultValue: "" });
    setSelectedTeacher("");
    if (selectedGroupId) {
      const group = groups.find(g => g.id === parseInt(selectedGroupId));
      if (group) {
        const filteredSubjects = subjects.filter(subject => subject.career === group.career && subject.semester === group.semester);
        setAvailableSubjects(filteredSubjects);
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedGroupId, form]);
  
  useEffect(() => {
    if (selectedSubjectId) {
        const subject = availableSubjects.find(s => s.id === parseInt(selectedSubjectId));
        const teacherName = subject ? subject.teacher : "";
        setSelectedTeacher(teacherName);
        form.setValue("teacher", teacherName);
    } else {
        setSelectedTeacher("");
        form.setValue("teacher", "");
    }
  }, [selectedSubjectId, availableSubjects, form]);


  const onSubmit = (data: CreateEvaluationPeriodFormValues) => {
    try {
      addEvaluationPeriod(data);
      toast({
        title: "Período de Evaluación Programado",
        description: `El período ha sido programado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al programar",
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
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un grupo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableGroups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name} ({group.career})
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
                disabled={!selectedGroupId}
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

        {selectedTeacher && (
             <FormItem>
              <FormLabel>Docente</FormLabel>
              <FormControl>
                <Input value={selectedTeacher} readOnly disabled />
              </FormControl>
            </FormItem>
        )}
       
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Período de Evaluación</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y", { locale: es })} -{" "}
                            {format(field.value.to, "LLL dd, y", { locale: es })}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Seleccione un rango</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value.from}
                    selected={{ from: field.value.from, to: field.value.to }}
                    onSelect={field.onChange}
                    numberOfMonths={1}
                    locale={es}
                     disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                  />
                </PopoverContent>
              </Popover>
               <FormDescription>
                Los alumnos de este grupo podrán evaluar durante este período.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Programar Período</Button>
      </form>
    </Form>
  )
}
