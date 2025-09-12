
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FloatingButton } from "@/components/ui/floating-button"
import { useAuth } from "@/context/auth-context"
import { Pencil, ClipboardEdit, Eye } from "lucide-react"

export default function SupervisionsManagementPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supervisions = useMemo(() => {
    if (user?.rol === 'coordinador') {
      const coordinatorName = `${user.nombre} ${user.apellido_paterno}`.trim();
      return allSupervisions.filter(s => s.coordinator === coordinatorName);
    }
    return allSupervisions;
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score < 60) return 'hsl(var(--destructive))';
    if (score < 80) return 'hsl(var(--warning))';
    return 'hsl(var(--success))'; 
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Supervisiones
        </h1>
      </div>

      <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Lista de Supervisiones</CardTitle>
                <CardDescription>Aquí puedes ver el historial y evaluar las supervisiones programadas.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View - Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {supervisions.map((supervision) => (
                    <Card key={supervision.id} className="w-full rounded-xl">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-base">{supervision.teacher}</CardTitle>
                                <CardDescription>{supervision.career}</CardDescription>
                            </div>
                            {user?.rol === 'coordinador' && (
                                <div className="flex gap-2">
                                  {supervision.status === 'Programada' ? (
                                    <>
                                        <Button asChild size="icon" variant="success">
                                            <Link href={`/supervision/evaluate/${supervision.id}`}>
                                                <ClipboardEdit className="h-4 w-4" />
                                                <span className="sr-only">Evaluar</span>
                                            </Link>
                                        </Button>
                                    </>
                                  ) : (
                                    <Button asChild size="icon" variant="outline">
                                        <Link href={`/supervision/view/${supervision.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Ver Detalles</span>
                                        </Link>
                                    </Button>
                                  )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                        {user?.rol !== 'coordinador' && (
                            <p><span className="font-semibold">Coordinador:</span> {supervision.coordinator}</p>
                        )}
                        <p><span className="font-semibold">Fecha:</span> {supervision.date ? format(supervision.date, "P", { locale: es }) : 'N/A'}</p>
                        <p><span className="font-semibold">Horario:</span> <span className="text-primary font-mono">{supervision.startTime} - {supervision.endTime}</span></p>
                        <div className="flex items-center justify-between pt-2">
                            <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                {supervision.status}
                            </Badge>
                             {supervision.score !== undefined && (
                                <p className="font-bold text-lg" style={{ color: getScoreColor(supervision.score) }}>
                                    {supervision.score}%
                                </p>
                            )}
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
                                {user?.rol !== 'coordinador' && <TableHead>Coordinador</TableHead>}
                                <TableHead>Carrera</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Calificación</TableHead>
                                {user?.rol === 'coordinador' && <TableHead>Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisions.map((supervision) => (
                                <TableRow key={supervision.id}>
                                    <TableCell className="font-medium py-3">{supervision.teacher}</TableCell>
                                    {user?.rol !== 'coordinador' && <TableCell className="font-medium py-3">{supervision.coordinator}</TableCell>}
                                    <TableCell className="py-3">{supervision.career}</TableCell>
                                    <TableCell className="py-3">{supervision.date ? format(supervision.date, "P", { locale: es }) : 'N/A'}</TableCell>
                                    <TableCell className="py-3 text-primary font-mono">{supervision.startTime} - {supervision.endTime}</TableCell>
                                    <TableCell className="py-3">
                                        <Badge variant={supervision.status === 'Programada' ? 'warning' : 'success'}>
                                            {supervision.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 font-bold">
                                        {supervision.score !== undefined ? (
                                            <span style={{ color: getScoreColor(supervision.score) }}>
                                                {supervision.score}%
                                            </span>
                                        ) : 'N/A'}
                                    </TableCell>
                                    {user?.rol === 'coordinador' && (
                                      <TableCell className="py-3">
                                        {supervision.status === 'Programada' ? (
                                            <div className="flex gap-2">
                                                 <Button asChild size="icon" variant="success">
                                                    <Link href={`/supervision/evaluate/${supervision.id}`}>
                                                        <ClipboardEdit className="h-4 w-4" />
                                                        <span className="sr-only">Evaluar</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button asChild size="icon" variant="outline">
                                                    <Link href={`/supervision/view/${supervision.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">Ver Detalles</span>
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
  )
}
