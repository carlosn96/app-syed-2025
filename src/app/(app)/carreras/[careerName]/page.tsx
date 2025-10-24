
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
import { Career, Subject, CareerSummary, Modality } from "@/lib/modelos"
import { Button } from "@/components/ui/button"
import { Book, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { getCareers, getSubjects, deleteCareer, getModalities } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { EditStudyPlanForm } from "@/components/edit-study-plan-form"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { AssignModalityForm } from "@/components/assign-modality-form";


export default function CareerPlansPage() {
  const params = useParams();
  const careerName = decodeURIComponent(params.careerName as string);
  const toast = useRef<Toast>(null);
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalityToEdit, setModalityToEdit] = useState<Career | null>(null);
  const [modalityToDelete, setModalityToDelete] = useState<Career | null>(null);
  
  const { user } = useAuth();

  const [allCareers, setAllCareers] = useState<CareerSummary[]>([]);
  const [careerDetails, setCareerDetails] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allModalities, setAllModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  const fetchData = async () => {
      try {
        setIsLoading(true);
        const [careersData, subjectsData, modalitiesData] = await Promise.all([
          getCareers(),
          getSubjects(),
          getModalities()
        ]);
        setAllCareers(careersData);
        setSubjects(subjectsData);
        setAllModalities(modalitiesData);
        
        const currentCareerSummary = careersData.find(c => c.name === careerName);
        if (currentCareerSummary?.modalities) {
            setCareerDetails(currentCareerSummary.modalities);
        }

        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [careerName]);

  const careerModalities = useMemo(() => {
    return careerDetails;
  }, [careerDetails]);

  const availableModalities = useMemo(() => {
    if (!allModalities || !careerModalities) return [];
    const assignedModalityNames = new Set(careerModalities.map(m => m.modality));
    return allModalities.filter(m => !assignedModalityNames.has(m.nombre));
  }, [allModalities, careerModalities]);

  const handleTabChange = (key: string, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [key]: value }));
  };

  const getOrdinal = (n: number) => {
    return `${n}°`;
  };

  const handleCreateSuccess = async (modalityName: string) => {
    setIsCreateModalOpen(false);
    await fetchData(); 
    toast.current?.show({
        severity: "success",
        summary: "Modalidad Agregada",
        detail: `La modalidad ${modalityName} se ha agregado a ${careerName} correctamente.`,
    });
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setModalityToEdit(null);
    fetchData();
  };

  const handleEditClick = (modality: Career) => {
    setModalityToEdit(modality);
    setIsEditModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!modalityToDelete) return;
    try {
      await deleteCareer(modalityToDelete.id);
      toast.current?.show({
        severity: "success",
        summary: "Plan de Estudio Eliminado",
        detail: `La modalidad ${modalityToDelete.modality} ha sido eliminada.`,
      });
      setModalityToDelete(null);
      fetchData();
      if (careerModalities.length === 1) { // If it was the last one
        router.push('/carreras');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
            severity: "error",
            summary: "Error al eliminar",
            detail: error.message,
        });
      }
    }
  };


  const renderSubjectTabs = (career: Career, uniqueKey: string) => {
    const filteredSubjects = subjects.filter(
      (subject) => subject.career === career.name && subject.modality === career.modality && subject.semester <= career.semesters
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
        value={activeTabs[uniqueKey] || defaultTabValue}
        onValueChange={(value) => handleTabChange(uniqueKey, value)}
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
              {getOrdinal(semester)}°
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  };
  
  const careerId = useMemo(() => allCareers.find(c => c.name === careerName)?.id, [allCareers, careerName]);


  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <FloatingBackButton />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            {`Planes de Estudio: ${careerName}`}
          </h1>
          <p className="text-muted-foreground">
              Modalidades disponibles para esta carrera.
          </p>
        </div>
        {user?.rol === 'administrador' && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                    <Button>Agregar Modalidad</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Modalidad</DialogTitle>
                        <DialogDescription>
                            Selecciona una modalidad para agregarla a la carrera {careerName}.
                        </DialogDescription>
                    </DialogHeader>
                    {careerId && <AssignModalityForm 
                        onSuccess={handleCreateSuccess} 
                        careerId={careerId}
                        availableModalities={availableModalities}
                    />}
                </DialogContent>
            </Dialog>
        )}
      </div>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Plan de Estudio</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la modalidad.
            </DialogDescription>
          </DialogHeader>
          {modalityToEdit && (
            <EditStudyPlanForm
              modality={modalityToEdit}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!modalityToDelete} onOpenChange={(open) => !open && setModalityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la modalidad 
                <span className="font-bold text-white"> {modalityToDelete?.modality}</span> de la carrera 
                <span className="font-bold text-white"> {modalityToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModalityToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


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
          {careerModalities.length > 0 ? careerModalities.map(modality => {
              const key = `${modality.name}-${modality.campus}-${modality.modality}`;
              return (
                  <Card key={modality.id} className="flex flex-col rounded-xl">
                      <CardHeader>
                          <div className="flex items-start justify-between">
                              <div>
                                  <CardTitle>{modality.modality}</CardTitle>
                                  <CardDescription>{modality.campus}</CardDescription>
                                  <p className="text-xs text-muted-foreground pt-2">{modality.coordinator}</p>
                              </div>
                              {user?.rol === 'administrador' && (
                                <div className="flex gap-2">
                                    <Button size="icon" variant="warning" onClick={() => handleEditClick(modality)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => setModalityToDelete(modality)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                    <Button asChild size="icon" variant="default">
                                        <Link href={`/subjects/assign/${modality.id}`}>
                                            <Book className="h-4 w-4" />
                                            <span className="sr-only">Gestionar Materias</span>
                                        </Link>
                                    </Button>
                                </div>
                              )}
                          </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow pb-2">
                          {renderSubjectTabs(modality, key)}
                      </CardContent>
                  </Card>
              )
          }) : (
              <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                  <h3 className="text-lg font-semibold text-white">No hay planes de estudio</h3>
                  <p className="text-muted-foreground mt-2">
                      Aún no se han creado planes de estudio para esta carrera. <br/>
                      {user?.rol === 'administrador' && `Usa el botón "Crear Plan de Estudio" para empezar.`}
                  </p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}

    

    