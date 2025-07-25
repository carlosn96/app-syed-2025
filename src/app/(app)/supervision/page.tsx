
"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { CreateSupervisionForm } from "@/components/create-supervision-form"
import { supervisions, groups } from "@/lib/data"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function SupervisionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const proximasSupervisiones = supervisions
    .filter(s => s.status === 'Programada' && s.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || "N/A";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Supervisión
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agendar
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

      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 h-full rounded-xl">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    locale={es}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
            </Card>
            <Card className="lg:col-span-1 rounded-xl">
                <CardHeader>
                <CardTitle>Supervisiones Próximas</CardTitle>
                <CardDescription>Eventos de supervisión más cercanos.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                {proximasSupervisiones.length > 0 ? (
                    proximasSupervisiones.map((supervision) => (
                    <div
                        key={supervision.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                        <div className="flex flex-col items-center justify-center bg-destructive text-destructive-foreground rounded-md h-10 w-10 text-xs shrink-0">
                        <span className="capitalize">
                            {format(supervision.date, "LLL", { locale: es })}
                        </span>
                        <span className="font-bold text-base">
                            {supervision.date.getDate()}
                        </span>
                        </div>
                        <div className="grid gap-0.5">
                        <p className="text-sm font-medium leading-none">
                            {supervision.teacher}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {supervision.subject}
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">
                            {supervision.coordinator}
                        </p>
                        <p className="text-xs text-primary font-mono">
                            {supervision.startTime} - {supervision.endTime}
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

        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Lista de Supervisiones</CardTitle>
                <CardDescription>Historial y próximas supervisiones.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View - Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {supervisions.map((supervision) => (
                    <Card key={supervision.id} className="w-full rounded-xl">
                        <CardHeader>
                        <CardTitle className="text-base">{supervision.teacher}</CardTitle>
                        <CardDescription>{supervision.subject}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                        <p><span className="font-semibold">Coordinador:</span> {supervision.coordinator}</p>
                        <p><span className="font-semibold">Fecha:</span> {format(supervision.date, "P", { locale: es })}</p>
                        <p><span className="font-semibold">Horario:</span> <span className="text-primary font-mono">{supervision.startTime} - {supervision.endTime}</span></p>
                        <p><span className="font-semibold">Grupo:</span> {getGroupName(supervision.groupId)}</p>
                        <div className="flex items-center justify-between pt-2">
                            <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                {supervision.status}
                            </Badge>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>

                {/* Desktop View - Table */}
                <ScrollArea className="hidden md:block h-auto max-h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Docente</TableHead>
                                <TableHead>Coordinador</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisions.map((supervision) => (
                                <TableRow key={supervision.id}>
                                    <TableCell className="font-medium py-2">{supervision.teacher}</TableCell>
                                    <TableCell className="font-medium py-2">{supervision.coordinator}</TableCell>
                                    <TableCell className="py-2">{format(supervision.date, "P", { locale: es })}</TableCell>
                                    <TableCell className="py-2 text-primary font-mono">{supervision.startTime} - {supervision.endTime}</TableCell>
                                    <TableCell className="py-2">{getGroupName(supervision.groupId)}</TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                            {supervision.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
