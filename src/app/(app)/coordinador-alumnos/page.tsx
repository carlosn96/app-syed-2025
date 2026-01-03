
"use client"

import { useState, useEffect, useRef } from "react"
import { PlusCircle } from "lucide-react"
import { Toast } from 'primereact/toast';

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { User, Alumno } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { getAlumnosForCoordinador, deleteUser } from "@/services/api"
import { AlumnosList } from "@/components/alumnos/alumnos-list"

export default function CoordinadorAlumnosPage() {
    const toast = useRef<Toast>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [allAlumnos, setAllAlumnos] = useState<Alumno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: number; name: string } | null>(null);

    const fetchAlumnos = async () => {
        try {
            setIsLoading(true);
            const alumnosData = await getAlumnosForCoordinador();
            if (Array.isArray(alumnosData)) {
                setAllAlumnos(alumnosData);
            } else {
                setAllAlumnos([]);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los alumnos');
            console.error(err);
            setAllAlumnos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumnos();
    }, []);

    const handleEditClick = (alumno: Alumno) => {
        const userForEdit: User = {
            id: alumno.id_usuario,
            id_alumno: alumno.id_alumno,
            nombre_completo: alumno.nombre_completo,
            nombre: '',
            apellido_paterno: '',
            apellido_materno: '',
            correo: alumno.correo,
            id_rol: 4,
            rol: 'alumno',
            matricula: alumno.matricula,
            id_carrera: alumno.id_carrera,
            fecha_registro: '',
            ultimo_acceso: '',
            grado_academico: '',
        };
        setUserToEdit(userForEdit);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = async (alumno: Alumno) => {
        try {
            await deleteUser(alumno.id_alumno, { basePath: '/coordinador-alumnos' });
            toast.current?.show({
                severity: "success",
                summary: "Usuario Eliminado",
                detail: "El alumno ha sido eliminado correctamente.",
            });
            fetchAlumnos();
        } catch (error) {
            if (error instanceof Error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al eliminar",
                    detail: error.message,
                });
            }
        }
    };

    const handleResetPassword = (userId: number, userName: string) => {
        setSelectedUserForReset({ id: userId, name: userName });
    };

    return (
        <div className="flex flex-col gap-8">
            <Toast ref={toast} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageTitle>Gestión de Alumnos</PageTitle>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Alumno
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Alumno</DialogTitle>
                            <DialogDescription>
                                Completa el formulario para registrar una nueva cuenta de alumno.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateUserForm defaultRole="alumno" onSuccess={() => { setIsCreateModalOpen(false); fetchAlumnos(); }} />
                    </DialogContent>
                </Dialog>
            </div>

            <ResetPasswordForm
                isOpen={!!selectedUserForReset}
                onOpenChange={(open) => !open && setSelectedUserForReset(null)}
                userId={selectedUserForReset?.id || 0}
                userName={selectedUserForReset?.name}
            />

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Alumno</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del alumno. La contraseña solo se actualizará si se ingresa un nuevo valor.
                        </DialogDescription>
                    </DialogHeader>
                    {userToEdit && (
                        <EditUserForm
                            user={userToEdit}
                            onSuccess={() => { setIsEditModalOpen(false); fetchAlumnos(); }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {error && <p className="text-destructive text-center">{error}</p>}

            <AlumnosList
                alumnos={allAlumnos}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onEdit={handleEditClick}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                showResetPassword={true}
            />
        </div>
    )
}

