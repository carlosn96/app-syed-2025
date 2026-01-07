
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookCopy, Key, Grid3X3, List } from "lucide-react"
import toast from 'react-hot-toast';
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
import { CoordinadoresList } from "@/components/coordinadores/coordinadores-list"
import { Input } from "@/components/ui/input"
import { getUsers, deleteUser, getCoordinadores } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CoordinadoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCoordinators, setAllCoordinators] = useState<Coordinador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

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
      toast.success("El coordinador ha sido eliminado correctamente.");
      fetchCoordinators();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleBulkDelete = async (userIds: number[]) => {
    try {
      await Promise.all(userIds.map(id => deleteUser(id)));
      toast.success(`${userIds.length} coordinador${userIds.length !== 1 ? 'es' : ''} ${userIds.length !== 1 ? 'han' : 'ha'} sido eliminado${userIds.length !== 1 ? 's' : ''} correctamente.`);
      fetchCoordinators();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'gallery' ? 'default' : 'outline'}
            onClick={() => setViewMode('gallery')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Galería
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
      </div>

      <CoordinadoresList
        coordinators={filteredCoordinators}
        isLoading={isLoading}
        viewMode={viewMode}
        onEdit={handleEditClick}
        onDelete={handleDeleteUser}
        onResetPassword={(user) => setSelectedUserForReset(user)}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  )
}
