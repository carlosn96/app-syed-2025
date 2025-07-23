
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
import { supervisions, subjects, users, careers, teachers as allTeachers, Subject, User, groups, schedules, Group, Teacher } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"

const createSupervisionSchema = z.object({
  coordinatorId: z.string().min(1, "Por favor, seleccione un coordinador."),
  groupId: z.string().min(1, "Por favor, seleccione un grupo."),
  teacherId: z.string().min(1, "Por favor, seleccione un docente."),
  subjectId: z.string().min(1, "Por favor, seleccione una materia."),
  date: z.date({
    required_error: "Se requiere una fecha para la supervisión.",
  }),
});

type CreateSupervisionFormValues = z.infer<typeof createSupervisionSchema>;

const addSupervision = (data: CreateSupervisionFormValues) => {
    const newId = Math.max(...supervisions.map(s => s.id), 0) + 1;
    const teacherName = allTeachers.find(t => t.id === parseInt(data.teacherId))?.name || "N/A";
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
        groupId: parseInt(data.groupId),
    };
    supervisions.push(newSupervision);
    supervisions.sort((a,b) => a.date.getTime() - b.date.getTime());
    console.log("Supervisión creada:", newSupervision);
};

interface CreateSupervisionFormProps {
  onSuccess?: () => void;
  selectedDate?: Date;
}

// Helper to get available options based on schedules
const getAvailableOptions = (coordinatorId?: string, groupId?: string, teacherId?: string) => {
  let availableGroups: Group[] = [];
  let availableTeachers: Teacher[] = [];
  let availableSubjects: Subject[] = [];

  const coordinatorUser = users.find(u => u.id === Number(coordinatorId));
  if (coordinatorUser) {
    const coordinatorName = `${coordinatorUser.nombre} ${coordinatorUser.apellido_paterno}`.trim();
    const coordinatedCareers = careers.filter(c => c.coordinator === coordinatorName).map(c => c.name);
    availableGroups = groups.filter(g => coordinatedCareers.includes(g.career));
  }

  if (groupId) {
      const scheduledTeachers = schedules
          .filter(s => s.groupId === Number(groupId))
          .map(s => s.teacherId);
      availableTeachers = allTeachers.filter(t => scheduledTeachers.includes(t.id));
  }

  if (groupId && teacherId) {
      const scheduledSubjects = schedules
          .filter(s => s.groupId === Number(groupId) && s.teacherId === Number(teacherId))
          .map(s => s.subjectId);
      availableSubjects = subjects.filter(s => scheduledSubjects.includes(s.id));
  }

  return { availableGroups, availableTeachers, availableSubjects };
};


export function CreateSupervisionForm({ onSuccess, selectedDate }: CreateSupervisionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  
  const coordinators = useMemo(() => users.filter(u => u.rol === 'coordinator'), []);
  const defaultCoordinator = user?.rol === 'coordinator' ? String(user.id) : "";

  const form = useForm<CreateSupervisionFormValues>({
    resolver: zodResolver(createSupervisionSchema),
    defaultValues: {
      coordinatorId: defaultCoordinator,
      groupId: "",
      teacherId: "",
      subjectId: "",
      date: selectedDate,
    }
  });
  
  useEffect(() => {
    if (selectedDate) {
        form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);

  const selectedCoordinatorId = form.watch("coordinatorId");
  const selectedGroupId = form.watch("groupId");
  const selectedTeacherId = form.watch("teacherId");
  
  useEffect(() => {
    form.resetField("groupId", { defaultValue: "" });
    form.resetField("teacherId", { defaultValue: "" });
    form.resetField("subjectId", { defaultValue: "" });
    
    const { availableGroups } = getAvailableOptions(selectedCoordinatorId);
    setAvailableGroups(availableGroups);
    setAvailableTeachers([]);
    setAvailableSubjects([]);
  }, [selectedCoordinatorId, form]);

  useEffect(() => {
    form.resetField("teacherId", { defaultValue: "" });
    form.resetField("subjectId", { defaultValue: "" });
    
    const { availableTeachers } = getAvailableOptions(selectedCoordinatorId, selectedGroupId);
    setAvailableTeachers(availableTeachers);
    setAvailableSubjects([]);
  }, [selectedCoordinatorId, selectedGroupId, form]);

  useEffect(() => {
    form.resetField("subjectId", { defaultValue: "" });
    
    const { availableSubjects } = getAvailableOptions(selectedCoordinatorId, selectedGroupId, selectedTeacherId);
    setAvailableSubjects(availableSubjects);
  }, [selectedCoordinatorId, selectedGroupId, selectedTeacherId, form]);


  const onSubmit = (data: CreateSupervisionFormValues) => {
    try {
      addSupervision(data);
      toast({
        title: "Supervisión Agendada",
        description: `La supervisión para el ${format(data.date, "PPP", { locale: es })} ha sido agendada.`,
      });
      form.reset({ coordinatorId: defaultCoordinator, groupId: "", teacherId: "", subjectId: "" });
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
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedCoordinatorId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un grupo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableGroups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name}
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
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente a Evaluar</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedGroupId}
              >
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
