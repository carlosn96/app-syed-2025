
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search, BookOpenCheck } from "lucide-react"
import Link from "next/link"
import { Toast } from 'primereact/toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { getCareers } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function CareersPage() {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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


  const filteredCareers = useMemo(() => {
    if (!searchTerm) {
      return allCareers;
    }
    return allCareers.filter(career => 
      career.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCareers, searchTerm]);


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
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras
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
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      {renderDefaultView()}

    </div>
  )
}
