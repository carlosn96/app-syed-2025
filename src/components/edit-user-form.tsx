
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
import { groups } from "@/lib/data"
import { useMemo, useState, useRef } from "react"
import { User } from "@/lib/modelos"
import { updateUser } from "@/services/api"

const editUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  apellido_paterno: z.string().min(1, "El apellido paterno es requerido."),
  apellido_materno: z.string().min(1, "El apellido materno es requerido."),
  correo: z.string().email("Correo electrónico inválido."),
  grupo: z.string().optional(),
  contrasena: z.string().optional(),
  contrasena_confirmation: z.string().optional(),
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
  
  // The role is now determined by the user prop and is not changeable.
  const selectedRole = user.rol as "coordinador" | "docente" | "alumno";

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      correo: user.correo,
      grupo: user.grupo || "",
      contrasena: "",
      contrasena_confirmation: "",
    },
  });

  const onSubmit = async (data: EditUserFormValues) => {
    setIsSubmitting(true);
    
    const dataToSend: Partial<EditUserFormValues> = { ...data };
    if (!data.contrasena) {
      delete dataToSend.contrasena;
      delete dataToSend.contrasena_confirmation;
    }
    
    if (selectedRole === "alumno" && !dataToSend.grupo) {
        form.setError("grupo", { type: "manual", message: "Por favor, seleccione un grupo para el alumno." });
        setIsSubmitting(false);
        return;
    }

    try {
      const endpoint = roleRouteMap[selectedRole];
      await updateUser(user.id, dataToSend, { basePath: endpoint });
      toast.current?.show({
        severity: "success",
        summary: "Usuario Actualizado",
        detail: `El usuario ${data.nombre} ha sido actualizado con éxito.`,
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

          {selectedRole === "alumno" && (
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

    