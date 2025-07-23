
"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

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
import { CreateSupervisionForm } from "@/components/create-supervision-form"
import { supervisions } from "@/lib/data"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SupervisionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Supervisión de Docentes
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Supervisión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Supervisión</DialogTitle>
              <DialogDescription>
                Completa el formulario para agendar una nueva supervisión de
                docente.
              </DialogDescription>
            </DialogHeader>
            <CreateSupervisionForm onSuccess={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supervisiones Programadas</CardTitle>
          <CardDescription>
            Estas son las supervisiones que han sido agendadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Coordinador</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisions.map((supervision) => (
                <TableRow key={supervision.id}>
                  <TableCell>
                    {format(supervision.date, "PPP", { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {supervision.teacher}
                  </TableCell>
                  <TableCell>{supervision.subject}</TableCell>
                  <TableCell>{supervision.coordinator}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supervision.status === "Completada"
                          ? "default"
                          : "secondary"
                      }
                       className={supervision.status === "Completada" ? "bg-green-600" : ""}
                    >
                      {supervision.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-{supervisions.length}</strong> de <strong>{supervisions.length}</strong> supervisiones
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
