
"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2, Search } from "lucide-react"

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
import { groups as allGroups } from "@/lib/data"
import { CreateGroupForm } from "@/components/create-group-form"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export default function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = allGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.career.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.cycle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.turno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Grupos
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Buscar grupos..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
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
      </div>

       {/* Mobile View - Card List */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="rounded-xl">
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
                    <Button size="icon" variant="destructive">
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
      <Card className="hidden md:block rounded-xl">
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
              {filteredGroups.map((group) => (
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
            Mostrando <strong>1-{filteredGroups.length}</strong> de <strong>{allGroups.length}</strong> grupos
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
