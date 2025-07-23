
"use client"

import { useState, useEffect } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

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
import { users as allUsers, User, Role } from "@/lib/data"
import { CreateUserForm } from "@/components/create-user-form"

type RoleFilter = Role | 'all';

export default function UsersPage() {
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const usersToDisplay = allUsers.filter(user => user.rol !== 'administrator');
    if (filter === 'all') {
      setFilteredUsers(usersToDisplay);
    } else {
      setFilteredUsers(usersToDisplay.filter((user) => user.rol === filter));
    }
  }, [filter]);

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
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Gestión de Usuarios
        </h1>
        {!isAuthLoading && loggedInUser?.rol === 'administrator' && (
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
      <Card>
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
                      <Button size="icon" variant="destructive-outline">
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
            Mostrando <strong>{filteredUsers.length}</strong> de <strong>{allUsers.filter(u => u.rol !== 'administrator').length}</strong> usuarios
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
