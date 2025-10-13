
"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, PlusCircle, Trash2, Search, Eye } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { User, Docente } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { Input } from "@/components/ui/input"
import { getUsers, deleteUser, getDocentes } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

type RoleFilter = 'administrador' | 'coordinador' | 'docente' | 'alumno' | 'all';

export default function UsersPage() {
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDocentes, setAllDocentes] = useState<Docente[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const roleIdToName = (id: number): RoleFilter => {
    switch (id) {
        case 1: return 'administrador';
        case 3: return 'coordinador';
        case 2: return 'docente';
        case 4: return 'alumno';
        default: return 'all';
    }
  }

  const fetchUsersAndDocentes = async () => {
    try {
      setIsUsersLoading(true);
      const [usersData, docentesData] = await Promise.all([getUsers(), getDocentes()]);
      
      const mappedData: User[] = usersData.map(u => ({
        ...u,
        id_rol: u.id_rol,
        rol: roleIdToName(u.id_rol),
        rol_nombre: u.rol
      }));
      
      if (loggedInUser?.rol === 'coordinador') {
          setAllUsers(mappedData.filter(u => u.rol === 'docente' || u.rol === 'alumno'));
      } else {
          setAllUsers(mappedData);
      }

      if (Array.isArray(docentesData)) {
        setAllDocentes(docentesData);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
      console.error(err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDocentes();
  }, [loggedInUser]);

  const { teachers, students, filteredUsers } = useMemo(() => {
    const teachers = allUsers.filter(user => user.rol === 'docente');
    const students = allUsers.filter(user => user.rol === 'alumno');
    
    let usersToDisplay = allUsers;
    if (loggedInUser?.rol === 'administrador') {
        usersToDisplay = allUsers.filter(user => user.rol !== 'administrador');

        if (filter !== 'all') {
            usersToDisplay = usersToDisplay.filter((user) => user.rol === filter);
        }
        
        if (searchTerm) {
            usersToDisplay = usersToDisplay.filter(user =>
            `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.grupo && user.grupo.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
    }
    
    return { 
        teachers, 
        students, 
        filteredUsers: usersToDisplay 
    };
  }, [allUsers, loggedInUser, filter, searchTerm]);

  const filteredTeachers = useMemo(() => 
    teachers.filter(user =>
      `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      user.correo.toLowerCase().includes(teacherSearch.toLowerCase())
    ), [teachers, teacherSearch]);

  const filteredStudents = useMemo(() =>
    students.filter(user =>
      `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      user.correo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (user.grupo && user.grupo.toLowerCase().includes(studentSearch.toLowerCase()))
    ), [students, studentSearch]);

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
        await deleteUser(userId);
        toast({
            variant: "success",
            title: "Usuario Eliminado",
            description: "El usuario ha sido eliminado correctamente.",
        });
        fetchUsersAndDocentes(); // Re-fetch users to update the list
    } catch (error) {
        if (error instanceof Error) {
            toast({
                variant: "destructive",
                title: "Error al eliminar",
                description: error.message,
            });
        }
    }
  };

  const roleDisplayMap: { [key: string]: string } = {
    'all': 'Todos',
    'alumno': 'Alumnos',
    'docente': 'Docentes',
    'coordinador': 'Coordinadores',
    'administrador': 'Administrador'
  };

  const filterButtons: RoleFilter[] = useMemo(() => {
      if (loggedInUser?.rol === 'coordinador') {
          return ['docente', 'alumno'];
      }
      return ['all', 'docente', 'alumno', 'coordinador'];
  }, [loggedInUser]);
  
  const renderUserCard = (user: User) => {
    const docenteInfo = user.rol === 'docente' ? allDocentes.find(d => d.id_usuario === user.id) : undefined;
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
            {user.rol === 'alumno' && <p><span className="font-semibold">Grupo:</span> {user.grupo || 'No asignado'}</p>}
            <p><span className="font-semibold">Registro:</span> {new Date(user.fecha_registro).toLocaleDateString()}</p>
            <div className="flex gap-2 pt-2">
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
            {user.rol === 'docente' && docenteId && (
                <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/users/teachers/${docenteId}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Perfil
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
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-full" />
            </div>
        </CardContent>
    </Card>
  );


  const renderAdminView = () => (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
        <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar usuarios..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {filterButtons.map((role) => (
                <Button
                key={role}
                variant={filter === role ? 'default' : 'outline-filter'}
                size="sm"
                onClick={() => setFilter(role as RoleFilter)}
                >
                {roleDisplayMap[role]}
                </Button>
            ))}
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isUsersLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredUsers.map(renderUserCard)}
      </div>
    </>
  );

  const renderCoordinatorView = () => (
    <Tabs defaultValue="docentes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="docentes">Docentes</TabsTrigger>
        <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
      </TabsList>
      <TabsContent value="docentes">
        <div className="relative w-full sm:max-w-xs my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar docentes..."
                className="pl-9 w-full"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isUsersLoading 
                ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
                : filteredTeachers.map(renderUserCard)}
        </div>
      </TabsContent>
      <TabsContent value="alumnos">
        <div className="relative w-full sm:max-w-xs my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar alumnos..."
                className="pl-9 w-full"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isUsersLoading 
                ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
                : filteredStudents.map(renderUserCard)}
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Usuarios
        </h1>
        {!isAuthLoading && (loggedInUser?.rol === 'administrador' || loggedInUser?.rol === 'coordinador') && (
           <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                    Completa el formulario para registrar una nueva cuenta.
                    </DialogDescription>
                </DialogHeader>
                <CreateUserForm onSuccess={() => { setIsCreateModalOpen(false); fetchUsersAndDocentes(); }} />
            </DialogContent>
           </Dialog>
        )}
      </div>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>
                    Modifica los datos del usuario. La contraseña solo se actualizará si se ingresa un nuevo valor.
                </DialogDescription>
            </DialogHeader>
            {userToEdit && (
                <EditUserForm 
                    user={userToEdit} 
                    onSuccess={() => { setIsEditModalOpen(false); fetchUsersAndDocentes(); }} 
                />
            )}
        </DialogContent>
       </Dialog>
      
      {error && <p className="text-destructive text-center">{error}</p>}

      {isAuthLoading ? (
        <p>Cargando...</p>
      ) : loggedInUser?.rol === 'coordinador' ? (
        renderCoordinatorView()
      ) : (
        renderAdminView()
      )}
    </div>
  )
}
