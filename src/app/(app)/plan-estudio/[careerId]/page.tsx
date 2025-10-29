
"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Toast } from 'primereact/toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Subject, CareerSummary } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { Book, Pencil, Trash2, PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { getCareers, getSubjects } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { CreateStudyPlanForm } from "@/components/create-study-plan-form"

interface CareerModality {
    id: number;
    name: string;
    modality: string;
    campus: string;
    semesters: number;
    coordinator: string;
}


export default function CareerPlansPage() {
  const params = useParams();
  const careerId = Number(params.careerId);
  const toast = useRef<Toast>(null);
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { user } = useAuth();

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [careerSummary, setCareerSummary] = useState<CareerSummary | null>(null);
  const [modalities, setModalities] = useState<CareerModality[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
      if (isNaN(careerId)) {
        setError("ID de carrera no válido.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [careersData, subjectsData] = await Promise.all([
          getCareers(),
          getSubjects(careerId),
        ]);
        
        const currentCareerSummary = careersData.find(c => c.id === careerId);
        if (currentCareerSummary) {
            setCareerSummary(currentCareerSummary);
        } else {
            setError("Carrera no encontrada.");
        }

        setAllSubjects(subjectsData);
        
        // Group subjects by modality to create the modality list
        const modalitiesMap = new Map<string, CareerModality>();
        subjectsData.forEach(subject => {
            if (!modalitiesMap.has(subject.modality)) {
                // Find semester count from a related career summary if possible, otherwise default
                const relatedModality = currentCareerSummary?.modalities?.find(m => m.modality === subject.modality);
                modalitiesMap.set(subject.modality, {
                    id: relatedModality?.id || Math.random(), // Use a stable ID if possible
                    name: subject.career,
                    modality: subject.modality,
                    campus: relatedModality?.campus || 'Desconocido',
                    semesters: relatedModality?.semesters || 10,
                    coordinator: relatedModality?.coordinator || 'No Asignado',
                });
            }
        });
        setModalities(Array.from(modalitiesMap.values()));

        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (careerId) {
      fetchData();
    }
  }, [careerId]);


  const renderSubjectTabs = (modality: CareerModality) => {
    const filteredSubjects = allSubjects.filter(
      (subject) => subject.modality === modality.modality
    );

    const semesters = Array.from(
      new Set(filteredSubjects.map((s) => s.semester))
    ).sort((a, b) => a - b);
    
    const defaultTabValue = semesters.length > 0 ? `sem-${semesters[0]}` : "";

    if (semesters.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            No hay materias asignadas para este plan de estudio aún.
          </p>
        </div>
      );
    }

    return (
      <Tabs
        defaultValue={defaultTabValue}
        className="flex flex-col flex-grow w-full p-6 pt-0"
      >
        <div className="flex-grow">
          {semesters.map((semester) => (
            <TabsContent key={semester} value={`sem-${semester}`}>
              <ul className="space-y-3">
                {filteredSubjects
                  .filter((s) => s.semester === semester)
                  .map((subject) => (
                    <li key={subject.id}>
                      <p className="font-medium">{subject.name}</p>
                    </li>
                  ))}
              </ul>
            </TabsContent>
          ))}
        </div>
        <TabsList
          className="grid w-full mt-4"
          style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0, 1fr))` }}
        >
          {semesters.map((semester) => (
            <TabsTrigger
              key={semester}
              value={`sem-${semester}`}
              className="text-xs"
            >
              {`${semester}°`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  };
  
  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <FloatingBackButton />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            {`Planes de Estudio: ${careerSummary?.name || 'Cargando...'}`}
          </h1>
          <p className="text-muted-foreground">
              Modalidades y planes de estudio disponibles para esta carrera.
          </p>
        </div>
      </div>

      {error && <p className="text-destructive text-center">{error}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                 <Card key={i} className="flex flex-col rounded-xl">
                    <CardHeader>
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pb-2">
                      <div className="flex-grow flex items-center justify-center p-6">
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modalities.length > 0 ? modalities.map(modality => {
              return (
                  <Card key={modality.id} className="flex flex-col rounded-xl">
                      <CardHeader>
                          <div className="flex items-start justify-between">
                              <div>
                                  <CardTitle>{modality.modality}</CardTitle>
                                  <CardDescription>{modality.campus}</CardDescription>
                                  <p className="text-xs text-muted-foreground pt-2">{modality.coordinator}</p>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow pb-2">
                          {renderSubjectTabs(modality)}
                      </CardContent>
                  </Card>
              )
          }) : (
              <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                  <h3 className="text-lg font-semibold text-white">No hay planes de estudio</h3>
                  <p className="text-muted-foreground mt-2">
                      Aún no se han creado planes de estudio para esta carrera.
                  </p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
