
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Subject } from "@/lib/modelos"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { getMateriasForCoordinador } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function CoordinatorSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const subjectsData = await getMateriasForCoordinador();
      setAllSubjects(subjectsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) {
        return allSubjects;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return allSubjects.filter(subject => 
        normalizeString(subject.name).includes(normalizedSearchTerm)
    );
  }, [allSubjects, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Consulta de Materias
        </h1>
      </div>
      
      <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar materias..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <Card className="rounded-xl">
        <CardHeader>
            <CardTitle>Lista de Materias</CardTitle>
            <CardDescription>
                Materias asignadas a tus carreras.
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre de la Materia</TableHead>
                            <TableHead>Niveles Ofertados</TableHead>
                            <TableHead>Usada en Carreras</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubjects.map(subject => (
                            <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell>{subject.offeredLevels}</TableCell>
                                <TableCell>{subject.careerCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
