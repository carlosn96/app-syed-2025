
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
import { useAuth } from "@/context/auth-context"
import { Toast } from 'primereact/toast';
import { useMemo, useState, useEffect, useRef } from "react"
import { CareerSummary } from "@/lib/modelos"
import { createUser, getCareers } from "@/services/api"
import { Roles } from "@/lib/modelos";


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

type Role = "administrador" | "coordinador" | "docente" | "alumno";

const roleDisplayMap: Record<Role, string> = {
  administrador: "Administrador",
  coordinador: "Coordinador",
  docente: "Docente",
  alumno: "Alumno",
};

const roleRouteMap: Record<"coordinador" | "docente" | "alumno", string> = {
    coordinador: "/coordinadores",
    docente: "/docentes",
    alumno: "/alumnos",
};


interface CreateUserFormProps {
  onSuccess?: () => void;
  defaultRole?: Role;
}

export function CreateUserForm({ onSuccess, defaultRole }: CreateUserFormProps) {
  const { user: loggedInUser } = useAuth();
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole || "docente");

  useEffect(() => {
    const fetchCareers = async () => {
        try {
            const careersData = await getCareers();
            setCareers(careersData);
        } catch (error) {
            console.error("Failed to fetch careers", error);
            toast.current?.show({
                severity: "error",
                summary: "Error al cargar carreras",
                detail: "No se pudieron obtener las carreras para el formulario."
            })
        }
    };
    if (selectedRole === 'alumno') {
      fetchCareers();
    }
  }, [selectedRole, toast]);

  const roleDisplayFiltered = useMemo(() => {
    if (loggedInUser?.rol === 'coordinador') {
      const { coordinador, administrador, ...rest } = roleDisplayMap;
      return rest;
    }
    if (loggedInUser?.rol === 'administrador') {
      const { administrador, ...rest } = roleDisplayMap;
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
    let roleId;
    switch(selectedRole) {
        case 'administrador': roleId = Roles.Administrador; break;
        case 'docente': roleId = Roles.Docente; break;
        case 'coordinador': roleId = Roles.Coordinador; break;
        case 'alumno': roleId = Roles.Alumno; break;
        default: roleId = Roles.Docente; // Default to docente
    }
    
    const dataToSend = { ...data, id_rol: roleId };

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
      const endpoint = selectedRole === 'administrador' ? '/usuario' : roleRouteMap[selectedRole as keyof typeof roleRouteMap];
      await createUser(dataToSend, { basePath: endpoint });
      toast.current?.show({
        severity: "success",
        summary: "Usuario Creado",
        detail: `El usuario ${data.nombre} ha sido creado con éxito.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al crear usuario",
            detail: error.message,
        });
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!defaultRole && (
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
          )}
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
    </>
  )
}
