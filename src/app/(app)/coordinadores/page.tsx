
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookCopy } from "lucide-react"
import { Toast } from 'primereact/toast';
import Link from "next/link";

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
import { User } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { Input } from "@/components/ui/input"
import { getUsers, deleteUser } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoordinadoresPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const usersData = await getUsers();
      setAllUsers(usersData.filter(u => u.rol === 'coordinador'));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los coordinadores');
      console.error(err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let usersToDisplay = allUsers;
    if (searchTerm) {
        usersToDisplay = usersToDisplay.filter(user =>
        `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return usersToDisplay;
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
            detail: "El coordinador ha sido eliminado correctamente.",
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
            <div className="flex gap-2 pt-2">
            <Button asChild size="sm" variant="success" className="flex-1">
              <Link href={`/carrerasPorCoordinador/${user.id}`}>
                <BookCopy className="h-4 w-4 mr-2" />
                <span>Ver Carreras</span>
              </Link>
            </Button>
            <Button size="sm" variant="warning" className="flex-1" onClick={() => handleEditClick(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
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
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-full" />
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Coordinadores
        </h1>
           <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Coordinador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Coordinador</DialogTitle>
                    <DialogDescription>
                    Completa el formulario para registrar una nueva cuenta de coordinador.
                    </DialogDescription>
                </DialogHeader>
                <CreateUserForm defaultRole="coordinador" onSuccess={() => { setIsCreateModalOpen(false); fetchUsers(); }} />
            </DialogContent>
           </Dialog>
      </div>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Editar Coordinador</DialogTitle>
                <DialogDescription>
                    Modifica los datos del coordinador. La contraseña solo se actualizará si se ingresa un nuevo valor.
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
              placeholder="Buscar coordinadores..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isUsersLoading 
            ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
            : filteredUsers.map(renderUserCard)}
      </div>
    </div>
  )
}
