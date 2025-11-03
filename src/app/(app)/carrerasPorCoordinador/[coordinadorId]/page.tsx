
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BookCopy, Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Coordinador, AssignedCareer } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCoordinadorById, getCarrerasPorCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { normalizeString } from "@/lib/utils"


export default function CarrerasPorCoordinadorPage() {
  const params = useParams();
  const router = useRouter();
  const coordinadorId = Number(params.coordinadorId);

  const [coordinator, setCoordinator] = useState<Coordinador | null>(null);
  const [assignedCareers, setAssignedCareers] = useState<AssignedCareer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(coordinadorId)) {
        setError("ID de coordinador inválido.");
        setIsLoading(false);
        return;
    }

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [coordinatorData, careersData] = await Promise.all([
                getCoordinadorById(coordinadorId),
                getCarrerasPorCoordinador(coordinadorId)
            ]);
            // The API for getCoordinadorById returns a User, so we adapt it
            const adaptedCoordinator: Coordinador = {
              id_coordinador: coordinatorData.id, // Assuming user id is coordinator id
              usuario_id: coordinatorData.id,
              nombre_completo: `${coordinatorData.nombre} ${coordinatorData.apellido_paterno}`.trim(),
              correo: coordinatorData.correo,
              rol: coordinatorData.rol,
              fecha_registro: coordinatorData.fecha_registro,
              ultimo_acceso: coordinatorData.ultimo_acceso || ''
            };
            setCoordinator(adaptedCoordinator);
            setAssignedCareers(careersData);
        } catch (err: any) {
            setError(err.message || "Error al cargar los datos.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [coordinadorId]);

  const filteredCareers = useMemo(() => {
    if (!searchTerm) {
        return assignedCareers;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return assignedCareers.filter(career => 
        normalizeString(career.carrera).includes(normalizedSearchTerm)
    );
  }, [assignedCareers, searchTerm]);


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
    <div className="flex flex-col gap-8">
      <FloatingBackButton />
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras de {coordinator?.nombre_completo}
        </h1>
      </div>

       <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar carreras..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map(career => (
                <Card key={career.id_carrera} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{career.carrera}</CardTitle>
                        <CardDescription>ID de Carrera: {career.id_carrera}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                        <Button asChild variant="success" className="w-full">
                          <Link href={`/plan-estudio/${career.id_carrera}`}>
                            <BookCopy className="mr-2" />
                            Ver Planes de Estudio
                          </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
            <h3 className="text-lg font-semibold text-white">Sin Carreras Asignadas</h3>
            <p className="text-muted-foreground mt-2">
                Este coordinador no tiene ninguna carrera asignada actualmente.
            </p>
        </div>
      )}
    </div>
  )
}
