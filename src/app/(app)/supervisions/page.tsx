
"use client"

import { useState, useMemo } from "react"
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { supervisions as allSupervisions, groups } from "@/lib/data"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FloatingButton } from "@/components/ui/floating-button"
import { useAuth } from "@/context/auth-context"
import { Pencil } from "lucide-react"

export default function SupervisionsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const supervisions = useMemo(() => {
    if (user?.rol === 'coordinator') {
      const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
      return allSupervisions.filter(s => s.coordinator === coordinatorName);
    }
    return allSupervisions;
  }, [user]);

  const upcomingSupervisions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return supervisions
        .filter(s => s.date >= today && s.status === 'Programada')
        .slice(0, 5); // Take the next 5
  }, [supervisions]);


  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || "N/A";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Agenda
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <FloatingButton text="Agendar Cita" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita de Supervisión</DialogTitle>
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

       <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card className="rounded-xl h-full">
                 <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-full"
                        modifiers={{
                            scheduled: supervisions.map(s => s.date)
                        }}
                        modifiersClassNames={{
                            scheduled: 'bg-primary/20 text-primary-foreground rounded-full'
                        }}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
             <Card className="rounded-xl h-full">
                <CardHeader>
                    <CardTitle>Próximas Agendas</CardTitle>
                    <CardDescription>Las 5 citas más cercanas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingSupervisions.length > 0 ? (
                        <ul className="space-y-4">
                            {upcomingSupervisions.map(s => (
                                <li key={s.id} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center justify-center p-2 bg-primary/20 rounded-md">
                                        <span className="text-xs font-bold text-primary uppercase">{format(s.date, 'MMM', { locale: es })}</span>
                                        <span className="text-lg font-bold text-white">{format(s.date, 'dd')}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{s.teacher}</p>
                                        <p className="text-xs text-muted-foreground">{s.subject}</p>
                                        <p className="text-xs text-primary/80 font-mono">{s.startTime} - {s.endTime}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay citas próximas.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Historial de Agendas</CardTitle>
                <CardDescription>Historial y próximas citas agendadas.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View - Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {supervisions.map((supervision) => (
                    <Card key={supervision.id} className="w-full rounded-xl">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-base">{supervision.teacher}</CardTitle>
                                <CardDescription>{supervision.subject}</CardDescription>
                            </div>
                            {user?.rol === 'coordinator' && (
                                <div className="flex gap-2">
                                  {supervision.status === 'Programada' && (
                                    <Button size="icon" variant="warning">
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                    </Button>
                                  )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                        {user?.rol !== 'coordinator' && (
                            <p><span className="font-semibold">Coordinador:</span> {supervision.coordinator}</p>
                        )}
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
                <ScrollArea className="hidden md:block h-auto max-h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Docente</TableHead>
                                {user?.rol !== 'coordinator' && <TableHead>Coordinador</TableHead>}
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Estado</TableHead>
                                {user?.rol === 'coordinator' && <TableHead>Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisions.map((supervision) => (
                                <TableRow key={supervision.id}>
                                    <TableCell className="font-medium py-3">{supervision.teacher}</TableCell>
                                    {user?.rol !== 'coordinator' && <TableCell className="font-medium py-3">{supervision.coordinator}</TableCell>}
                                    <TableCell className="py-3">{format(supervision.date, "P", { locale: es })}</TableCell>
                                    <TableCell className="py-3 text-primary font-mono">{supervision.startTime} - {supervision.endTime}</TableCell>
                                    <TableCell className="py-3">{getGroupName(supervision.groupId)}</TableCell>
                                    <TableCell className="py-3">
                                        <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                            {supervision.status}
                                        </Badge>
                                    </TableCell>
                                    {user?.rol === 'coordinator' && (
                                      <TableCell className="py-3">
                                        {supervision.status === 'Programada' && (
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="warning">
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                            </div>
                                        )}
                                      </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  )
}
