"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useRef } from "react"
import { Toast } from 'primereact/toast'
import { useAuth } from "@/context/auth-context"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { resetPassword } from "@/services/api"

const resetPasswordSchema = z.object({
    contrasena_nueva: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmar_contrasena: z.string(),
}).refine(data => data.contrasena_nueva === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmar_contrasena"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
    userName?: string;
    onSuccess?: () => void;
}

export function ResetPasswordForm({
    isOpen,
    onOpenChange,
    userId,
    userName = "el usuario",
    onSuccess,
}: ResetPasswordFormProps) {
    const { user: currentUser } = useAuth();
    const toast = useRef<Toast>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            contrasena_nueva: "",
            confirmar_contrasena: "",
        },
    });

    const onSubmit = async (values: ResetPasswordFormValues) => {

        setIsSubmitting(true);
        try {
            const adminValues = values as z.infer<typeof resetPasswordSchema>;
            await resetPassword(userId, {
                contrasena_nueva: adminValues.contrasena_nueva,
            });


            toast.current?.show({
                severity: "success",
                summary: "Éxito",
                detail: `Contraseña de ${userName} actualizada correctamente.`,
            });

            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error instanceof Error ? error.message : "No se pudo actualizar la contraseña.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset();
        }
        onOpenChange(open);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña de {userName}</DialogTitle>
                        <DialogDescription>
                            {`Ingresa la nueva contraseña para ${userName}.`}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="contrasena_nueva"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Ingresa tu nueva contraseña"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmar_contrasena"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirma tu nueva contraseña"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                            </Button>
                        </div>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
