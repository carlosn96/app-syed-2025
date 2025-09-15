
"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, PlusCircle, ChevronDown } from "lucide-react"

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
import { SupervisionRubric, EvaluationRubric } from "@/lib/modelos"
import { Badge } from "@/components/ui/badge"
import { CreateRubricForm } from "@/components/create-rubric-form"
import { CreateCriterionForm } from "@/components/create-criterion-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupervisionRubrics } from "@/services/api" // Assuming getEvaluationRubrics exists too
import { Skeleton } from "@/components/ui/skeleton"

type RubricType = 'supervision' | 'evaluation';

export default function SupervisionRubricsPage() {
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false)
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false)
  const [selectedRubricId, setSelectedRubricId] = useState<number | null>(null)
  const [selectedRubricType, setSelectedRubricType] = useState<RubricType>('supervision');

  const [supervisionRubrics, setSupervisionRubrics] = useState<SupervisionRubric[]>([]);
  const [evaluationRubrics, setEvaluationRubrics] = useState<EvaluationRubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRubrics = async () => {
    setIsLoading(true);
    try {
      const [supervisionData] = await Promise.all([
        getSupervisionRubrics(),
        // getEvaluationRubrics() // TODO: Implement this in api.ts
      ]);
      setSupervisionRubrics(supervisionData);
      // setEvaluationRubrics(evaluationData);
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
    fetchRubrics()
  }

  const openCriterionModal = (rubricId: number, type: RubricType) => {
    setSelectedRubricId(rubricId)
    setSelectedRubricType(type)
    setIsCriterionModalOpen(true)
  }

  const supervisionRubricsContable = supervisionRubrics.filter(
    (r) => r.category === "Contable"
  )
  const supervisionRubricsNoContable = supervisionRubrics.filter(
    (r) => r.category === "No Contable"
  )

  const renderSupervisionRubricAccordion = (rubrics: SupervisionRubric[], title: string) => (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
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
                  <Badge variant={rubric.type === 'checkbox' && rubric.category === 'Contable' ? 'success' : 'warning'}>
                    {rubric.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {rubric.criteria.length} criterios
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Rúbrica
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCriterionModal(rubric.id, 'supervision')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Criterio
                </Button>
              </div>
              <ul className="space-y-3">
                {rubric.criteria.map((criterion) => (
                  <li
                    key={criterion.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                  >
                    <p className="flex-1 text-sm">{criterion.text}</p>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="warning">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar criterio</span>
                      </Button>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar criterio</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
  
  const renderEvaluationRubricAccordion = (rubrics: EvaluationRubric[]) => (
     <Accordion type="multiple" className="w-full space-y-4">
        {rubrics.map((rubric) => (
          <AccordionItem
            value={`evaluation-rubric-${rubric.id}`}
            key={rubric.id}
            className="bg-white/10 rounded-xl border-none"
          >
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white">{rubric.category}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    {rubric.criteria.length} criterios
                </p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Categoría
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCriterionModal(rubric.id, 'evaluation')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Criterio
                </Button>
              </div>
              <ul className="space-y-3">
                {rubric.criteria.map((criterion) => (
                  <li
                    key={criterion.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/10"
                  >
                    <p className="flex-1 text-sm">{criterion.text}</p>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="warning">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar criterio</span>
                      </Button>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar criterio</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Rúbricas
        </h1>
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
        <Dialog open={isCriterionModalOpen} onOpenChange={setIsCriterionModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Criterio</DialogTitle>
                    <DialogDescription>
                       Escribe el texto para el nuevo criterio de evaluación.
                    </DialogDescription>
                </DialogHeader>
                <CreateCriterionForm rubricId={selectedRubricId} rubricType={selectedRubricType} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
      </div>

       <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Gestor de Rúbricas</CardTitle>
          <CardDescription>
            Administra las rúbricas y los criterios utilizados para las
            supervisiones de docentes y evaluaciones de alumnos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="supervision" onValueChange={(value) => setSelectedRubricType(value as RubricType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supervision">Supervisión</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluación</TabsTrigger>
            </TabsList>
            <TabsContent value="supervision" className="mt-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                  <div className="space-y-8">
                      {renderSupervisionRubricAccordion(supervisionRubricsContable, "Rubros Contables")}
                      {renderSupervisionRubricAccordion(supervisionRubricsNoContable, "Rubros No Contables")}
                  </div>
                )}
            </TabsContent>
            <TabsContent value="evaluation" className="mt-6">
              {isLoading ? (
                  <Skeleton className="h-20 w-full" />
              ) : (
                evaluationRubrics.length > 0 ? renderEvaluationRubricAccordion(evaluationRubrics) : <p className="text-muted-foreground text-center">No hay rúbricas de evaluación disponibles.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
