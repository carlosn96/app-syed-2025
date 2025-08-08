
"use client"
import { Pencil, Trash2, BookOpenCheck, PlusCircle } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { CreatePlantelForm } from "@/components/create-plantel-form"

export default function CampusesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            Gestión de Planteles
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Plantel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Plantel</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar un nuevo plantel.
                    </DialogDescription>
                </DialogHeader>
                <CreatePlantelForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planteles.map((campus) => (
            <Card key={campus.id} className="rounded-xl">
                <CardHeader className="flex-row items-start justify-between">
                    <div className="flex-grow">
                        <CardTitle>{campus.name}</CardTitle>
                        <CardDescription>{campus.location}</CardDescription>
                        <p className="text-xs text-muted-foreground pt-2">{campus.director}</p>
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
                </CardHeader>
                <CardFooter>
                  <Button asChild size="sm" variant="success" className="w-full">
                      <Link href={`/campuses/${campus.id}/carreras`}>
                          <BookOpenCheck className="h-4 w-4" />
                          <span>Planes de estudio</span>
                      </Link>
                  </Button>
                </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  )
}
