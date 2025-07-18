import { Pencil, Trash2 } from "lucide-react"
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

export default function PlantelesPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="font-headline text-3xl font-semibold tracking-tight">
                Gestión de Planteles
            </h1>
            <Card>
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
                        Mostrando <strong>1-3</strong> de <strong>3</strong> planteles
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
