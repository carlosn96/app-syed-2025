
"use client"
import { Pencil, Trash2, BookCopy, PlusCircle, Search } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState, useEffect, useMemo, useRef } from "react"
import { CreatePlantelForm } from "@/components/create-plantel-form"
import { EditPlantelForm } from "@/components/edit-plantel-form"
import { Plantel } from "@/lib/modelos"
import { getPlanteles, deletePlantel } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from 'primereact/toast';
import { Input } from "@/components/ui/input"

export default function CampusesPage() {
    const toast = useRef<Toast>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [plantelToEdit, setPlantelToEdit] = useState<Plantel | null>(null);
    const [plantelToDelete, setPlantelToDelete] = useState<Plantel | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [planteles, setPlanteles] = useState<Plantel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchPlanteles();
    }, []);
    
    const filteredPlanteles = useMemo(() => {
        if (!searchTerm) {
          return planteles;
        }
        return planteles.filter(plantel => 
          plantel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plantel.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }, [planteles, searchTerm]);

    const handleSuccess = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        fetchPlanteles();
    }
    
    const handleEditClick = (plantel: Plantel) => {
        setPlantelToEdit(plantel);
        setIsEditModalOpen(true);
    }
    
    const handleDelete = async () => {
        if (!plantelToDelete) return;
        try {
            await deletePlantel(plantelToDelete.id);
            toast.current?.show({
                severity: "success",
                summary: "Plantel Eliminado",
                detail: `El plantel ${plantelToDelete.name} ha sido eliminado.`,
            });
            setPlantelToDelete(null);
            fetchPlanteles();
        } catch (error) {
            if (error instanceof Error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al eliminar",
                    detail: error.message,
                });
            }
        }
    }


  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            Gestión de Planteles
        </h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
                <CreatePlantelForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
      </div>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Plantel</DialogTitle>
            <DialogDescription>
              Modifica los detalles del plantel.
            </DialogDescription>
          </DialogHeader>
          {plantelToEdit && (
            <EditPlantelForm
              plantel={plantelToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!plantelToDelete} onOpenChange={(open) => !open && setPlantelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el plantel 
                <span className="font-bold text-white"> {plantelToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlantelToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar planteles..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {error && <p className="text-destructive text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
          ) : (
            filteredPlanteles.map((campus) => (
                <Card key={campus.id}>
                    <CardHeader className="flex-row items-start justify-between">
                        <div className="flex-grow">
                            <CardTitle>{campus.name}</CardTitle>
                            <CardDescription>{campus.location}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="warning" onClick={() => handleEditClick(campus)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => setPlantelToDelete(campus)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild size="sm" variant="success" className="w-full">
                          <Link href={`/planteles/${campus.id}/carreras`}>
                              <BookCopy className="h-4 w-4" />
                              <span>Ver Carreras</span>
                          </Link>
                      </Button>
                    </CardFooter>
                </Card>
            ))
          )}
      </div>
    </div>
  )
}
