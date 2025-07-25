
"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

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
import { groups } from "@/lib/data"
import { CreateGroupForm } from "@/components/create-group-form"
import { Separator } from "@/components/ui/separator"

export default function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Grupos
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar un nuevo grupo.
                    </DialogDescription>
                </DialogHeader>
                <CreateGroupForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>

       {/* Mobile View - Card List */}
      <div className="md:hidden flex flex-col gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.career}</CardDescription>
                </div>
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
              </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-2"/>
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                    <div className="font-semibold">Semestre:</div>
                    <div>{group.semester}</div>
                    <div className="font-semibold">Ciclo:</div>
                    <div>{group.cycle}</div>
                    <div className="font-semibold">Turno:</div>
                    <div>{group.turno}</div>
                    <div className="font-semibold">Alumnos:</div>
                    <div>{group.students.length}</div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Grupos</CardTitle>
          <CardDescription>
            Administra todos los grupos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Alumnos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.career}</TableCell>
                  <TableCell>{group.semester}</TableCell>
                  <TableCell>{group.cycle}</TableCell>
                  <TableCell>{group.turno}</TableCell>
                  <TableCell>{group.students.length}</TableCell>
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
            Mostrando <strong>1-{groups.length}</strong> de <strong>{groups.length}</strong> grupos
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
