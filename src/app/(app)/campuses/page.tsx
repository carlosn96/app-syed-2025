
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { CreatePlantelForm } from "@/components/create-plantel-form"
import { getPlanteles } from "@/services/api"
import type { Plantel } from "@/lib/modelos"
import { Skeleton } from "@/components/ui/skeleton"

export default function CampusesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [planteles, setPlanteles] = useState<Plantel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchPlanteles = async () => {
            try {
                setIsLoading(true);
                const data = await getPlanteles();
                setPlanteles(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Error al cargar los planteles');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlanteles();
    }, []);

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

      {error && <p className="text-destructive text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
          ) : planteles.map((campus) => (
            <Card key={campus.id}>
                <CardHeader className="flex-row items-start justify-between">
                    <div className="flex-grow">
                        <CardTitle>{campus.name}</CardTitle>
                        <CardDescription>{campus.location}</CardDescription>
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
