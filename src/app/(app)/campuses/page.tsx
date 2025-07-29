
"use client"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { campuses } from "@/lib/data"

export default function CampusesPage() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
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
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campuses.map((campus) => (
                <TableRow key={campus.id}>
                  <TableCell className="font-medium">{campus.name}</TableCell>
                  <TableCell>{campus.location}</TableCell>
                  <TableCell>{campus.director}</TableCell>
                  <TableCell>
                    <div
                      onMouseEnter={() => setOpenMenuId(campus.id)}
                      onMouseLeave={() => setOpenMenuId(null)}
                    >
                      <DropdownMenu open={openMenuId === campus.id} onOpenChange={(isOpen) => isOpen ? setOpenMenuId(campus.id) : setOpenMenuId(null)}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
