
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
import { User, Alumno } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { Input } from "@/components/ui/input"
import { getAlumnosForCoordinador, deleteUser } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function CoordinadorAlumnosPage() {
  const toast = useRef<Toast>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allAlumnos, setAllAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

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

  const filteredAlumnos = useMemo(() => {
    if (!searchTerm) {
        return allAlumnos;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allAlumnos.filter(alumno => {
        const fullName = normalizeString(alumno.nombre_completo);
        const email = normalizeString(alumno.correo);
        const career = alumno.carrera ? normalizeString(alumno.carrera) : '';

        return fullName.includes(normalizedSearchTerm) ||
               email.includes(normalizedSearchTerm) ||
               (career && career.includes(normalizedSearchTerm));
    });
  }, [allAlumnos, searchTerm]);

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

  const renderUserCard = (alumno: Alumno) => {
    const [name, ...restOfName] = (alumno.nombre_completo || '').split(' ');
    const lastName = restOfName.join(' ');
    
    return (
        <Card key={alumno.id_alumno}>
        <CardHeader>
            <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base">{`${name} ${lastName}`}</CardTitle>
                <CardDescription>{alumno.correo}</CardDescription>
            </div>
            <Badge variant="outline">Alumno</Badge>
            </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><span className="font-semibold">Matrícula:</span> {alumno.matricula}</p>
            <p><span className="font-semibold">Carrera:</span> {alumno.carrera || 'No asignada'}</p>
            <div className="flex justify-end gap-2 pt-2">
            <Button size="icon" variant="warning" onClick={() => handleEditClick(alumno)}>
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
                            <span className="font-bold text-white"> {alumno.nombre_completo}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(alumno)}>
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
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-end gap-2 pt-2">
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
          Gestión de Alumnos
        </h1>
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
      
      <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar alumnos..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredAlumnos.map(renderUserCard)}
      </div>
    </div>
  )
}

    