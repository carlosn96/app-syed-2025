
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alumno } from "@/lib/modelos"
import { Input } from "@/components/ui/input"
import { getAlumnosForCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function CoordinadorAlumnosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allAlumnos, setAllAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlumnos = async () => {
    try {
      setIsLoading(true);
      const alumnosData = await getAlumnosForCoordinador();
      if (Array.isArray(alumnosData)) {
        setAllAlumnos(alumnosData);
      } else {
        setAllAlumnos([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los alumnos');
      console.error(err);
      setAllAlumnos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const filteredAlumnos = useMemo(() => {
    if (!searchTerm) {
        return allAlumnos;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allAlumnos.filter(alumno => {
        const fullName = normalizeString(alumno.nombre_completo);
        const email = normalizeString(alumno.correo);
        const career = alumno.carrera ? normalizeString(alumno.carrera) : '';

        return fullName.includes(normalizedSearchTerm) ||
               email.includes(normalizedSearchTerm) ||
               (career && career.includes(normalizedSearchTerm));
    });
  }, [allAlumnos, searchTerm]);

  const renderUserCard = (alumno: Alumno) => {
    const [name, ...restOfName] = (alumno.nombre_completo || '').split(' ');
    const lastName = restOfName.join(' ');
    
    return (
        <Card key={alumno.id_alumno}>
        <CardHeader>
            <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base">{`${name} ${lastName}`}</CardTitle>
                <CardDescription>{alumno.correo}</CardDescription>
            </div>
            <Badge variant="outline">Alumno</Badge>
            </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><span className="font-semibold">Matrícula:</span> {alumno.matricula}</p>
            <p><span className="font-semibold">Carrera:</span> {alumno.carrera || 'No asignada'}</p>
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
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Consulta de Alumnos
        </h1>
      </div>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar alumnos..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredAlumnos.map(renderUserCard)}
      </div>
    </div>
  )
}
