
"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

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
import { planteles } from "@/lib/data"
import { CreatePlantelForm } from "@/components/create-plantel-form"

export default function PlantelesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
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

            {/* Mobile View - Card List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {planteles.map((plantel) => (
                <Card key={plantel.id}>
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
                        <Button size="icon" variant="destructive-outline">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
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
            <Card className="hidden md:block">
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
                            {planteles.map((plantel) => (
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
                                            <Button size="icon" variant="destructive-outline">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
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
                        Mostrando <strong>1-{planteles.length}</strong> de <strong>{planteles.length}</strong> planteles
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
