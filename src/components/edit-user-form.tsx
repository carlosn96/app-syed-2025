
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
import { User, CareerSummary } from "@/lib/modelos"
import { updateUser, getCareers, getCarrerasForCoordinador } from "@/services/api"

const editUserSchema = z.object({
  nombre_completo: z.string().optional(),
  nombre: z.string().optional(),
  apellido_paterno: z.string().optional(),
  apellido_materno: z.string().optional(),
  correo: z.string().email("Correo electrónico inválido.").optional(),
  contrasena: z.string().optional(),
  contrasena_confirmation: z.string().optional(),
  matricula: z.string().optional(),
  id_carrera: z.coerce.number().optional(),
  grado_academico: z.string().optional(),
}).refine(data => !data.contrasena || data.contrasena === data.contrasena_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["contrasena_confirmation"],
}).refine(data => !data.contrasena || data.contrasena.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
    path: ["contrasena"],
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

const roleDisplayMap: Record<string, string> = {
  coordinador: "Coordinador",
  docente: "Docente",
  alumno: "Alumno",
  administrador: "Administrador",
};

const roleRouteMap: Record<"coordinador" | "docente" | "alumno", string> = {
    coordinador: "/coordinadores",
    docente: "/docentes",
    alumno: "/alumnos",
};

interface EditUserFormProps {
  user: User;
  onSuccess?: () => void;
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const { user: loggedInUser } = useAuth();
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  
  const selectedRole = user.rol as "coordinador" | "docente" | "alumno";

  const nameParts = useMemo(() => {
    const fullName = user.nombre_completo || '';
    const parts = fullName.split(' ');
    return {
        nombre: user.nombre || parts[0] || '',
        apellido_paterno: user.apellido_paterno || parts[1] || '',
        apellido_materno: user.apellido_materno || parts.slice(2).join(' ') || ''
    };
  }, [user.nombre, user.apellido_paterno, user.apellido_materno, user.nombre_completo]);

  useEffect(() => {
    const fetchCareers = async () => {
        try {
            if (selectedRole === 'alumno') {
                let careersData: CareerSummary[];
                if (loggedInUser?.rol === 'coordinador') {
                    careersData = await getCarrerasForCoordinador();
                } else {
                    careersData = await getCareers();
                }
                setCareers(careersData);
            }
        } catch (error) {
            console.error("Failed to fetch careers", error);
        }
    };
    fetchCareers();
  }, [selectedRole, loggedInUser?.rol]);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nombre: nameParts.nombre,
      apellido_paterno: nameParts.apellido_paterno,
      apellido_materno: nameParts.apellido_materno,
      correo: user.correo,
      contrasena: "",
      contrasena_confirmation: "",
      matricula: user.matricula || "",
      id_carrera: user.id_carrera,
      grado_academico: user.grado_academico || "",
    },
  });

  const onSubmit = async (data: EditUserFormValues) => {
    setIsSubmitting(true);
    
    const dataToSend: { [key: string]: any } = {};

    // Collect only changed fields
    Object.keys(data).forEach((key) => {
        const formKey = key as keyof EditUserFormValues;
        const currentValue = data[formKey];
        
        // Ensure we have defaultValues to compare against
        const initialValue = form.formState.defaultValues ? form.formState.defaultValues[formKey] : undefined;

        if (formKey === 'matricula') {
          return;
        }

        if (currentValue !== undefined && currentValue !== "" && currentValue !== initialValue) {
            dataToSend[formKey] = currentValue;
        }
    });

    if (data.nombre || data.apellido_paterno || data.apellido_materno) {
        const nombre = data.nombre || nameParts.nombre;
        const ap = data.apellido_paterno || nameParts.apellido_paterno;
        const am = data.apellido_materno || nameParts.apellido_materno;
        dataToSend.nombre_completo = `${nombre} ${ap} ${am}`.trim();
        if (selectedRole === 'alumno') {
            dataToSend.nombre = nombre;
            dataToSend.apellido_paterno = ap;
            dataToSend.apellido_materno = am;
            delete dataToSend.nombre_completo; 
        }
    }
    
    if (selectedRole === 'alumno') {
        dataToSend.id_carrera = data.id_carrera || user.id_carrera;
    }


    if (!data.contrasena) {
      delete dataToSend.contrasena;
      delete dataToSend.contrasena_confirmation;
    } else {
        dataToSend.contrasena = data.contrasena;
    }

    try {
      let endpoint: string;
      if (loggedInUser?.rol === 'coordinador' && selectedRole === 'alumno') {
        endpoint = '/coordinador-alumnos';
      } else {
        endpoint = roleRouteMap[selectedRole];
      }
      
      let idToUpdate: number | undefined;

      if (selectedRole === 'alumno') {
        idToUpdate = user.id_alumno;
      } else if (selectedRole === 'docente') {
        idToUpdate = user.id_docente;
      } else if (selectedRole === 'coordinador') {
        idToUpdate = user.id_coordinador;
      } else {
        idToUpdate = user.id;
      }

      if (idToUpdate === undefined) {
        throw new Error("ID de usuario no válido para la actualización.");
      }
      
      await updateUser(idToUpdate, dataToSend, { basePath: endpoint });
      toast.current?.show({
        severity: "success",
        summary: "Usuario Actualizado",
        detail: `El usuario ha sido actualizado con éxito.`,
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al actualizar",
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
          <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                  <Input value={roleDisplayMap[selectedRole] || "Desconocido"} disabled />
              </FormControl>
          </FormItem>

          {selectedRole === 'alumno' && (
            <>
              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
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
                <FormLabel>Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} placeholder="Dejar en blanco para no cambiar"/>
                </FormControl>
                <FormDescription>
                  Deja este campo en blanco si no deseas cambiar la contraseña.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contrasena_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Form>
    </>
  )
}

    