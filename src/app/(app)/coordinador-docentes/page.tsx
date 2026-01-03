
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
import { User, Docente } from "@/lib/modelos"
import { getDocentesForCoordinador, deleteUser } from "@/services/api"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { DocentesList } from "@/components/docentes/docentes-list"

export default function CoordinadorDocentesPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allDocentes, setAllDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: number; name: string } | null>(null);

  const fetchDocentes = async () => {
    try {
      setIsLoading(true);
      const docentesData = await getDocentesForCoordinador();
       if (Array.isArray(docentesData)) {
        setAllDocentes(docentesData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los docentes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const handleEditClick = (docente: Docente) => {
    const userForEdit: User = {
        id: docente.id_usuario,
        id_docente: docente.id_docente,
        nombre_completo: docente.nombre_completo,
        correo: docente.correo,
        grado_academico: docente.grado_academico,
        id_rol: 2, // Docente role
        rol: 'docente',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_registro: '',
        ultimo_acceso: '',
    };
    setUserToEdit(userForEdit);
    setIsEditModalOpen(true);
  };

   const handleDeleteUser = async (docente: Docente) => {
    try {
        await deleteUser(docente.id_docente, { basePath: '/coordinador-docentes' });
        toast.current?.show({
            severity: "success",
            summary: "Usuario Eliminado",
            detail: "El docente ha sido eliminado correctamente.",
        });
        fetchDocentes();
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
        <PageTitle>Gestión de Docentes</PageTitle>
         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Docente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Docente</DialogTitle>
                    <DialogDescription>
                    Completa el formulario para registrar una nueva cuenta de docente.
                    </DialogDescription>
                </DialogHeader>
                <CreateUserForm defaultRole="docente" onSuccess={() => { setIsCreateModalOpen(false); fetchDocentes(); }} />
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
                <DialogTitle>Editar Docente</DialogTitle>
                <DialogDescription>
                    Modifica los datos del docente. La contraseña solo se actualizará si se ingresa un nuevo valor.
                </DialogDescription>
            </DialogHeader>
            {userToEdit && (
                <EditUserForm 
                    user={userToEdit} 
                    onSuccess={() => { setIsEditModalOpen(false); fetchDocentes(); }} 
                />
            )}
        </DialogContent>
       </Dialog>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <DocentesList
        docentes={allDocentes}
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
