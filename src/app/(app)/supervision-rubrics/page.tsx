
"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, PlusCircle, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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
import { SupervisionRubric, SupervisionCriterion, EvaluationRubric, EvaluationCriterion } from "@/lib/modelos"
import { Badge } from "@/components/ui/badge"
import { CreateRubricForm } from "@/components/create-rubric-form"
import { CreateCriterionForm } from "@/components/create-criterion-form"
import { EditCriterionForm } from "@/components/edit-criterion-form"
import { EditRubricForm } from "@/components/edit-rubric-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupervisionRubrics, getEvaluationRubrics, deleteCriterion, deleteEvaluationCriterion, deleteEvaluationRubric } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import toast from 'react-hot-toast'
import { nullable } from "zod"

type RubricType = 'supervision' | 'evaluation';
type RubricCategory = 'Contable' | 'No Contable';

function normalizeItems(arr: any[], scope: string) {
  return (arr ?? []).map((it, i) => {
    const id =
      it.id ??
      it.id_rubro ??
      it.id_nc_rubro ??
      it.id_criterio ??
      it.id_nc_criterio ??
      it.uuid ??
      it.slug ??
      `idx-${i}`;
    return {
      ...it,
      __key: `${scope}-${id}` // clave única y estable
    };
  });
}

export default function SupervisionRubricsPage() {
  const [activeTab, setActiveTab] = useState<RubricType>('supervision');

  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false)
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false)
  const [isEditRubricModalOpen, setIsEditRubricModalOpen] = useState(false);
  const [isEditCriterionModalOpen, setIsEditCriterionModalOpen] = useState(false);

  const [selectedRubric, setSelectedRubric] = useState<SupervisionRubric | EvaluationRubric | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<SupervisionCriterion | EvaluationCriterion | null>(null);
  const [criterionToDelete, setCriterionToDelete] = useState<SupervisionCriterion | EvaluationCriterion | null>(null);
  const [rubricToDelete, setRubricToDelete] = useState<EvaluationRubric | null>(null);

  const [supervisionRubrics, setSupervisionRubrics] = useState<{ contable: SupervisionRubric[], noContable: SupervisionRubric[] }>({ contable: [], noContable: [] });
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

  const openCriterionModal = (rubric: SupervisionRubric | EvaluationRubric) => {
    setSelectedRubric(rubric)
    setIsCriterionModalOpen(true)
  }

  const openEditRubricModal = (rubric: SupervisionRubric | EvaluationRubric) => {
    setSelectedRubric(rubric);
    setIsEditRubricModalOpen(true);
  }

  const openEditCriterionModal = (criterion: SupervisionCriterion | EvaluationCriterion, rubric: SupervisionRubric | EvaluationRubric) => {
    const category = 'category' in rubric ? rubric.category as RubricCategory : undefined;
    setSelectedCriterion({ ...criterion, rubricCategory: category, rubricId: rubric.id });
    setIsEditCriterionModalOpen(true);
  }

  const handleDeleteCriterion = async () => {
    if (!criterionToDelete) return;

    try {
      if ('rubricCategory' in criterionToDelete && criterionToDelete.rubricCategory) {
        await deleteCriterion(criterionToDelete.id as number, criterionToDelete.rubricCategory as RubricCategory);
      } else {
        await deleteEvaluationCriterion(criterionToDelete.id as number);
      }
      toast.success(`El criterio ha sido eliminado correctamente.`);
      fetchRubrics();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setCriterionToDelete(null);
    }
  }

  const handleDeleteRubric = async () => {
    if (!rubricToDelete) return;
    try {
      await deleteEvaluationRubric(rubricToDelete.id);
      toast.success(`La rúbrica ha sido eliminada correctamente.`);
      fetchRubrics();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setRubricToDelete(null);
    }
  };


  const renderSupervisionRubricAccordion = (rubrics: SupervisionRubric[], category: RubricCategory) => {
    const rubricScope = category === 'Contable' ? 'sup-contables-rubros' : 'sup-nocontables-rubros';
    const criterionScope = category === 'Contable' ? 'sup-contables-criterios' : 'sup-nocontables-criterios';

    const normalizedRubrics = normalizeItems(rubrics, rubricScope);

    if (normalizedRubrics.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">No hay rubros en esta categoría.</p>
    }
    return (
      <Accordion type="multiple" className="w-full space-y-4">
        {normalizedRubrics.map((rubric) => (
          <AccordionItem
            value={`rubric-${rubric.id}`}
            key={rubric.__key}
            className="rounded-xl border-none"
          >
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex-1 text-left">
                <h3 className="font-semibold ">{rubric.title}</h3>
                <div className="flex gap-2 items-center mt-2">
                  <Badge variant={rubric.category === 'Contable' ? 'success' : 'secondary'}>
                    {rubric.category}
                  </Badge>
                  <p className="text-sm text-primary">
                    {rubric.criteria.length} criterios
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">

              {/* Botones superiores: Editar Rúbrica y Añadir Criterio */}
              <div className="flex justify-end mb-4 gap-2">
                <Button
                  key={`edit-${rubric.id}`}
                  variant="info"
                  size="sm"
                  onClick={() => openEditRubricModal(rubric)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Rúbrica
                </Button>

                <Button
                  key={`add-${rubric.id}`}
                  variant="info-outline"
                  size="sm"
                  onClick={() => openCriterionModal(rubric)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Criterio
                </Button>
              </div>

              {/* Lista de criterios */}
              {rubric.criteria.length > 0 ? (
                <ul className="space-y-3">
                  {normalizeItems(rubric.criteria, criterionScope).map((criterion) => (
                    <li
                      key={criterion.__key}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                    >
                      <p className="flex-1 text-sm">{criterion.text}</p>

                      {/* Menú de opciones para cada criterio */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {/* Editar criterio */}
                          <DropdownMenuItem
                            onClick={() => openEditCriterionModal(criterion, rubric)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar criterio
                          </DropdownMenuItem>

                          {/* Eliminar criterio */}
                          <DropdownMenuItem
                            onClick={() =>
                              setCriterionToDelete({
                                ...criterion,
                                rubricCategory: rubric.category,
                              })
                            }
                            className="text-red-600 hover:bg-red-100 focus:bg-red-100"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Eliminar criterio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay criterios para este rubro.
                </p>
              )}
            </AccordionContent>



          </AccordionItem>
        ))}
      </Accordion>
    )
  };

  const renderEvaluationRubricAccordion = (rubrics: EvaluationRubric[]) => {
    const normalizedRubrics = normalizeItems(rubrics, 'eval-rubros');
    if (normalizedRubrics.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">No hay rúbricas de evaluación.</p>
    }
    return (
      <Accordion type="multiple" className="w-full space-y-4">
        {normalizedRubrics.map((rubric) => (
          <AccordionItem
            value={`eval-rubric-${rubric.id}`}
            key={rubric.__key}
            className="rounded-xl border-none"
          >
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{rubric.name}</h3>
                <p className="text-sm text-primary mt-2">
                  {rubric.criteria.length} criterios de calificación
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="info" size="sm" onClick={() => openEditRubricModal(rubric)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Rúbrica
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setRubricToDelete(rubric)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Rúbrica
                </Button>
                <Button variant="info-outline" size="sm" onClick={() => openCriterionModal(rubric)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Criterio
                </Button>
              </div>
              {rubric.criteria.length > 0 ? (
                <ul className="space-y-3">
                  {normalizeItems(rubric.criteria, 'eval-criterios').map((criterion) => (
                    <li
                      key={criterion.__key}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                    >
                      <p className="flex-1 text-sm">{criterion.description}</p>

                      {/* Menú de opciones para cada criterio */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {/* Editar criterio */}
                          <DropdownMenuItem
                            onClick={() => openEditCriterionModal(criterion, rubric)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar criterio
                          </DropdownMenuItem>

                          {/* Eliminar criterio */}
                          <DropdownMenuItem
                            onClick={() => setCriterionToDelete(criterion)}
                            className="text-red-600 hover:bg-red-100 focus:bg-red-100"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Eliminar criterio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay criterios para esta categoría.
                </p>
              )}
            </AccordionContent>

          </AccordionItem>
        ))}
      </Accordion>
    )
  }


  if (error) {
    return <p className="text-destructive text-center">{error}</p>
  }

  const createSupervisionRubricButton = (
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
            Completa el formulario para registrar una nueva rúbrica de supervisión.
          </DialogDescription>
        </DialogHeader>
        <CreateRubricForm rubricType="supervision" onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );

  const createEvaluationRubricButton = (
    <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Rúbrica
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Rúbrica de Evaluación</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar una nueva rúbrica de evaluación docente.
          </DialogDescription>
        </DialogHeader>
        <CreateRubricForm rubricType="evaluation" onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageTitle>Gestión de Rúbricas</PageTitle>
      </div>

      {/* Modals */}
      <Dialog open={isCriterionModalOpen} onOpenChange={setIsCriterionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Criterio</DialogTitle>
            <DialogDescription>
              Escribe el texto para el nuevo criterio de evaluación para la rúbrica <strong>{selectedRubric?.name || selectedRubric?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          {selectedRubric && <CreateCriterionForm rubric={selectedRubric} rubricType={activeTab} onSuccess={handleSuccess} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditRubricModalOpen} onOpenChange={setIsEditRubricModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Rúbrica</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la rúbrica.
            </DialogDescription>
          </DialogHeader>
          {selectedRubric && <EditRubricForm rubric={selectedRubric} rubricType={activeTab} onSuccess={handleSuccess} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCriterionModalOpen} onOpenChange={setIsEditCriterionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Criterio</DialogTitle>
            <DialogDescription>
              Modifica el texto del criterio.
            </DialogDescription>
          </DialogHeader>
          {selectedCriterion && <EditCriterionForm criterion={selectedCriterion} rubricType={activeTab} onSuccess={handleSuccess} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!criterionToDelete} onOpenChange={(open) => !open && setCriterionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el criterio
              <span className="font-bold text-primary"> "{criterionToDelete && 'text' in criterionToDelete ? criterionToDelete.text : (criterionToDelete && 'description' in criterionToDelete ? criterionToDelete.description : '')}"</span>.
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

      <AlertDialog open={!!rubricToDelete} onOpenChange={(open) => !open && setRubricToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar la rúbrica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la rúbrica
              <span className="font-bold text-primary"> "{rubricToDelete?.name}"</span> y todos sus criterios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRubricToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRubric}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Rubros Contables</CardTitle>
                            <CardDescription>Criterios cuantitativos para la supervisión.</CardDescription>
                          </div>
                          {createSupervisionRubricButton}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderSupervisionRubricAccordion(supervisionRubrics.contable, 'Contable')}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="no-contable" className="mt-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Rubros No Contables</CardTitle>
                            <CardDescription>Criterios cualitativos para la supervisión.</CardDescription>
                          </div>
                          {createSupervisionRubricButton}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderSupervisionRubricAccordion(supervisionRubrics.noContable, 'No Contable')}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestor de Rúbricas de Evaluación Docente</CardTitle>
                  <CardDescription>
                    Administra las categorías y opciones para la evaluación de docentes por parte de los alumnos.
                  </CardDescription>
                </div>
                {createEvaluationRubricButton}
              </div>
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
