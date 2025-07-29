
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
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { groups } from "@/lib/data"
import { useMemo } from "react"

const createUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  apellido_paterno: z.string().min(1, "El apellido paterno es requerido."),
  apellido_materno: z.string().min(1, "El apellido materno es requerido."),
  correo: z.string().email("Correo electrónico inválido."),
  rol: z.enum(["coordinator", "teacher", "student"], {
    required_error: "Por favor, seleccione un rol.",
  }),
  grupo: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
}).refine(data => data.rol !== 'student' || (data.rol === 'student' && data.grupo), {
    message: "Por favor, seleccione un grupo para el alumno.",
    path: ["grupo"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const baseRoleDisplayMap = {
  coordinator: "Coordinador",
  teacher: "Docente",
  student: "Alumno",
};

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addUser, user: loggedInUser } = useAuth();
  const { toast } = useToast();

  const roleDisplayMap = useMemo(() => {
    if (loggedInUser?.rol === 'coordinator') {
      const { coordinator, ...rest } = baseRoleDisplayMap;
      return rest;
    }
    return baseRoleDisplayMap;
  }, [loggedInUser]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const selectedRole = form.watch("rol");

  const onSubmit = (data: CreateUserFormValues) => {
    try {
      addUser(data);
      toast({
        title: "Usuario Creado",
        description: `El usuario ${data.nombre} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al crear usuario",
            description: error.message,
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="apellido_paterno"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Apellido Paterno</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="apellido_materno"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                    <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(roleDisplayMap).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         {selectedRole === 'student' && (
          <FormField
            control={form.control}
            name="grupo"
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
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        {group.name}
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Usuario</Button>
      </form>
    </Form>
  )
}
