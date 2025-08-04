
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
import { Pencil, ClipboardEdit } from "lucide-react"

export default function SupervisionsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supervisions = useMemo(() => {
    if (user?.rol === 'coordinator') {
      const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
      return allSupervisions.filter(s => s.coordinator === coordinatorName);
    }
    return allSupervisions;
  }, [user]);


  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || "N/A";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Supervisiones
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <FloatingButton text="Agendar Supervisión" />
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
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-base">{supervision.teacher}</CardTitle>
                                <CardDescription>{supervision.subject}</CardDescription>
                            </div>
                            {user?.rol === 'coordinator' && (
                                <div className="flex gap-2">
                                  {supervision.status === 'Programada' && (
                                    <>
                                        <Button size="icon" variant="warning">
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <Button asChild size="icon" variant="success">
                                            <Link href={`/supervisions/evaluate/${supervision.id}`}>
                                                <ClipboardEdit className="h-4 w-4" />
                                                <span className="sr-only">Evaluar</span>
                                            </Link>
                                        </Button>
                                    </>
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
                <ScrollArea className="hidden md:block h-auto max-h-[400px]">
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
                                    <TableCell className="font-medium py-2">{supervision.teacher}</TableCell>
                                    {user?.rol !== 'coordinator' && <TableCell className="font-medium py-2">{supervision.coordinator}</TableCell>}
                                    <TableCell className="py-2">{format(supervision.date, "P", { locale: es })}</TableCell>
                                    <TableCell className="py-2 text-primary font-mono">{supervision.startTime} - {supervision.endTime}</TableCell>
                                    <TableCell className="py-2">{getGroupName(supervision.groupId)}</TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                            {supervision.status}
                                        </Badge>
                                    </TableCell>
                                    {user?.rol === 'coordinator' && (
                                      <TableCell className="py-2">
                                        {supervision.status === 'Programada' && (
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="warning">
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                 <Button asChild size="icon" variant="success">
                                                    <Link href={`/supervisions/evaluate/${supervision.id}`}>
                                                        <ClipboardEdit className="h-4 w-4" />
                                                        <span className="sr-only">Evaluar</span>
                                                    </Link>
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
    </div>
  )
}
