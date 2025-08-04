
"use client"
import { Pencil, Trash2, BookOpenCheck } from "lucide-react"
import Link from "next/link"
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
import { planteles } from "@/lib/data"

export default function CampusesPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Gestión de Planteles
      </h1>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Planteles</CardTitle>
          <CardDescription>
            Administra todos los planteles en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Director</TableHead>
                <TableHead>
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planteles.map((campus) => (
                <TableRow key={campus.id}>
                  <TableCell className="font-medium">{campus.name}</TableCell>
                  <TableCell>{campus.location}</TableCell>
                  <TableCell>{campus.director}</TableCell>
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
                      <Button asChild size="icon" variant="success">
                          <Link href={`/campuses/${campus.id}/carreras`}>
                              <BookOpenCheck className="h-4 w-4" />
                              <span className="sr-only">Planes de estudio</span>
                          </Link>
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
            Mostrando <strong>1-3</strong> de <strong>3</strong> planteles
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
