
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, Eye } from "lucide-react"
import Link from "next/link"
import { Toast } from 'primereact/toast';

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { User, Docente } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { Input } from "@/components/ui/input"
import { getUsers, deleteUser, getDocentes } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function DocentesPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allDocentes, setAllDocentes] = useState<Docente[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const [usersData, docentesData] = await Promise.all([getUsers(), getDocentes()]);
      setAllUsers(usersData.filter(u => u.rol === 'docente'));
      if (Array.isArray(docentesData)) {
        setAllDocentes(docentesData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los docentes');
      console.error(err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
        return allUsers;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allUsers.filter(user => {
        const fullName = normalizeString(`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`);
        const email = normalizeString(user.correo);
        return fullName.includes(normalizedSearchTerm) || email.includes(normalizedSearchTerm);
    });
  }, [allUsers, searchTerm]);


  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
        await deleteUser(userId);
        toast.current?.show({
            severity: "success",
            summary: "Usuario Eliminado",
            detail: "El docente ha sido eliminado correctamente.",
        });
        fetchUsers();
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

  const renderUserCard = (user: User) => {
    const docenteInfo = allDocentes.find(d => d.id_usuario === user.id);
    const docenteId = docenteInfo?.id_docente;

    return (
        <Card key={user.id}>
        <CardHeader>
            <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base">{`${user.nombre} ${user.apellido_paterno}`}</CardTitle>
                <CardDescription>{user.correo}</CardDescription>
            </div>
            <Badge variant="outline">{user.rol_nombre || user.rol}</Badge>
            </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><span className="font-semibold">Registro:</span> {new Date(user.fecha_registro).toLocaleDateString()}</p>
            <div className="flex justify-end gap-2 pt-2">
            <Button size="icon" variant="warning" onClick={() => handleEditClick(user)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                            <span className="font-bold text-white"> {`${user.nombre} ${user.apellido_paterno}`}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {docenteId && (
                <Button asChild size="icon" variant="outline">
                    <Link href={`/users/teachers/${docenteId}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Perfil</span>
                    </Link>
                </Button>
            )}
            </div>
        </CardContent>
        </Card>
    );
  };
  
  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
        <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Docentes
        </h1>
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
                <CreateUserForm defaultRole="docente" onSuccess={() => { setIsCreateModalOpen(false); fetchUsers(); }} />
            </DialogContent>
           </Dialog>
      </div>

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
                    onSuccess={() => { setIsEditModalOpen(false); fetchUsers(); }} 
                />
            )}
        </DialogContent>
       </Dialog>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar docentes..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isUsersLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredUsers.map(renderUserCard)}
      </div>
    </div>
  )
}
