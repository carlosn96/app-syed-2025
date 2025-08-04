
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
import { supervisions, subjects, users, careers, teachers as allTeachers, Subject, User, groups, schedules, Group, Teacher, Schedule } from "@/lib/data"
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
    
    const scheduleEntry = schedules.find(s => 
        s.groupId === parseInt(data.groupId) &&
        s.teacherId === parseInt(data.teacherId) &&
        s.subjectId === parseInt(data.subjectId)
    );

    const newSupervision = {
        id: newId,
        teacher: teacherName,
        subject: subjectName,
        coordinator: coordinatorName,
        date: data.date,
        status: "Programada",
        groupId: parseInt(data.groupId),
        startTime: scheduleEntry?.startTime || "00:00",
        endTime: scheduleEntry?.endTime || "00:00",
    };
    supervisions.push(newSupervision);
    supervisions.sort((a,b) => a.date.getTime() - b.date.getTime());
    console.log("Supervisión creada:", newSupervision);
};

interface CreateSupervisionFormProps {
  onSuccess?: () => void;
}

const dayMapping: { [key: string]: number } = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
};

// Helper to get available options based on schedules
const getAvailableOptions = (coordinatorId?: string, groupId?: string, teacherId?: string, subjectId?: string) => {
  let availableGroups: Group[] = [];
  let availableTeachers: Teacher[] = [];
  let availableSubjects: Subject[] = [];
  let scheduledDay: number | null = null;

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
      const uniqueTeacherIds = [...new Set(scheduledTeachers)];
      availableTeachers = allTeachers.filter(t => uniqueTeacherIds.includes(t.id));
  }

  if (groupId && teacherId) {
      const scheduledSubjects = schedules
          .filter(s => s.groupId === Number(groupId) && s.teacherId === Number(teacherId))
          .map(s => s.subjectId);
      const uniqueSubjectIds = [...new Set(scheduledSubjects)];
      availableSubjects = subjects.filter(s => uniqueSubjectIds.includes(s.id));
  }

  if (groupId && teacherId && subjectId) {
      const schedule = schedules.find(s => 
          s.groupId === Number(groupId) && 
          s.teacherId === Number(teacherId) && 
          s.subjectId === Number(subjectId)
      );
      if (schedule) {
          scheduledDay = dayMapping[schedule.dayOfWeek];
      }
  }

  return { availableGroups, availableTeachers, availableSubjects, scheduledDay };
};


export function CreateSupervisionForm({ onSuccess }: CreateSupervisionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [scheduledDay, setScheduledDay] = useState<number | null>(null);
  
  const coordinators = useMemo(() => users.filter(u => u.rol === 'coordinator'), []);
  const defaultCoordinator = user?.rol === 'coordinator' ? String(user.id) : "";

  const form = useForm<CreateSupervisionFormValues>({
    resolver: zodResolver(createSupervisionSchema),
    defaultValues: {
      coordinatorId: defaultCoordinator,
      groupId: "",
      teacherId: "",
      subjectId: "",
      date: undefined,
    }
  });

  const selectedCoordinatorId = form.watch("coordinatorId");
  const selectedGroupId = form.watch("groupId");
  const selectedTeacherId = form.watch("teacherId");
  const selectedSubjectId = form.watch("subjectId");
  
  useEffect(() => {
    form.resetField("groupId", { defaultValue: "" });
    form.resetField("teacherId", { defaultValue: "" });
    form.resetField("subjectId", { defaultValue: "" });
    form.resetField("date");
    
    const { availableGroups } = getAvailableOptions(selectedCoordinatorId);
    setAvailableGroups(availableGroups);
    setAvailableTeachers([]);
    setAvailableSubjects([]);
    setScheduledDay(null);
  }, [selectedCoordinatorId, form]);

  useEffect(() => {
    form.resetField("teacherId", { defaultValue: "" });
    form.resetField("subjectId", { defaultValue: "" });
    form.resetField("date");
    
    const { availableTeachers } = getAvailableOptions(selectedCoordinatorId, selectedGroupId);
    setAvailableTeachers(availableTeachers);
    setAvailableSubjects([]);
    setScheduledDay(null);
  }, [selectedCoordinatorId, selectedGroupId, form]);

  useEffect(() => {
    form.resetField("subjectId", { defaultValue: "" });
    form.resetField("date");

    const { availableSubjects } = getAvailableOptions(selectedCoordinatorId, selectedGroupId, selectedTeacherId);
    setAvailableSubjects(availableSubjects);
    setScheduledDay(null);
  }, [selectedCoordinatorId, selectedGroupId, selectedTeacherId, form]);

  useEffect(() => {
    form.resetField("date");

    const { scheduledDay } = getAvailableOptions(selectedCoordinatorId, selectedGroupId, selectedTeacherId, selectedSubjectId);
    setScheduledDay(scheduledDay);
  }, [selectedCoordinatorId, selectedGroupId, selectedTeacherId, selectedSubjectId, form]);


  const onSubmit = (data: CreateSupervisionFormValues) => {
    try {
      addSupervision(data);
      toast({
        title: "Cita Agendada",
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
        {user?.rol !== 'coordinator' && (
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
        )}
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedCoordinatorId || availableGroups.length === 0}
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
                disabled={!selectedGroupId || availableTeachers.length === 0}
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
                disabled={!selectedTeacherId || availableSubjects.length === 0}
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
                      disabled={!selectedSubjectId || scheduledDay === null}
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
                    disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        if (date < today) return true;
                        if (scheduledDay !== null && date.getDay() !== scheduledDay) return true;
                        return false;
                    }}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Agendar Cita</Button>
      </form>
    </Form>
  )
}
