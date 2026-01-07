
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
import toast from 'react-hot-toast';
import { Teacher, User, Career, Group, Schedule } from "@/lib/modelos"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { getCareers, getSchedules, getUsers, getGroups, createSupervision } from "@/services/api"

const createSupervisionSchema = z.object({
  coordinatorId: z.string().min(1, "Por favor, seleccione un coordinador."),
  teacherId: z.string().min(1, "Por favor, seleccione un docente."),
  careerName: z.string().min(1, "La carrera es requerida."),
  date: z.date({
    required_error: "Se requiere una fecha para la supervisión.",
  }),
  startTime: z.string().min(1, "La hora de inicio es requerida."),
  endTime: z.string().min(1, "La hora de fin es requerida."),
});

type CreateSupervisionFormValues = z.infer<typeof createSupervisionSchema>;

interface CreateSupervisionFormProps {
  onSuccess?: () => void;
}


const timeOptions = Array.from({ length: 15 }, (_, i) => {
    const hour = 7 + i;
    return `${String(hour).padStart(2, '0')}:00`;
});


export function CreateSupervisionForm({ onSuccess }: CreateSupervisionFormProps) {
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [teacherCareers, setTeacherCareers] = useState<Record<string, string>>({});
  
  const coordinators = useMemo(() => allUsers.filter(u => u.rol === 'coordinador'), [allUsers]);
  const defaultCoordinator = user?.rol === 'coordinador' ? String(user.id) : "";

  useEffect(() => {
    const fetchData = async () => {
        const [users, schedules, groups] = await Promise.all([
            getUsers(),
            getSchedules(),
            getGroups()
        ]);
        setAllUsers(users);
        setAllSchedules(schedules);
        setAllGroups(groups);
    }
    fetchData();
  }, []);

  const getAvailableOptions = (coordinatorId?: string) => {
    let availableTeachers: Teacher[] = [];
    const teacherCareers: Record<string, string> = {};

    const coordinatorUser = allUsers.find(u => u.id === Number(coordinatorId));
    if (coordinatorUser) {
        const coordinatorName = `${coordinatorUser.nombre} ${coordinatorUser.apellido_paterno}`.trim();
        const coordinatedCareers = allCareers.filter(c => c.coordinator === coordinatorName).map(c => c.name);
        
        const teacherIdsInCoordinatedCareers = new Set<number>();
        

        availableTeachers = allTeachers.filter(t => teacherIdsInCoordinatedCareers.has(t.id));

        availableTeachers.forEach(teacher => {
            const teacherSchedules = allSchedules.filter(s => s.teacherId === teacher.id);
            const teacherGroupIds = [...new Set(teacherSchedules.map(s => s.groupId))];
            const teacherGroups = allGroups.filter(g => teacherGroupIds.includes(g.id_grupo));
            const teacherCareerName = "N/A";
            teacherCareers[String(teacher.id)] = teacherCareerName;
        });
    }

    return { availableTeachers, teacherCareers };
  };

  const form = useForm<CreateSupervisionFormValues>({
    resolver: zodResolver(createSupervisionSchema),
    defaultValues: {
      coordinatorId: defaultCoordinator,
      teacherId: "",
      careerName: "",
      date: undefined,
      startTime: "",
      endTime: "",
    }
  });

  const selectedCoordinatorId = form.watch("coordinatorId");
  const selectedTeacherId = form.watch("teacherId");
  
  useEffect(() => {
    form.resetField("teacherId", { defaultValue: "" });
    form.resetField("careerName", { defaultValue: "" });
    form.resetField("date");
    
    const { availableTeachers, teacherCareers } = getAvailableOptions(selectedCoordinatorId);
    setAvailableTeachers(availableTeachers);
    setTeacherCareers(teacherCareers);
  }, [selectedCoordinatorId, form, allUsers, allCareers, allSchedules, allTeachers, allGroups]);

  useEffect(() => {
    if (selectedTeacherId && teacherCareers[selectedTeacherId]) {
      form.setValue("careerName", teacherCareers[selectedTeacherId]);
    } else {
      form.resetField("careerName");
    }
  }, [selectedTeacherId, teacherCareers, form]);


  const onSubmit = async (data: CreateSupervisionFormValues) => {
    setIsSubmitting(true);
    const teacher = allTeachers.find(t => t.id === parseInt(data.teacherId));
    const coordinator = allUsers.find(u => u.id === parseInt(data.coordinatorId));
    
    const submissionData = {
      teacher: teacher?.name,
      career: data.careerName,
      coordinator: coordinator ? `${coordinator.nombre} ${coordinator.apellido_paterno}`.trim() : "N/A",
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "Programada",
    }

    try {
      await createSupervision(submissionData);
      toast.success(`La supervisión para el ${format(data.date, "PPP", { locale: es })} ha sido agendada.`);
      form.reset({ coordinatorId: defaultCoordinator, teacherId: "", careerName: "", date: undefined, startTime: "", endTime: "" });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {user?.rol !== 'coordinador' && (
            <FormField
            control={form.control}
            name="coordinatorId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Coordinador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={user?.rol === 'coordinador'}>
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
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente a Evaluar</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedCoordinatorId || availableTeachers.length === 0}
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
            name="careerName"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <FormControl>
                        <Input {...field} disabled />
                    </FormControl>
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
                      disabled={!selectedTeacherId}
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
                        return date < today;
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
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Hora de Inicio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('date')}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Inicio" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {timeOptions.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('startTime')}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Fin" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                             {timeOptions.filter(t => t > form.getValues('startTime')).map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Agendando...' : 'Agendar Cita'}
        </Button>
      </form>
    </Form>
    </>
  )
}

    