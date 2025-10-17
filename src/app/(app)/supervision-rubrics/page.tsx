
"use client"

import { useState, useEffect, useRef } from "react"
import { Pencil, Trash2, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SupervisionRubric, SupervisionCriterion, EvaluationRubric } from "@/lib/modelos"
import { Badge } from "@/components/ui/badge"
import { CreateRubricForm } from "@/components/create-rubric-form"
import { CreateCriterionForm } from "@/components/create-criterion-form"
import { EditCriterionForm } from "@/components/edit-criterion-form"
import { EditRubricForm } from "@/components/edit-rubric-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupervisionRubrics, getEvaluationRubrics, deleteCriterion, createCriterion, updateCriterion, updateRubric } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from "primereact/toast"

type RubricType = 'supervision' | 'evaluation';

export default function SupervisionRubricsPage() {
  const toast = useRef<Toast>(null);
  const [activeTab, setActiveTab] = useState<RubricType>('supervision');

  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false)
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false)
  const [isEditRubricModalOpen, setIsEditRubricModalOpen] = useState(false);
  const [isEditCriterionModalOpen, setIsEditCriterionModalOpen] = useState(false);

  const [selectedRubric, setSelectedRubric] = useState<SupervisionRubric | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<SupervisionCriterion | null>(null);
  const [criterionToDelete, setCriterionToDelete] = useState<SupervisionCriterion | null>(null);
  
  const [supervisionRubrics, setSupervisionRubrics] = useState<SupervisionRubric[]>([]);
  const [evaluationRubrics, setEvaluationRubrics] = useState<EvaluationRubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRubrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [supervisionData, evaluationData] = await Promise.all([
        getSupervisionRubrics(),
        getEvaluationRubrics()
      ]);
      setSupervisionRubrics(supervisionData);
      setEvaluationRubrics(evaluationData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las rúbricas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, []);

  const handleSuccess = () => {
    setIsRubricModalOpen(false)
    setIsCriterionModalOpen(false)
    setIsEditRubricModalOpen(false)
    setIsEditCriterionModalOpen(false)
    fetchRubrics()
  }

  const openCriterionModal = (rubric: SupervisionRubric) => {
    setSelectedRubric(rubric)
    setIsCriterionModalOpen(true)
  }

  const openEditRubricModal = (rubric: SupervisionRubric) => {
    setSelectedRubric(rubric);
    setIsEditRubricModalOpen(true);
  }

  const openEditCriterionModal = (criterion: SupervisionCriterion, rubric: SupervisionRubric) => {
    setSelectedCriterion({ ...criterion, rubricCategory: rubric.category });
    setIsEditCriterionModalOpen(true);
  }
  
  const handleDeleteCriterion = async () => {
    if (!criterionToDelete || !criterionToDelete.rubricCategory) return;
    try {
        await deleteCriterion(criterionToDelete.id as number, criterionToDelete.rubricCategory );
        toast.current?.show({
            severity: "success",
            summary: "Criterio Eliminado",
            detail: `El criterio ha sido eliminado correctamente.`,
        });
        fetchRubrics();
    } catch (error) {
        if (error instanceof Error) {
            toast.current?.show({
                severity: "error",
                summary: "Error al eliminar",
                detail: error.message,
            });
        }
    } finally {
        setCriterionToDelete(null);
    }
  }


  const supervisionRubricsContable = supervisionRubrics.filter(
    (r) => r.category === "Contable"
  )
  const supervisionRubricsNoContable = supervisionRubrics.filter(
    (r) => r.category === "No Contable"
  )

  const renderSupervisionRubricAccordion = (rubrics: SupervisionRubric[]) => (
      <Accordion type="multiple" className="w-full space-y-4">
        {rubrics.map((rubric) => (
          <AccordionItem
            value={`rubric-${rubric.id}`}
            key={rubric.id}
            className="bg-white/10 rounded-xl border-none"
          >
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white">{rubric.title}</h3>
                <div className="flex gap-2 items-center mt-2">
                  <Badge variant={rubric.category === 'Contable' ? 'success' : 'warning'}>
                    {rubric.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {rubric.criteria.length} criterios
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex justify-end mb-4 gap-2">
                <Button key={`edit-${rubric.id}`} variant="outline" size="sm" onClick={() => openEditRubricModal(rubric)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Rúbrica
                </Button>
                <Button
                  key={`add-${rubric.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => openCriterionModal(rubric)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Criterio
                </Button>
              </div>
               {rubric.criteria.length > 0 ? (
                <ul className="space-y-3">
                    {rubric.criteria.map((criterion) => (
                    <li
                        key={criterion.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                    >
                        <p className="flex-1 text-sm">{criterion.text}</p>
                        <div className="flex gap-2 ml-4">
                          <Button size="icon" variant="warning" onClick={() => openEditCriterionModal(criterion, rubric)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar criterio</span>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => setCriterionToDelete({ ...criterion, rubricCategory: rubric.category })}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar criterio</span>
                          </Button>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay criterios para este rubro.</p>
                )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
  );

  const renderEvaluationRubricAccordion = (rubrics: EvaluationRubric[]) => (
     <Accordion type="multiple" className="w-full space-y-4">
        {rubrics.map((rubric) => (
          <AccordionItem
            value={`eval-rubric-${rubric.id}`}
            key={`eval-rubric-${rubric.id}`}
            className="bg-white/10 rounded-xl border-none"
          >
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white">{rubric.category}</h3>
                 <p className="text-sm text-muted-foreground mt-2">
                    {rubric.criteria.length} criterios de calificación
                  </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
                <div className="flex justify-end mb-4 gap-2">
                    {/* Future buttons for evaluation rubrics */}
                </div>
                {rubric.criteria.length > 0 ? (
                    <ul className="space-y-3">
                        {rubric.criteria.map((criterion) => (
                        <li
                            key={criterion.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                        >
                            <p className="flex-1 text-sm">{criterion.text}</p>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay criterios para esta categoría.</p>
                )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
  )


  if (error) {
    return <p className="text-destructive text-center">{error}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Rúbricas
        </h1>
        {activeTab === 'supervision' && (
            <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Rúbrica
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Crear Nueva Rúbrica</DialogTitle>
                <DialogDescription>
                    Completa el formulario para registrar una nueva rúbrica.
                </DialogDescription>
                </DialogHeader>
                <CreateRubricForm onSuccess={handleSuccess} />
            </DialogContent>
            </Dialog>
        )}
        
        {/* Add Criterion Modal */}
        <Dialog open={isCriterionModalOpen} onOpenChange={setIsCriterionModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Criterio</DialogTitle>
                    <DialogDescription>
                       Escribe el texto para el nuevo criterio de evaluación para la rúbrica <strong>{selectedRubric?.title}</strong>.
                    </DialogDescription>
                </DialogHeader>
                {selectedRubric && <CreateCriterionForm rubric={selectedRubric} onSuccess={handleSuccess} />}
            </DialogContent>
        </Dialog>

        {/* Edit Rubric Modal */}
        <Dialog open={isEditRubricModalOpen} onOpenChange={setIsEditRubricModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Rúbrica</DialogTitle>
                    <DialogDescription>
                       Modifica el nombre de la rúbrica.
                    </DialogDescription>
                </DialogHeader>
                {selectedRubric && <EditRubricForm rubric={selectedRubric} onSuccess={handleSuccess} />}
            </DialogContent>
        </Dialog>
        
        {/* Edit Criterion Modal */}
        <Dialog open={isEditCriterionModalOpen} onOpenChange={setIsEditCriterionModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Criterio</DialogTitle>
                    <DialogDescription>
                       Modifica el texto del criterio.
                    </DialogDescription>
                </DialogHeader>
                {selectedCriterion && <EditCriterionForm criterion={selectedCriterion} onSuccess={handleSuccess} />}
            </DialogContent>
        </Dialog>

         {/* Delete Criterion Alert */}
        <AlertDialog open={!!criterionToDelete} onOpenChange={(open) => !open && setCriterionToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el criterio
                    <span className="font-bold text-white"> "{criterionToDelete?.text}"</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCriterionToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCriterion}>
                    Confirmar
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>

       <Tabs defaultValue="supervision" onValueChange={(value) => setActiveTab(value as RubricType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supervision">Rúbricas de Supervisión</TabsTrigger>
                <TabsTrigger value="evaluation">Rúbricas de Evaluación</TabsTrigger>
            </TabsList>
            <TabsContent value="supervision" className="mt-6">
                <Card className="rounded-xl">
                    <CardHeader>
                    <CardTitle>Gestor de Rúbricas de Supervisión</CardTitle>
                    <CardDescription>
                        Administra las rúbricas y los criterios utilizados para las
                        supervisiones de docentes.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : (
                            <Tabs defaultValue="contable" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="contable">Rubros Contables</TabsTrigger>
                                <TabsTrigger value="no-contable">Rubros No Contables</TabsTrigger>
                            </TabsList>
                            <TabsContent value="contable" className="mt-6">
                                <Card>
                                <CardHeader>
                                    <CardTitle>Rubros Contables</CardTitle>
                                    <CardDescription>Criterios cuantitativos para la supervisión.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderSupervisionRubricAccordion(supervisionRubricsContable)}
                                </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="no-contable" className="mt-6">
                                <Card>
                                <CardHeader>
                                    <CardTitle>Rubros No Contables</CardTitle>
                                    <CardDescription>Criterios cualitativos para la supervisión.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderSupervisionRubricAccordion(supervisionRubricsNoContable)}
                                </CardContent>
                                </Card>
                            </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="evaluation" className="mt-6">
                 <Card className="rounded-xl">
                    <CardHeader>
                    <CardTitle>Gestor de Rúbricas de Evaluación Docente</CardTitle>
                    <CardDescription>
                        Administra las categorías y opciones para la evaluación de docentes por parte de los alumnos.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : (
                            renderEvaluationRubricAccordion(evaluationRubrics)
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
       </Tabs>
    </div>
  )
}
