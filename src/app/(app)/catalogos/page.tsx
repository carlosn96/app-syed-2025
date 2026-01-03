"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Pencil, Trash2, PlusCircle, Search, Calendar, Tag, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from 'primereact/toast'
import { normalizeString } from "@/lib/utils"
import { Periodo, CicloEscolar } from "@/lib/modelos"
import { getPeriodos, deletePeriodo, getCiclosEscolares, deleteCicloEscolar } from "@/services/api"
import { CreatePeriodoForm } from "@/components/create-periodo-form"
import { EditPeriodoForm } from "@/components/edit-periodo-form"
import { CreateCicloEscolarForm } from "@/components/create-ciclo-escolar-form"
import { EditCicloEscolarForm } from "@/components/edit-ciclo-escolar-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function CatalogosPage() {
  const toast = useRef<Toast>(null);
  const [activeTab, setActiveTab] = useState("periodos");

  // Periodos state
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [isPeriodosLoading, setIsPeriodosLoading] = useState(true);
  const [isCreatePeriodoOpen, setIsCreatePeriodoOpen] = useState(false);
  const [isEditPeriodoOpen, setIsEditPeriodoOpen] = useState(false);
  const [periodoToEdit, setPeriodoToEdit] = useState<Periodo | null>(null);
  const [periodoToDelete, setPeriodoToDelete] = useState<Periodo | null>(null);
  const [periodosSearchTerm, setPeriodosSearchTerm] = useState("");

  // Ciclos Escolares state
  const [ciclosEscolares, setCiclosEscolares] = useState<CicloEscolar[]>([]);
  const [isCiclosLoading, setIsCiclosLoading] = useState(true);
  const [isCreateCicloOpen, setIsCreateCicloOpen] = useState(false);
  const [isEditCicloOpen, setIsEditCicloOpen] = useState(false);
  const [cicloToEdit, setCicloToEdit] = useState<CicloEscolar | null>(null);
  const [cicloToDelete, setCicloToDelete] = useState<CicloEscolar | null>(null);
  const [ciclosSearchTerm, setCiclosSearchTerm] = useState("");

  // Fetch Periodos
  const fetchPeriodos = async () => {
    try {
      setIsPeriodosLoading(true);
      const data = await getPeriodos();
      setPeriodos(data);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || 'Error al cargar los periodos',
      });
    } finally {
      setIsPeriodosLoading(false);
    }
  };

  // Fetch Ciclos Escolares
  const fetchCiclosEscolares = async () => {
    try {
      setIsCiclosLoading(true);
      const data = await getCiclosEscolares();
      setCiclosEscolares(data);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || 'Error al cargar los ciclos escolares',
      });
    } finally {
      setIsCiclosLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
    fetchCiclosEscolares();
  }, []);

  // Filter Periodos
  const filteredPeriodos = useMemo(() => {
    if (!periodosSearchTerm) return periodos;
    const normalized = normalizeString(periodosSearchTerm);
    return periodos.filter(p => normalizeString(p.nombre).includes(normalized));
  }, [periodos, periodosSearchTerm]);

  // Filter Ciclos Escolares
  const filteredCiclos = useMemo(() => {
    if (!ciclosSearchTerm) return ciclosEscolares;
    const normalized = normalizeString(ciclosSearchTerm);
    return ciclosEscolares.filter(c => 
      normalizeString(c.anio.toString()).includes(normalized) ||
      normalizeString(c.periodo_nombre || '').includes(normalized)
    );
  }, [ciclosEscolares, ciclosSearchTerm]);

  // Periodo Handlers
  const handlePeriodoSuccess = (message: { summary: string, detail: string }) => {
    toast.current?.show({ severity: 'success', ...message });
    setIsCreatePeriodoOpen(false);
    setIsEditPeriodoOpen(false);
    fetchPeriodos();
  };

  const handleEditPeriodo = (periodo: Periodo) => {
    setPeriodoToEdit(periodo);
    setIsEditPeriodoOpen(true);
  };

  const handleDeletePeriodo = async () => {
    if (!periodoToDelete) return;
    try {
      await deletePeriodo(periodoToDelete.id);
      toast.current?.show({
        severity: "success",
        summary: "Periodo Eliminado",
        detail: `El periodo ${periodoToDelete.nombre} ha sido eliminado.`,
      });
      setPeriodoToDelete(null);
      fetchPeriodos();
      fetchCiclosEscolares();
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

  // Ciclo Escolar Handlers
  const handleCicloSuccess = (message: { summary: string, detail: string }) => {
    toast.current?.show({ severity: 'success', ...message });
    setIsCreateCicloOpen(false);
    setIsEditCicloOpen(false);
    fetchCiclosEscolares();
  };

  const handleEditCiclo = (ciclo: CicloEscolar) => {
    setCicloToEdit(ciclo);
    setIsEditCicloOpen(true);
  };

  const handleDeleteCiclo = async () => {
    if (!cicloToDelete) return;
    try {
      await deleteCicloEscolar(cicloToDelete.id_ciclo);
      toast.current?.show({
        severity: "success",
        summary: "Ciclo Escolar Eliminado",
        detail: `El ciclo escolar ${cicloToDelete.anio}-${cicloToDelete.periodo_nombre} ha sido eliminado.`,
      });
      setCicloToDelete(null);
      fetchCiclosEscolares();
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

  return (
    <div className="flex flex-col gap-6">
      <Toast ref={toast} />
      
      <div>
        <PageTitle>Gestión de Catálogos</PageTitle>
        <p className="mt-2 text-muted-foreground">
          Administra los catálogos de periodos y ciclos escolares del sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="periodos" className="gap-2">
              <Tag className="h-4 w-4" />
              Periodos
            </TabsTrigger>
            <TabsTrigger value="ciclos" className="gap-2">
              <Calendar className="h-4 w-4" />
              Ciclos Escolares
            </TabsTrigger>
          </TabsList>

          {activeTab === "periodos" ? (
            <Dialog open={isCreatePeriodoOpen} onOpenChange={setIsCreatePeriodoOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Periodo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Periodo</DialogTitle>
                  <DialogDescription>Ingresa la información del nuevo periodo</DialogDescription>
                </DialogHeader>
                <CreatePeriodoForm onSuccess={handlePeriodoSuccess} />
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isCreateCicloOpen} onOpenChange={setIsCreateCicloOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Ciclo Escolar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Ciclo Escolar</DialogTitle>
                  <DialogDescription>Ingresa la información del nuevo ciclo escolar</DialogDescription>
                </DialogHeader>
                <CreateCicloEscolarForm onSuccess={handleCicloSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* PERIODOS TAB */}
        <TabsContent value="periodos" className="mt-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar periodo..."
              className="pl-9"
              value={periodosSearchTerm}
              onChange={(e) => setPeriodosSearchTerm(e.target.value)}
            />
          </div>

          {isPeriodosLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPeriodos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Tag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  {periodosSearchTerm ? "No se encontraron periodos con ese criterio" : "No hay periodos registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPeriodos.map((periodo) => (
                <div
                  key={periodo.id}
                  className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{periodo.nombre}</h3>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPeriodo(periodo)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setPeriodoToDelete(periodo)}
                        className="text-destructive focus:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CICLOS ESCOLARES TAB */}
        <TabsContent value="ciclos" className="mt-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ciclo escolar..."
              className="pl-9"
              value={ciclosSearchTerm}
              onChange={(e) => setCiclosSearchTerm(e.target.value)}
            />
          </div>

          {isCiclosLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : filteredCiclos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  {ciclosSearchTerm ? "No se encontraron ciclos escolares con ese criterio" : "No hay ciclos escolares registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredCiclos.map((ciclo) => (
                <div
                  key={ciclo.id_ciclo}
                  className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 ring-2 ring-blue-500/20">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {ciclo.anio}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {ciclo.periodo_nombre || `Periodo ${ciclo.id_cat_periodo}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCiclo(ciclo)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setCicloToDelete(ciclo)}
                        className="text-destructive focus:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Periodo Dialog */}
      <Dialog open={isEditPeriodoOpen} onOpenChange={setIsEditPeriodoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Periodo</DialogTitle>
            <DialogDescription>Modifica la información del periodo</DialogDescription>
          </DialogHeader>
          {periodoToEdit && (
            <EditPeriodoForm
              periodo={periodoToEdit}
              onSuccess={handlePeriodoSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Ciclo Escolar Dialog */}
      <Dialog open={isEditCicloOpen} onOpenChange={setIsEditCicloOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ciclo Escolar</DialogTitle>
            <DialogDescription>Modifica la información del ciclo escolar</DialogDescription>
          </DialogHeader>
          {cicloToEdit && (
            <EditCicloEscolarForm
              ciclo={cicloToEdit}
              onSuccess={handleCicloSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Periodo Alert Dialog */}
      <AlertDialog open={!!periodoToDelete} onOpenChange={(open) => !open && setPeriodoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el periodo <span className="font-semibold text-foreground">{periodoToDelete?.nombre}</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePeriodo}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Ciclo Escolar Alert Dialog */}
      <AlertDialog open={!!cicloToDelete} onOpenChange={(open) => !open && setCicloToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el ciclo escolar <span className="font-semibold text-foreground">{cicloToDelete?.anio}-{cicloToDelete?.periodo_nombre}</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCiclo}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}