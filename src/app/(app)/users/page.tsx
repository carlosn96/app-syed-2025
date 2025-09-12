
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { User, Roles } from "@/lib/modelos"
import { CreateUserForm } from "@/components/create-user-form"
import { Input } from "@/components/ui/input"
import { getUsers } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

type RoleFilter = 'administrador' | 'coordinador' | 'docente' | 'alumno' | 'all';

export default function UsersPage() {
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const roleIdToName = (id: number): RoleFilter => {
    switch (id) {
        case Roles.Administrador: return 'administrador';
        case Roles.Coordinador: return 'coordinador';
        case Roles.Docente: return 'docente';
        case Roles.Alumno: return 'alumno';
        default: return 'all';
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsUsersLoading(true);
        const data = await getUsers();
        
        const mappedData: User[] = data.map(u => ({
          ...u,
          rol: roleIdToName(u.id_rol),
          rol_nombre: u.rol
        }));
        
        if (loggedInUser?.rol === 'coordinador') {
            setAllUsers(mappedData.filter(u => u.rol === 'docente' || u.rol === 'alumno'));
        } else {
            setAllUsers(mappedData);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los usuarios');
        console.error(err);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
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
  
  const renderUserCard = (user: User) => (
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
        <p><span className="font-semibold">Grupo:</span> {user.rol === 'alumno' ? user.grupo : 'N/A'}</p>
        <p><span className="font-semibold">Registro:</span> {new Date(user.fecha_registro).toLocaleDateString()}</p>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="warning" className="flex-1">
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button size="sm" variant="destructive" className="flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
           {user.rol === 'docente' && (
             <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/users/teachers/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Perfil
                </Link>
             </Button>
           )}
        </div>
      </CardContent>
    </Card>
  );
  
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
           <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                <CreateUserForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
           </Dialog>
        )}
      </div>
      
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
