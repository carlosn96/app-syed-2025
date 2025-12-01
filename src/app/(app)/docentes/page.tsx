
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
import { deleteUser, getDocentes } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function DocentesPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allDocentes, setAllDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchDocentes = async () => {
    try {
      setIsLoading(true);
      const docentesData = await getDocentes() as Docente[];
      setAllDocentes(docentesData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los docentes');
      console.error(err);
      setAllDocentes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const filteredDocentes = useMemo(() => {
    if (!searchTerm) {
        return allDocentes;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allDocentes.filter(docente => {
        const fullName = normalizeString(docente.nombre_completo);
        const email = normalizeString(docente.correo);
        return fullName.includes(normalizedSearchTerm) || email.includes(normalizedSearchTerm);
    });
  }, [allDocentes, searchTerm]);


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

  const handleDeleteUser = async (userId: number) => {
    try {
        await deleteUser(userId);
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

  const renderUserCard = (docente: Docente) => {
    return (
        <Card key={docente.id_docente}>
        <CardHeader>
            <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base">{docente.nombre_completo}</CardTitle>
                <CardDescription>{docente.correo}</CardDescription>
            </div>
            <Badge variant="outline">Docente</Badge>
            </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
             <p><span className="font-semibold">Grado Académico:</span> {docente.grado_academico}</p>
            <div className="flex justify-end gap-2 pt-2">
            <Button size="icon" variant="warning" onClick={() => handleEditClick(docente)}>
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
                            <span className="font-bold text-white"> {docente.nombre_completo}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(docente.id_usuario)}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {docente.id_docente && (
                <Button asChild size="icon" variant="outline">
                    <Link href={`/users/teachers/${docente.id_docente}`}>
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
                <CreateUserForm defaultRole="docente" onSuccess={() => { setIsCreateModalOpen(false); fetchDocentes(); }} />
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
                    onSuccess={() => { setIsEditModalOpen(false); fetchDocentes(); }} 
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
        {isLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredDocentes.map(renderUserCard)}
      </div>
    </div>
  )
}
