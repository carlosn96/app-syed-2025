
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { groups, careers, users } from "@/lib/data"
import { ScrollArea } from "./ui/scroll-area"
import { Checkbox } from "./ui/checkbox"

const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es requerido."),
  career: z.string().min(1, "Por favor, seleccione una carrera."),
  semester: z.coerce.number().min(1, "El semestre debe ser al menos 1.").max(12, "El semestre no puede ser mayor a 12."),
  studentIds: z.array(z.number()).optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

const studentUsers = users.filter(u => u.rol === 'student');

// This is a mock function, in a real app this would be an API call
const addGroup = (data: CreateGroupFormValues) => {
    const newId = Math.max(...groups.map(g => g.id), 0) + 1;
    const newGroup = {
        id: newId,
        name: data.name,
        career: data.career,
        semester: data.semester,
        students: data.studentIds || [],
    };
    groups.push(newGroup);
    
    // In a real app, you would also update the `grupo` property of the user records.
    if(data.studentIds) {
        data.studentIds.forEach(studentId => {
            const student = users.find(u => u.id === studentId);
            if(student) {
                student.grupo = data.name;
                console.log(`Asignando grupo ${data.name} a alumno ${student.nombre}`);
            }
        });
    }

    console.log("Grupo creado:", newGroup);
};

export function CreateGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      career: "",
      semester: 1,
      studentIds: [],
    },
  });

  const onSubmit = (data: CreateGroupFormValues) => {
    try {
      addGroup(data);
      toast({
        title: "Grupo Creado",
        description: `El grupo ${data.name} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear grupo",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Grupo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. COMPINCO2025A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="career"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.name}>
                      {career.name}
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
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semestre</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Alumnos</FormLabel>
                <FormDescription>
                  Selecciona los alumnos que pertenecerán a este grupo.
                </FormDescription>
              </div>
               <ScrollArea className="h-48 w-full rounded-md border">
                 <div className="p-4 space-y-2">
                    {studentUsers.map((student) => (
                        <FormField
                        key={student.id}
                        control={form.control}
                        name="studentIds"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={student.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(student.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value ?? []), student.id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== student.id
                                            )
                                        )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                   {`${student.nombre} ${student.apellido_paterno}`}
                                   <p className="text-xs text-muted-foreground">{student.correo}</p>
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

        <Button type="submit" className="w-full">Crear Grupo</Button>
      </form>
    </Form>
  )
}
