
"use client"

import { useState, useMemo, useEffect } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookOpenCheck } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import { CreateCareerForm } from "@/components/create-career-form"
import { EditCareerForm } from "@/components/edit-career-form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { getCareers, deleteCareer } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function CareersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [careerToEdit, setCareerToEdit] = useState<CareerSummary | null>(null);
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
    fetchCareers();
  };

  const handleEditClick = (career: CareerSummary) => {
    setCareerToEdit(career);
    setIsEditModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!careerToDelete) return;
    try {
      await deleteCareer(careerToDelete.id);
      toast({
        variant: "success",
        title: "Carrera Eliminada",
        description: `La carrera ${careerToDelete.name} ha sido eliminada.`,
      });
      setCareerToDelete(null);
      fetchCareers();
    } catch (error) {
      if (error instanceof Error) {
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: error.message,
        });
      }
    }
  };

  const filteredCareers = useMemo(() => {
    let careersToProcess = allCareers;

    // Filter by search term
    if (searchTerm) {
      careersToProcess = careersToProcess.filter(career => 
        career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (career.coordinator && career.coordinator.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Group by name
    const grouped: { [key: string]: CareerSummary } = {};
    careersToProcess.forEach(career => {
        if (!grouped[career.name]) {
            grouped[career.name] = { ...career, totalPlanteles: 0, totalModalidades: 0, id: career.id };
        }
        grouped[career.name].totalPlanteles += 1; // This logic might need adjustment based on real data
        grouped[career.name].totalModalidades = grouped[career.name].totalModalidades + (career.totalModalidades || 1); // This logic might need adjustment
    });

    return Object.values(grouped);
  }, [allCareers, searchTerm]);


  const renderAdminView = () => {
    if (isLoading) {
      return (
        <Card className="rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
        <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Carreras</CardTitle>
              <CardDescription>
                Administra todas las carreras en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Coordinador</TableHead>
                    <TableHead>Materias</TableHead>
                    <TableHead>Planteles</TableHead>
                    <TableHead>Modalidades</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCareers.map((career) => (
                    <TableRow key={career.id}>
                      <TableCell className="font-medium">{career.name}</TableCell>
                      <TableCell>{career.coordinator || 'No asignado'}</TableCell>
                      <TableCell>{career.totalMaterias}</TableCell>
                      <TableCell>{career.totalPlanteles}</TableCell>
                      <TableCell>{career.totalModalidades}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                           <Button asChild size="icon" variant="success">
                                <Link href={`/carreras/${encodeURIComponent(career.name)}`}>
                                    <BookOpenCheck className="h-4 w-4" />
                                    <span className="sr-only">Planes de estudio</span>
                                </Link>
                            </Button>
                             <Button size="icon" variant="warning" onClick={() => handleEditClick(career)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => setCareerToDelete(career)}>
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
                Mostrando <strong>1-{filteredCareers.length}</strong> de <strong>{filteredCareers.length}</strong> carreras
              </div>
            </CardFooter>
        </Card>
    );
  }

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
                  <CardDescription>{career.coordinator || 'No asignado'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Materias:</span>
                    <Badge variant="info">{career.totalMaterias}</Badge>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Planteles:</span>
                    <Badge variant="info">{career.totalPlanteles}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modalidades:</span>
                    <Badge variant="info">{career.totalModalidades}</Badge>
                  </div>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" variant="success">
                    <Link href={`/carreras/${encodeURIComponent(career.name)}`}>
                      <BookOpenCheck className="mr-2 h-4 w-4" />
                      Ver Planes de Estudio
                    </Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras
        </h1>
        {user?.rol === 'administrador' && (
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
                            Completa el formulario para registrar una nueva carrera.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateCareerForm onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>
        )}
      </div>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Carrera</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la carrera.
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
      
      <AlertDialog open={!!careerToDelete} onOpenChange={(open) => !open && setCareerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la carrera 
                <span className="font-bold text-white"> {careerToDelete?.name}</span> y todos sus planes de estudio asociados.
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
      
      {user?.rol === 'administrador' ? renderAdminView() : renderDefaultView()}

    </div>
  )
}
