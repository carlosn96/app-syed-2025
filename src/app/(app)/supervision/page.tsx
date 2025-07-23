
"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { CreateSupervisionForm } from "@/components/create-supervision-form"
import { supervisions, groups } from "@/lib/data"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"

export default function SupervisionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const proximasSupervisiones = supervisions
    .filter(s => s.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || "N/A";
  }

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
            <CreateSupervisionForm 
                onSuccess={() => setIsModalOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3 w-full"
                locale={es}
                 disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex justify-around",
                  row: "flex w-full mt-2 justify-around",
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Supervisiones Próximas</CardTitle>
              <CardDescription>Eventos de supervisión más cercanos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {proximasSupervisiones.length > 0 ? (
                proximasSupervisiones.map((supervision) => (
                  <div
                    key={supervision.id}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md h-12 w-12 text-sm">
                      <span className="capitalize">
                        {format(supervision.date, "LLL", { locale: es })}
                      </span>
                      <span className="font-bold text-lg">
                        {supervision.date.getDate()}
                      </span>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {supervision.teacher}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {supervision.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coordina: {supervision.coordinator}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No hay supervisiones próximas.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Lista de Supervisiones Programadas</CardTitle>
            <CardDescription>Historial y próximas supervisiones agendadas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Docente</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Coordinador</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {supervisions.map((supervision) => (
                        <TableRow key={supervision.id}>
                            <TableCell className="font-medium">{supervision.teacher}</TableCell>
                            <TableCell>{supervision.subject}</TableCell>
                            <TableCell>{format(supervision.date, "PPP", { locale: es })}</TableCell>
                            <TableCell>{getGroupName(supervision.groupId)}</TableCell>
                            <TableCell>{supervision.coordinator}</TableCell>
                            <TableCell>{supervision.status}</TableCell>
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
