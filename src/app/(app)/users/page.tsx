
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { users as allUsersData, User, Role } from "@/lib/data"
import { CreateUserForm } from "@/components/create-user-form"
import { Input } from "@/components/ui/input"
import { FloatingButton } from "@/components/ui/floating-button"

type RoleFilter = Role | 'all';

export default function UsersPage() {
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const allUsers = useMemo(() => {
      if (loggedInUser?.rol === 'coordinator') {
          return allUsersData.filter(u => u.rol === 'teacher' || u.rol === 'student');
      }
      return allUsersData;
  }, [loggedInUser]);

  const { teachers, students } = useMemo(() => {
    const teachers = allUsers.filter(user => user.rol === 'teacher');
    const students = allUsers.filter(user => user.rol === 'student');
    return { teachers, students };
  }, [allUsers]);

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

  useEffect(() => {
    if (loggedInUser?.rol === 'administrator') {
      let usersToDisplay = allUsersData.filter(user => user.rol !== 'administrator');

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
      setFilteredUsers(usersToDisplay);
    }
  }, [filter, searchTerm, allUsersData, loggedInUser]);

  const roleDisplayMap: { [key in RoleFilter]: string } = {
    'all': 'Todos',
    'student': 'Alumnos',
    'teacher': 'Docentes',
    'coordinator': 'Coordinadores',
    'administrator': 'Administrador'
  };

  const filterButtons: RoleFilter[] = useMemo(() => {
      if (loggedInUser?.rol === 'coordinator') {
          return ['teacher', 'student'];
      }
      return ['all', 'teacher', 'student', 'coordinator'];
  }, [loggedInUser]);
  
  const renderUserCard = (user: User) => (
    <Card key={user.id} className="rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{`${user.nombre} ${user.apellido_paterno}`}</CardTitle>
            <CardDescription>{user.correo}</CardDescription>
          </div>
          <Badge variant="outline">{roleDisplayMap[user.rol]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p><span className="font-semibold">Grupo:</span> {user.rol === 'student' ? user.grupo : 'N/A'}</p>
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
           {user.rol === 'teacher' && (
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

  const renderUserTableRow = (user: User) => (
    <TableRow key={user.id}>
      <TableCell>
        <div className="font-medium">{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</div>
        <div className="text-sm text-muted-foreground">{user.correo}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{roleDisplayMap[user.rol]}</Badge>
      </TableCell>
      <TableCell>{user.rol === 'student' ? user.grupo : 'N/A'}</TableCell>
      <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button size="icon" variant="warning">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button size="icon" variant="destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
           {user.rol === 'teacher' && (
            <Button asChild size="icon" variant="outline">
                <Link href={`/users/teachers/${user.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver Perfil</span>
                </Link>
            </Button>
           )}
        </div>
      </TableCell>
    </TableRow>
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
      {/* Mobile View - Card List */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredUsers.map(renderUserCard)}
      </div>
      
      {/* Desktop View - Table */}
      <Card className="hidden md:block rounded-xl">
        <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
                Administra todas las cuentas de usuario en el sistema.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(renderUserTableRow)}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredUsers.length}</strong> de <strong>{allUsersData.filter(u => u.rol !== 'administrator').length}</strong> usuarios
          </div>
        </CardFooter>
      </Card>
    </>
  );

  const renderCoordinatorView = () => (
    <Tabs defaultValue="teachers" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="teachers">Docentes</TabsTrigger>
        <TabsTrigger value="students">Alumnos</TabsTrigger>
      </TabsList>
      <TabsContent value="teachers">
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
         {/* Mobile View */}
        <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredTeachers.map(renderUserCard)}
        </div>
        {/* Desktop View */}
        <Card className="hidden md:block rounded-xl">
            <CardHeader>
                <CardTitle>Docentes</CardTitle>
                <CardDescription>Lista de todos los docentes en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeachers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</div>
                                    <div className="text-sm text-muted-foreground">{user.correo}</div>
                                </TableCell>
                                <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="warning"><Pencil className="h-4 w-4" /><span className="sr-only">Editar</span></Button>
                                        <Button size="icon" variant="destructive"><Trash2 className="h-4 w-4" /><span className="sr-only">Eliminar</span></Button>
                                        <Button asChild size="icon" variant="outline">
                                            <Link href={`/users/teachers/${user.id}`}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Ver Perfil</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <div className="text-xs text-muted-foreground">Mostrando <strong>{filteredTeachers.length}</strong> de <strong>{teachers.length}</strong> docentes</div>
            </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="students">
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
         {/* Mobile View */}
        <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredStudents.map(renderUserCard)}
        </div>
         {/* Desktop View */}
        <Card className="hidden md:block rounded-xl">
            <CardHeader>
                <CardTitle>Alumnos</CardTitle>
                <CardDescription>Lista de todos los alumnos en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Grupo</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {filteredStudents.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</div>
                                    <div className="text-sm text-muted-foreground">{user.correo}</div>
                                </TableCell>
                                <TableCell>{user.grupo}</TableCell>
                                <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="warning"><Pencil className="h-4 w-4" /><span className="sr-only">Editar</span></Button>
                                        <Button size="icon" variant="destructive"><Trash2 className="h-4 w-4" /><span className="sr-only">Eliminar</span></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <div className="text-xs text-muted-foreground">Mostrando <strong>{filteredStudents.length}</strong> de <strong>{students.length}</strong> alumnos</div>
            </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Usuarios
        </h1>
        {!isAuthLoading && (loggedInUser?.rol === 'administrator' || loggedInUser?.rol === 'coordinator') && (
           <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <FloatingButton text="Crear Usuario" />
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
      
      {isAuthLoading ? (
        <p>Cargando...</p>
      ) : loggedInUser?.rol === 'coordinator' ? (
        renderCoordinatorView()
      ) : (
        renderAdminView()
      )}
    </div>
  )
}
