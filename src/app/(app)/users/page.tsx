
"use client"

import { useState, useEffect } from "react"
import { Pencil, PlusCircle, Trash2, Search } from "lucide-react"

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
import { useAuth } from "@/context/auth-context"
import { users as allUsersData, User, Role } from "@/lib/data"
import { CreateUserForm } from "@/components/create-user-form"
import { Input } from "@/components/ui/input"

type RoleFilter = Role | 'all';

export default function UsersPage() {
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Exclude administrator from the list that can be managed
  const allUsers = allUsersData.filter(user => user.rol !== 'administrator');

  useEffect(() => {
    let usersToDisplay = allUsers;

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
  }, [filter, searchTerm]);

  const roleDisplayMap: { [key in RoleFilter]: string } = {
    'all': 'Todos',
    'student': 'Alumno',
    'teacher': 'Docente',
    'coordinator': 'Coordinador',
    'administrator': 'Administrador'
  };

  const filterButtons: RoleFilter[] = ['all', 'teacher', 'student', 'coordinator'];


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Usuarios
        </h1>
        {!isAuthLoading && loggedInUser?.rol === 'administrator' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Buscar usuarios..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
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
          </div>
        )}
      </div>

       {/* Mobile View - Card List */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        <div className="flex flex-wrap items-center gap-2">
            {filterButtons.map((role) => (
                <Button
                key={role}
                variant={filter === role ? 'default' : 'outline-filter'}
                size="sm"
                onClick={() => setFilter(role)}
                >
                {roleDisplayMap[role]}
                </Button>
            ))}
        </div>
        {filteredUsers.map((user) => (
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Desktop View - Table */}
      <Card className="hidden md:block rounded-xl">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Administra todas las cuentas de usuario en el sistema.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                {filterButtons.map((role) => (
                  <Button
                    key={role}
                    variant={filter === role ? 'default' : 'outline-filter'}
                    onClick={() => setFilter(role)}
                  >
                    {roleDisplayMap[role]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
              {filteredUsers.map((user) => (
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredUsers.length}</strong> de <strong>{allUsers.length}</strong> usuarios
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
