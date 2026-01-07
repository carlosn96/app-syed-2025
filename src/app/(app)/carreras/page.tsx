"use client"

import { useState, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import toast from 'react-hot-toast';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { getCareers, deleteCareer } from "@/services/api"
import { CreateCareerForm } from "@/components/create-career-form"
import { EditCareerForm } from "@/components/edit-career-form"
import { AssignCareerToCoordinatorForm } from "@/components/assign-career-to-coordinator-form"
import { CarrerasList } from "@/components/carreras/carreras-list"

export default function CareersPage() {
  const { user } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [careerToEdit, setCareerToEdit] = useState<CareerSummary | null>(null);
  const [careerToAssign, setCareerToAssign] = useState<CareerSummary | null>(null);
  const [careerToDelete, setCareerToDelete] = useState<CareerSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

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

  const handleSuccess = (message: { summary: string, detail: string }) => {
    toast.success(message.detail);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsAssignModalOpen(false);
    fetchCareers();
  };

  const handleEditClick = (career: CareerSummary) => {
    setCareerToEdit(career);
    setIsEditModalOpen(true);
  };

  const handleAssignClick = (career: CareerSummary) => {
    setCareerToAssign(career);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async () => {
    if (!careerToDelete) return;
    try {
      await deleteCareer(careerToDelete.id);
      toast.success(`La carrera ${careerToDelete.name} ha sido eliminada.`);
      setCareerToDelete(null);
      fetchCareers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleBulkDelete = async (careerIds: number[]) => {
    try {
      await Promise.all(careerIds.map(id => deleteCareer(id)));
      toast.success(`${careerIds.length} carrera${careerIds.length !== 1 ? 's' : ''} ${careerIds.length !== 1 ? 'han' : 'ha'} sido eliminada${careerIds.length !== 1 ? 's' : ''} correctamente.`);
      fetchCareers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Carreras
        </h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Carrera
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Carrera</DialogTitle>
              <DialogDescription>
                Escribe el nombre de la nueva carrera que deseas registrar.
              </DialogDescription>
            </DialogHeader>
            <CreateCareerForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Carrera</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la carrera.
            </DialogDescription>
          </DialogHeader>
          {careerToEdit && (
            <EditCareerForm
              career={careerToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Coordinador</DialogTitle>
            <DialogDescription>
              Selecciona un coordinador para la carrera <span className="font-bold text-foreground">{careerToAssign?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          {careerToAssign && (
            <AssignCareerToCoordinatorForm
              career={careerToAssign}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!careerToDelete} onOpenChange={(open) => !open && setCareerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la carrera
              <span className="font-bold text-primary"> {careerToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCareerToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CarrerasList
        careers={allCareers}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEdit={handleEditClick}
        onAssign={handleAssignClick}
        onDelete={(careerId) => {
          const career = allCareers.find(c => c.id === careerId)
          if (career) setCareerToDelete(career)
        }}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  )
}