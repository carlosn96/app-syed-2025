
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
import { useMemo, useState, useEffect } from "react"
import { CareerSummary } from "@/lib/modelos"
import { createUser, getCareers } from "@/services/api"

const createUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  apellido_paterno: z.string().min(1, "El apellido paterno es requerido."),
  apellido_materno: z.string().min(1, "El apellido materno es requerido."),
  correo: z.string().email("El correo electrónico no es válido."),
  grado_academico: z.string().optional(),
  matricula: z.string().optional(),
  id_carrera: z.coerce.number().optional(),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  contrasena_confirmation: z.string(),
}).refine(data => data.contrasena === data.contrasena_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["contrasena_confirmation"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const roleDisplayMap: Record<string, string> = {
  coordinador: "Coordinador",
  docente: "Docente",
  alumno: "Alumno",
};

const roleRouteMap: Record<"coordinador" | "docente" | "alumno", string> = {
  coordinador: "/coordinadores",
  docente: "/docentes",
  alumno: "/alumnos",
};


export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user: loggedInUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [selectedRole, setSelectedRole] = useState<"coordinador" | "docente" | "alumno">("docente");

  useEffect(() => {
    const fetchCareers = async () => {
        try {
            const careersData = await getCareers();
            setCareers(careersData);
        } catch (error) {
            console.error("Failed to fetch careers", error);
            toast({
                variant: "destructive",
                title: "Error al cargar carreras",
                description: "No se pudieron obtener las carreras para el formulario."
            })
        }
    };
    fetchCareers();
  }, [toast]);

  const roleDisplayFiltered = useMemo(() => {
    if (loggedInUser?.rol === 'coordinador') {
      const { coordinador, ...rest } = roleDisplayMap;
      return rest;
    }
    return roleDisplayMap;
  }, [loggedInUser]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      contrasena: "",
      contrasena_confirmation: "",
      grado_academico: "",
      matricula: "",
    },
  });
  
  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);

    if (selectedRole === "alumno") {
        if (!data.matricula) {
            form.setError("matricula", { type: "manual", message: "La matrícula es requerida para los alumnos." });
            setIsSubmitting(false);
            return;
        }
        if (!data.id_carrera) {
            form.setError("id_carrera", { type: "manual", message: "La carrera es requerida para los alumnos." });
            setIsSubmitting(false);
            return;
        }
    }
    if (selectedRole === "docente" && !data.grado_academico) {
        form.setError("grado_academico", { type: "manual", message: "El grado académico es requerido para los docentes." });
        setIsSubmitting(false);
        return;
    }

    try {
      const endpoint = roleRouteMap[selectedRole];
      await createUser(data, endpoint);
      toast({
        variant: "success",
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
    } finally {
        setIsSubmitting(false);
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
                <Input placeholder="usuario@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Rol</FormLabel>
            <Select onValueChange={(value) => setSelectedRole(value as any)} defaultValue={selectedRole}>
            <FormControl>
                <SelectTrigger>
                <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {Object.entries(roleDisplayFiltered).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                    {label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
            <FormMessage />
        </FormItem>

         {selectedRole === "alumno" && (
          <>
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_carrera"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una carrera" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {careers.map((career) => (
                        <SelectItem key={career.id} value={String(career.id)}>
                          {career.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {selectedRole === "docente" && (
            <FormField
            control={form.control}
            name="grado_academico"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Grado Académico</FormLabel>
                <FormControl>
                    <Input placeholder="Ej. Maestría en Educación" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
         <FormField
          control={form.control}
          name="contrasena"
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
          name="contrasena_confirmation"
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  )
}
