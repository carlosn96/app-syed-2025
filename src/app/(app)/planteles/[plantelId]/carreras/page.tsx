
"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookCopy } from "lucide-react"
import { useParams } from "next/navigation"
import { Toast } from 'primereact/toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Career, Plantel, CareerSummary } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
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

import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { getCarrerasPorPlantel, getPlantelById, removeCarreraFromPlantel, getCareers } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { AssignCareerToPlantelForm } from "@/components/assign-career-to-plantel-form"


interface AssignedCareer {
    id_carrera: number;
    carrera: string;
}

export default function PlantelCarrerasPage() {
  const params = useParams();
  const plantelId = Number(params.plantelId);
  const { user } = useAuth();
  const toast = useRef<Toast>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [careerToRemove, setCareerToRemove] = useState<AssignedCareer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [plantel, setPlantel] = useState<Plantel | null>(null);
  const [assignedCareers, setAssignedCareers] = useState<AssignedCareer[]>([]);
  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
      try {
        setIsLoading(true);
        const [plantelData, assignedCareersData, allCareersData] = await Promise.all([
          getPlantelById(plantelId),
          getCarrerasPorPlantel(plantelId),
          getCareers()
        ]);
        setPlantel(plantelData);
        setAssignedCareers(assignedCareersData);
        setAllCareers(allCareersData)

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [plantelId]);
  
  const handleSuccess = (message: { summary: string, detail: string }) => {
    toast.current?.show({ severity: 'success', ...message });
    setIsAssignModalOpen(false);
    fetchData();
  }
  
  const handleRemove = async () => {
    if (!careerToRemove || !plantel) return;
    try {
        await removeCarreraFromPlantel({ id_plantel: plantel.id, id_carrera: careerToRemove.id_carrera });
        toast.current?.show({
            severity: "success",
            summary: "Carrera Desasignada",
            detail: `La carrera ${careerToRemove.carrera} ha sido desasignada del plantel.`,
        });
        setCareerToRemove(null);
        fetchData();
    } catch (error) {
       if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al desasignar",
            detail: error.message,
        });
      }
    }
  }

  const filteredCareers = assignedCareers.filter(career => 
    career.carrera.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const unassignedCareers = useMemo(() => {
    const assignedIds = new Set(assignedCareers.map(c => c.id_carrera));
    return allCareers.filter(c => !assignedIds.has(c.id));
  }, [assignedCareers, allCareers]);

  const renderCareerContent = (career: AssignedCareer) => {
    return (
         <Card key={career.id_carrera} className="flex flex-col rounded-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left w-full">
                  <div>
                      <CardTitle>{career.carrera}</CardTitle>
                  </div>
                   {user?.rol === 'administrador' && (
                    <div className="flex gap-2 shrink-0">
                        <Button size="icon" variant="destructive" onClick={() => setCareerToRemove(career)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Desasignar</span>
                        </Button>
                    </div>
                   )}
              </div>
            </CardHeader>
        </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }


  if (!plantel) {
    return <div>Plantel no encontrado.</div>;
  }
  
  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <FloatingBackButton />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
            <PageTitle>Carreras en {plantel.name}</PageTitle>
            <p className="text-muted-foreground">Lista de carreras disponibles en este plantel.</p>
        </div>
        {user?.rol === 'administrador' && (
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Asignar Carrera
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Asignar Carrera al Plantel</DialogTitle>
                        <DialogDescription>
                            Selecciona una carrera de la lista para asignarla a {plantel.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <AssignCareerToPlantelForm 
                      plantelId={plantelId} 
                      availableCareers={unassignedCareers} 
                      onSuccess={handleSuccess} 
                    />
                </DialogContent>
            </Dialog>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar carreras..."
                className="pl-9 w-full sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
       {filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCareers.map(group => renderCareerContent(group))}
        </div>
       ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
            <h3 className="text-lg font-semibold text-white">No hay carreras</h3>
            <p className="text-muted-foreground mt-2">
                Aún no se han asignado carreras a este plantel.
            </p>
        </div>
       )}

      <AlertDialog open={!!careerToRemove} onOpenChange={(open) => !open && setCareerToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto desasignará la carrera 
                <span className="font-bold text-white"> {careerToRemove?.carrera}</span> del plantel 
                <span className="font-bold text-white"> {plantel?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCareerToRemove(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
