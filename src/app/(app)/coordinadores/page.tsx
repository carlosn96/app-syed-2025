
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookCopy, Key } from "lucide-react"
import { Toast } from 'primereact/toast';
import Link from "next/link";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { User, Coordinador } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Input } from "@/components/ui/input"
import { getUsers, deleteUser, getCoordinadores } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function CoordinadoresPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCoordinators, setAllCoordinators] = useState<Coordinador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: number; name: string } | null>(null);

  const fetchCoordinators = async () => {
    try {
      setIsLoading(true);
      const coordinatorsData = await getCoordinadores();
      setAllCoordinators(coordinatorsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los coordinadores');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const filteredCoordinators = useMemo(() => {
    if (!searchTerm) {
      return allCoordinators;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allCoordinators.filter(user => {
      const fullName = normalizeString(user.nombre_completo);
      const email = normalizeString(user.correo);
      return fullName.includes(normalizedSearchTerm) || email.includes(normalizedSearchTerm);
    });
  }, [allCoordinators, searchTerm]);


  const handleEditClick = (coordinator: Coordinador) => {
    const nameParts = coordinator.nombre_completo.split(' ');
    const userForEdit: User = {
      id: coordinator.usuario_id,
      id_coordinador: coordinator.id_coordinador,
      nombre: nameParts[0] || '',
      apellido_paterno: nameParts[1] || '',
      apellido_materno: nameParts.slice(2).join(' ') || '',
      nombre_completo: coordinator.nombre_completo,
      correo: coordinator.correo,
      id_rol: 3, // Coordinator role
      rol: 'coordinador',
      fecha_registro: coordinator.fecha_registro,
      ultimo_acceso: coordinator.ultimo_acceso
    };
    setUserToEdit(userForEdit);
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
      fetchCoordinators();
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

  const renderCoordinatorCard = (coordinator: Coordinador) => {
    return (
      <Card key={coordinator.id_coordinador} className="relative flex flex-col">

        {/* Botones superiores: Cambiar contraseña, Editar y Eliminar */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSelectedUserForReset({ id: coordinator.usuario_id, name: coordinator.nombre_completo })}
            title="Cambiar contraseña"
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="info"
            onClick={() => handleEditClick(coordinator)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                  <span className="font-bold text-primary"> {coordinator.nombre_completo}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteUser(coordinator.usuario_id)}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Header con espacio superior para los botones */}
        <CardHeader className="pt-12">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{coordinator.nombre_completo}</CardTitle>
              
              <CardDescription>{coordinator.correo}</CardDescription>

              <CardDescription>
                <span className="font-semibold">Registro:</span>{" "}
                {new Date(coordinator.fecha_registro).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Footer con botón de "Ver carreras" ocupando todo el ancho */}
        <CardFooter className="mt-auto">
          <Button
            asChild
            size="sm"
            variant="info-outline"
            className="w-full"
          >
            <Link href={`/carrerasPorCoordinador/${coordinator.id_coordinador}`}>
              <BookCopy className="h-4 w-4 mr-2" />
              <span>Ver Carreras</span>
            </Link>
          </Button>
        </CardFooter>

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
        <PageTitle>Gestión de Coordinadores</PageTitle>
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
            <CreateUserForm defaultRole="coordinador" onSuccess={() => { setIsCreateModalOpen(false); fetchCoordinators(); }} />
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
            <DialogTitle>Editar Coordinador</DialogTitle>
            <DialogDescription>
              Modifica los datos del coordinador. La contraseña solo se actualizará si se ingresa un nuevo valor.
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <EditUserForm
              user={userToEdit}
              onSuccess={() => { setIsEditModalOpen(false); fetchCoordinators(); }}
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
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
          : filteredCoordinators.map(renderCoordinatorCard)}
      </div>
    </div>
  )
}
