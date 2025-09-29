
"use client"
import { useState, useMemo, useEffect } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookCopy } from "lucide-react"
import { useParams } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Career, Plantel } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateCareerForm } from "@/components/create-career-form"
import { Input } from "@/components/ui/input"
import { FloatingButton } from "@/components/ui/floating-button"
import { useAuth } from "@/context/auth-context"
import { getCareers, getPlantelById } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FloatingBackButton } from "@/components/ui/floating-back-button"


interface GroupedCareer {
    name: string;
    campus: string;
    modalities: Career[];
}


export default function PlantelCarrerasPage() {
  const params = useParams();
  const plantelId = Number(params.plantelId);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [plantel, setPlantel] = useState<Plantel | null>(null);
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [plantelData, careersData] = await Promise.all([
          getPlantelById(plantelId),
          getCareers(),
        ]);
        setPlantel(plantelData);
        
        // This is a temporary solution since API doesn't filter by plantel
        const careersInPlantel = careersData
            .map(summary => summary.modalities || [])
            .flat()
            .filter(modality => modality.campus === plantelData.name);

        setAllCareers(careersInPlantel);

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [plantelId]);


  const groupedCareers = useMemo(() => {
    const groups: Record<string, GroupedCareer> = {};
    allCareers.forEach(career => {
        const key = `${career.name}-${career.campus}`;
        if (!groups[key]) {
            groups[key] = {
                name: career.name,
                campus: career.campus,
                modalities: [],
            };
        }
        groups[key].modalities.push(career);
    });
    return Object.values(groups);
  }, [allCareers]);


  const filteredGroupedCareers = groupedCareers.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.modalities.some(m => m.coordinator.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const renderCareerContent = (group: GroupedCareer) => {
    const key = `${group.name}-${group.campus}`;

    return (
         <Card key={key} className="flex flex-col rounded-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left w-full">
                  <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>{group.campus}</CardDescription>
                      <p className="text-xs text-muted-foreground pt-2">{group.modalities[0].coordinator}</p>
                  </div>
                   {user?.rol === 'administrador' && (
                    <div className="flex gap-2 shrink-0">
                        <Button size="icon" variant="warning">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button size="icon" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                    </div>
                   )}
              </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {group.modalities.length} {group.modalities.length === 1 ? 'modalidad' : 'modalidades'} disponible(s).
                </p>
            </CardContent>
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
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
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
      <FloatingBackButton />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                Carreras en {plantel.name}
            </h1>
            <p className="text-muted-foreground">Lista de carreras disponibles en este plantel.</p>
        </div>
        {user?.rol === 'administrador' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <FloatingButton text="Crear Carrera" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Carrera</DialogTitle>
                        <DialogDescription>
                            Completa el formulario para registrar una nueva carrera.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateCareerForm onSuccess={() => setIsModalOpen(false)} />
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
      
       {filteredGroupedCareers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredGroupedCareers.map(group => renderCareerContent(group))}
        </div>
       ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
            <h3 className="text-lg font-semibold text-white">No hay carreras</h3>
            <p className="text-muted-foreground mt-2">
                Aún no se han asignado carreras a este plantel.
            </p>
        </div>
       )}

    </div>
  )
}

    