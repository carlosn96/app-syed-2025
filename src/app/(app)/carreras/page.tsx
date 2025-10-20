
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookOpenCheck, UserPlus } from "lucide-react"
import Link from "next/link"
import { Toast } from 'primereact/toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { CareerSummary } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { getCareers, deleteCareer } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateCareerForm } from "@/components/create-career-form"
import { EditCareerForm } from "@/components/edit-career-form"
import { AssignCareerToCoordinatorForm } from "@/components/assign-career-to-coordinator-form"


export default function CareersPage() {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [careerToEdit, setCareerToEdit] = useState<CareerSummary | null>(null);
  const [careerToAssign, setCareerToAssign] = useState<CareerSummary | null>(null);
  const [careerToDelete, setCareerToDelete] = useState<CareerSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = async () => {
    try {
      setIsLoading(true);
      const careersData = await getCareers();
      setAllCareers(careersData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsAssignModalOpen(false);
    fetchCareers();
  };

  const handleEditClick = (career: CareerSummary) => {
    setCareerToEdit(career);
    setIsEditModalOpen(true);
  };
  
  const handleAssignClick = (career: CareerSummary) => {
    setCareerToAssign(career);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async () => {
    if (!careerToDelete) return;
    try {
        await deleteCareer(careerToDelete.id);
        toast.current?.show({
            severity: "success",
            summary: "Carrera Eliminada",
            detail: `La carrera ${careerToDelete.name} ha sido eliminada.`,
        });
        setCareerToDelete(null);
        fetchCareers();
    } catch (error) {
        if (error instanceof Error) {
            toast.current?.show({
                severity: "error",
                summary: "Error al eliminar",
                detail: error.message,
            });
        }
    }
  };


  const filteredCareers = useMemo(() => {
    if (!searchTerm) {
      return allCareers;
    }
    return allCareers.filter(career => 
      career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (career.coordinator && career.coordinator.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCareers, searchTerm]);


  const renderDefaultView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => (
            <Card key={career.id} className="flex flex-col">
              <CardHeader>
                  <CardTitle>{career.name}</CardTitle>
                  <CardDescription>{career.coordinator || 'Coordinador no asignado'}</CardDescription>
              </CardHeader>
              <CardFooter className="flex-col items-stretch gap-2 mt-auto">
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" variant="success">
                        <Link href={`/carreras/${encodeURIComponent(career.name)}`}>
                        <BookOpenCheck />
                        <span className="sr-only">Planes de Estudio</span>
                        </Link>
                    </Button>
                    <Button variant="info" className="flex-1" onClick={() => handleAssignClick(career)}>
                        <UserPlus />
                        <span className="sr-only">Asignar Coordinador</span>
                    </Button>
                    <Button variant="warning" className="flex-1" onClick={() => handleEditClick(career)}>
                        <Pencil />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1">
                                <Trash2 />
                                <span className="sr-only">Eliminar</span>
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la carrera
                                    <span className="font-bold text-white"> {career.name}</span>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => career.id && handleDelete(career.id)}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras
        </h1>
         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Carrera
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Carrera</DialogTitle>
                    <DialogDescription>
                        Escribe el nombre de la nueva carrera que deseas registrar.
                    </DialogDescription>
                </DialogHeader>
                <CreateCareerForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
      </div>
      
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Carrera</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la carrera.
            </DialogDescription>
          </DialogHeader>
          {careerToEdit && (
            <EditCareerForm
              career={careerToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
       <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Coordinador</DialogTitle>
            <DialogDescription>
              Selecciona un coordinador para la carrera <span className="font-bold text-white">{careerToAssign?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          {careerToAssign && (
            <AssignCareerToCoordinatorForm
              career={careerToAssign}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!careerToDelete} onOpenChange={(open) => !open && setCareerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la carrera 
                <span className="font-bold text-white"> {careerToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCareerToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
        <div className="relative w-full sm:max-w-xs flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar carreras..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      {renderDefaultView()}

    </div>
  )
}
