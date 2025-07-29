
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
import { subjects as allSubjects } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateSubjectForm } from "@/components/create-subject-form"
import { Input } from "@/components/ui/input"
import { FloatingButton } from "@/components/ui/floating-button"

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSubjects = allSubjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.career.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Materias
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Buscar materias..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <FloatingButton text="Crear Materia" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Materia</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar una nueva materia.
                </DialogDescription>
              </DialogHeader>
              <CreateSubjectForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {/* Mobile View - Card List */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>Carrera: {subject.career}</CardDescription>
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
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Docente: </span>
                {subject.teacher}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block rounded-xl">
        <CardHeader>
          <CardTitle>Materias</CardTitle>
          <CardDescription>
            Administra todas las materias en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.career}</TableCell>
                  <TableCell>{subject.teacher}</TableCell>
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
            Mostrando <strong>1-{filteredSubjects.length}</strong> de{" "}
            <strong>{allSubjects.length}</strong> materias
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
