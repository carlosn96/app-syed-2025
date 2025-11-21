
"use client"
import { BookCopy, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState, useEffect, useMemo, useRef } from "react"
import { Plantel } from "@/lib/modelos"
import { getPlantelesForCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { normalizeString } from "@/lib/utils"

export default function CoordinatorCampusesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [planteles, setPlanteles] = useState<Plantel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlanteles = async () => {
        try {
            setIsLoading(true);
            const data = await getPlantelesForCoordinador();
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
        const normalizedSearchTerm = normalizeString(searchTerm);
        return planteles.filter(plantel => 
          normalizeString(plantel.name).includes(normalizedSearchTerm) ||
          normalizeString(plantel.location).includes(normalizedSearchTerm)
        );
      }, [planteles, searchTerm]);


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            Consulta de Planteles
        </h1>
      </div>
      
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
                    <CardHeader>
                        <div>
                            <CardTitle>{campus.name}</CardTitle>
                            <CardDescription>{campus.location}</CardDescription>
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
