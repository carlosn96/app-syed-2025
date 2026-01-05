
"use client"
import { Pencil, Trash2, BookCopy, PlusCircle, Search, Grid3X3, List } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/layout/page-title"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState, useEffect, useMemo, useRef } from "react"
import { CreatePlantelForm } from "@/components/create-plantel-form"
import { EditPlantelForm } from "@/components/edit-plantel-form"
import { PlantelesList } from "@/components/planteles/planteles-list"
import { Plantel } from "@/lib/modelos"
import { getPlanteles, deletePlantel } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from 'primereact/toast';
import { Input } from "@/components/ui/input"
import { normalizeString } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CampusesPage() {
  const toast = useRef<Toast>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [plantelToEdit, setPlantelToEdit] = useState<Plantel | null>(null);
  const [plantelToDelete, setPlantelToDelete] = useState<Plantel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanteles = async () => {
    try {
      setIsLoading(true);
      const data = await getPlanteles();
      setPlanteles(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los planteles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanteles();
  }, []);

  const filteredPlanteles = useMemo(() => {
    if (!searchTerm) {
      return planteles;
    }
    const normalizedSearchTerm = normalizeString(searchTerm);
    return planteles.filter(plantel =>
      normalizeString(plantel.name).includes(normalizedSearchTerm) ||
      normalizeString(plantel.location).includes(normalizedSearchTerm)
    );
  }, [planteles, searchTerm]);

  const handleSuccess = (message: { summary: string, detail: string }) => {
    toast.current?.show({ severity: 'success', ...message });
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    fetchPlanteles();
  }

  const handleEditClick = (plantel: Plantel) => {
    setPlantelToEdit(plantel);
    setIsEditModalOpen(true);
  }

  const handleDelete = async () => {
    if (!plantelToDelete) return;
    try {
      await deletePlantel(plantelToDelete.id);
      toast.current?.show({
        severity: "success",
        summary: "Plantel Eliminado",
        detail: `El plantel ${plantelToDelete.name} ha sido eliminado.`,
      });
      setPlantelToDelete(null);
      fetchPlanteles();
    } catch (error) {
      if (error instanceof Error) {
        toast.current?.show({
          severity: "error",
          summary: "Error al eliminar",
          detail: error.message,
        });
      }
    }
  }

  const handleBulkDelete = async (plantelIds: number[]) => {
    try {
      await Promise.all(plantelIds.map(id => deletePlantel(id)));
      toast.current?.show({
        severity: "success",
        summary: "Planteles Eliminados",
        detail: `${plantelIds.length} plantel${plantelIds.length !== 1 ? 'es' : ''} ${plantelIds.length !== 1 ? 'han' : 'ha'} sido eliminado${plantelIds.length !== 1 ? 's' : ''} correctamente.`,
      });
      fetchPlanteles();
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
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageTitle>Gestión de Planteles</PageTitle>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Plantel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plantel</DialogTitle>
              <DialogDescription>
                Completa el formulario para registrar un nuevo plantel.
              </DialogDescription>
            </DialogHeader>
            <CreatePlantelForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Plantel</DialogTitle>
            <DialogDescription>
              Modifica los detalles del plantel.
            </DialogDescription>
          </DialogHeader>
          {plantelToEdit && (
            <EditPlantelForm
              plantel={plantelToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!plantelToDelete} onOpenChange={(open) => !open && setPlantelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el plantel
              <span className="font-bold text-primary"> {plantelToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlantelToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar planteles..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'gallery' ? 'default' : 'outline'}
            onClick={() => setViewMode('gallery')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Galería
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive text-center">{error}</p>}

      <PlantelesList
        planteles={filteredPlanteles}
        isLoading={isLoading}
        viewMode={viewMode}
        onEdit={handleEditClick}
        onDelete={(plantelId) => {
          const plantel = planteles.find(p => p.id === plantelId)
          if (plantel) setPlantelToDelete(plantel)
        }}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  )
}
