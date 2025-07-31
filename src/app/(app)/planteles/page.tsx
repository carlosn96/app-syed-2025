
"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookOpenCheck } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { planteles as allPlanteles } from "@/lib/data"
import { CreatePlantelForm } from "@/components/create-plantel-form"
import { Input } from "@/components/ui/input"
import { FloatingButton } from "@/components/ui/floating-button"

export default function PlantelesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPlanteles = allPlanteles.filter(plantel => 
        plantel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plantel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plantel.director.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Gestión de Planteles
                </h1>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                       <FloatingButton text="Crear Plantel" />
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar planteles..."
                        className="pl-9 w-full sm:w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile View - Card List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredPlanteles.map((plantel) => (
                <Card key={plantel.id} className="rounded-xl">
                    <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                        <CardTitle>{plantel.name}</CardTitle>
                        <CardDescription>{plantel.location}</CardDescription>
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
                         <Button asChild size="icon" variant="success">
                            <Link href={`/planteles/${plantel.id}/carreras`}>
                                <BookOpenCheck className="h-4 w-4" />
                                <span className="sr-only">Planes de estudio</span>
                            </Link>
                        </Button>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Director: </span>
                        {plantel.director}
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>

            {/* Desktop View - Table */}
            <Card className="hidden md:block rounded-xl">
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
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPlanteles.map((plantel) => (
                                <TableRow key={plantel.id}>
                                    <TableCell className="font-medium">{plantel.name}</TableCell>
                                    <TableCell>{plantel.location}</TableCell>
                                    <TableCell>{plantel.director}</TableCell>
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
                                                <Link href={`/planteles/${plantel.id}/carreras`}>
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
                        Mostrando <strong>1-{filteredPlanteles.length}</strong> de <strong>{allPlanteles.length}</strong> planteles
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
