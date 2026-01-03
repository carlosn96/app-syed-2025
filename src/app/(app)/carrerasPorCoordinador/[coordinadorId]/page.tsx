
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BookCopy, Search, Plus, X, ChevronRight } from "lucide-react"
import { Toast } from 'primereact/toast'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Coordinador, AssignedCareer, CareerSummary } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import { Input } from "@/components/ui/input"
import { getCoordinadorById, getCarrerasPorCoordinador, getCareersWithoutCoordinator, assignCarreraToCoordinador, removeCarreraFromCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { normalizeString } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"


export default function CarrerasPorCoordinadorPage() {
  const params = useParams();
  const router = useRouter();
  const coordinadorId = Number(params.coordinadorId);

  const toast = useRef<Toast>(null);
  const [coordinator, setCoordinator] = useState<Coordinador | null>(null);
  const [assignedCareers, setAssignedCareers] = useState<AssignedCareer[]>([]);
  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [searchAssigned, setSearchAssigned] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningCareer, setActioningCareer] = useState<number | null>(null);

  useEffect(() => {
    if (isNaN(coordinadorId)) {
        setError("ID de coordinador inválido.");
        setIsLoading(false);
        return;
    }

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [coordinatorData, careersData, allCareersData] = await Promise.all([
                getCoordinadorById(coordinadorId),
                getCarrerasPorCoordinador(coordinadorId),
                getCareersWithoutCoordinator()
            ]);
            
            setCoordinator(coordinatorData);
            setAssignedCareers(careersData);
            setAllCareers(allCareersData);
        } catch (err: any) {
            setError(err.message || "Error al cargar los datos.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [coordinadorId]);

  const handleAssignCareer = async (carreraId: number, carreraName: string) => {
    setActioningCareer(carreraId);
    try {
      await assignCarreraToCoordinador({ 
        id_coordinador: coordinadorId, 
        id_carrera: carreraId 
      });
      toast.current?.show({
        severity: "success",
        summary: "Carrera Asignada",
        detail: `La carrera "${carreraName}" ha sido asignada al coordinador.`,
      });
      // Recargar carreras asignadas
      const careersData = await getCarrerasPorCoordinador(coordinadorId);
      setAssignedCareers(careersData);
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
          severity: "error",
          summary: "Error al asignar",
          detail: error.message,
        });
      }
    } finally {
      setActioningCareer(null);
    }
  };

  const handleRemoveCareer = async (carreraId: number, carreraName: string) => {
    setActioningCareer(carreraId);
    try {
      await removeCarreraFromCoordinador({ 
        id_coordinador: coordinadorId, 
        id_carrera: carreraId 
      });
      toast.current?.show({
        severity: "success",
        summary: "Carrera Removida",
        detail: `La carrera "${carreraName}" ha sido removida del coordinador.`,
      });
      // Recargar carreras asignadas
      const careersData = await getCarrerasPorCoordinador(coordinadorId);
      setAssignedCareers(careersData);
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
          severity: "error",
          summary: "Error al remover",
          detail: error.message,
        });
      }
    } finally {
      setActioningCareer(null);
    }
  };

  // Carreras disponibles (que no están asignadas)
  const availableCareers = useMemo(() => {
    return allCareers.filter(
      career => !assignedCareers.some(assigned => assigned.id_carrera === career.id)
    );
  }, [allCareers, assignedCareers]);

  // Filtrar carreras asignadas
  const filteredAssigned = useMemo(() => {
    if (!searchAssigned) return assignedCareers;
    const normalized = normalizeString(searchAssigned);
    return assignedCareers.filter(career => 
      normalizeString(career.carrera).includes(normalized)
    );
  }, [assignedCareers, searchAssigned]);

  // Filtrar carreras disponibles
  const filteredAvailable = useMemo(() => {
    if (!searchAvailable) return availableCareers;
    const normalized = normalizeString(searchAvailable);
    return availableCareers.filter(career => 
      normalizeString(career.name).includes(normalized)
    );
  }, [availableCareers, searchAvailable]);


  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
         <FloatingBackButton />
         <div className="flex flex-col">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
        <div className="flex flex-col gap-8 text-center">
            <FloatingBackButton />
            <p className="text-destructive">{error}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Toast ref={toast} />
      <FloatingBackButton />
      
      <div className="flex flex-col gap-2">
        <PageTitle>Gestión de Carreras</PageTitle>
        <p className="text-muted-foreground">
          Coordinador: <span className="font-semibold text-foreground">{coordinator?.nombre_completo}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Carreras Asignadas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Carreras Asignadas</CardTitle>
                <CardDescription>
                  {assignedCareers.length} {assignedCareers.length === 1 ? 'carrera' : 'carreras'} actualmente asignadas
                </CardDescription>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                {assignedCareers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar en asignadas..."
                className="pl-9"
                value={searchAssigned}
                onChange={(e) => setSearchAssigned(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredAssigned.length > 0 ? (
                filteredAssigned.map(career => (
                  <div
                    key={career.id_carrera}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{career.carrera}</p>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Link href={`/plan-estudio/${career.id_carrera}`}>
                          <BookCopy className="h-3 w-3 mr-1" />
                          Ver planes de estudio
                        </Link>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveCareer(career.id_carrera, career.carrera)}
                      disabled={actioningCareer === career.id_carrera}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                      {actioningCareer === career.id_carrera ? 'Removiendo...' : 'Quitar'}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <BookCopy className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Sin carreras asignadas</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchAssigned ? 'No se encontraron resultados' : 'Asigna carreras desde la lista disponible'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Columna derecha: Carreras Disponibles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Carreras Disponibles</CardTitle>
                <CardDescription>
                  {availableCareers.length} {availableCareers.length === 1 ? 'carrera' : 'carreras'} disponibles para asignar
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {availableCareers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar en disponibles..."
                className="pl-9"
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredAvailable.length > 0 ? (
                filteredAvailable.map(career => (
                  <div
                    key={career.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{career.name}</p>
                      {career.coordinator && (
                        <p className="text-xs text-muted-foreground truncate">
                          Coordinador actual: {career.coordinator}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAssignCareer(career.id, career.name)}
                      disabled={actioningCareer === career.id}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {actioningCareer === career.id ? 'Asignando...' : 'Asignar'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    {searchAvailable ? 'No se encontraron resultados' : 'Todas las carreras están asignadas'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!searchAvailable && 'Este coordinador tiene todas las carreras disponibles'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
