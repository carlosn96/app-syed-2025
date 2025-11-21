
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Eye } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { User, Docente } from "@/lib/modelos"
import { Input } from "@/components/ui/input"
import { getDocentesForCoordinador, getDocentes } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function CoordinadorDocentesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allDocentes, setAllDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocentes = async () => {
    try {
      setIsLoading(true);
      const docentesData = await getDocentesForCoordinador();
       if (Array.isArray(docentesData)) {
        setAllDocentes(docentesData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los docentes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const filteredDocentes = useMemo(() => {
    if (!searchTerm) {
        return allDocentes;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allDocentes.filter(docente => {
        const fullName = normalizeString(docente.nombre_completo);
        const email = normalizeString(docente.correo);
        return fullName.includes(normalizedSearchTerm) || email.includes(normalizedSearchTerm);
    });
  }, [allDocentes, searchTerm]);

  const renderUserCard = (docente: Docente) => {
    return (
        <Card key={docente.id_docente}>
        <CardHeader>
            <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base">{docente.nombre_completo}</CardTitle>
                <CardDescription>{docente.correo}</CardDescription>
            </div>
            <Badge variant="outline">Docente</Badge>
            </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><span className="font-semibold">Grado Académico:</span> {docente.grado_academico}</p>
            <div className="flex justify-end gap-2 pt-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={`/users/teachers/${docente.id_docente}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Perfil</span>
                    </Link>
                </Button>
            </div>
        </CardContent>
        </Card>
    );
  };
  
  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
        <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Consulta de Docentes
        </h1>
      </div>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar docentes..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredDocentes.map(renderUserCard)}
      </div>
    </div>
  )
}
