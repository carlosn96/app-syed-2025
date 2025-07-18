
"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2 } from "lucide-react"

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
import { users as allUsers, User } from "@/lib/data"

type RoleFilter = 'Administrador' | 'Coordinador' | 'Docente' | 'Alumno' | 'all';

export default function UsersPage() {
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(allUsers);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(allUsers.filter((user) => user.rol === filter));
    }
  }, [filter]);

  const getRoleForFilter = (role: string): RoleFilter => {
    const roleMap: { [key: string]: RoleFilter } = {
      'Todos': 'all',
      'Docente': 'Docente',
      'Alumno': 'Alumno',
      'Coordinador': 'Coordinador'
    };
    return roleMap[role] || 'all';
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Gestión de Usuarios
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Administra todas las cuentas de usuario en el sistema.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {['Todos', 'Docente', 'Alumno', 'Coordinador'].map((role) => (
                <Button
                  key={role}
                  variant={filter === getRoleForFilter(role) ? 'default' : 'outline-filter'}
                  onClick={() => setFilter(getRoleForFilter(role))}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.rol}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                  <TableCell>{user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="icon" variant="warning">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button size="icon" variant="destructive-outline">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
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
