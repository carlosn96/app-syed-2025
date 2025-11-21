
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, BookCopy } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { CareerSummary } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCarrerasForCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";


export default function CoordinatorCareersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = async () => {
    try {
      setIsLoading(true);
      const careersData = await getCarrerasForCoordinador();
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

  const filteredCareers = useMemo(() => {
    if (!searchTerm) {
        return allCareers;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allCareers.filter(career => {
        const name = normalizeString(career.name);
        return name.includes(normalizedSearchTerm);
    });
  }, [allCareers, searchTerm]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      )
    }

    if (error) {
        return <p className="text-destructive text-center">{error}</p>
    }

    if (filteredCareers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                <h3 className="text-lg font-semibold text-white">No se encontraron carreras</h3>
                <p className="text-muted-foreground mt-2">
                    No tienes carreras asignadas o no hay resultados para tu búsqueda.
                </p>
            </div>
        )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => (
            <Card key={career.id} className="flex flex-col">
              <CardHeader>
                  <CardTitle>{career.name}</CardTitle>
                  
              </CardHeader>
              <CardFooter className="flex-col items-stretch gap-2 mt-auto">
                <Button asChild variant="success" className="w-full">
                    <Link href={`/plan-estudio/${career.id}`}>
                        <BookCopy className="mr-2 h-4 w-4" />
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
          Mis Carreras
        </h1>
      </div>
      
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
      
      {renderContent()}

    </div>
  )
}
