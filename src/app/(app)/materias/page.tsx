
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search } from "lucide-react"
import { Toast } from 'primereact/toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Subject } from "@/lib/modelos"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { getSubjects, deleteSubject } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateSubjectForm } from "@/components/create-subject-form"
import { EditSubjectForm } from "@/components/edit-subject-form"
import { normalizeString } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function SubjectsPage() {
  const toast = useRef<Toast>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const subjectsData = await getSubjects();
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

  const handleSuccess = (message: { summary: string, detail: string }) => {
    toast.current?.show({ severity: 'success', ...message });
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    fetchSubjects();
  };

  const handleEditClick = (subject: Subject) => {
    setSubjectToEdit(subject);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
        await deleteSubject(subjectToDelete.id);
        toast.current?.show({
            severity: "success",
            summary: "Materia Eliminada",
            detail: `La materia ${subjectToDelete.name} ha sido eliminada.`,
        });
        setSubjectToDelete(null);
        fetchSubjects();
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
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Materias
        </h1>
         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Materia
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Materia</DialogTitle>
                    <DialogDescription>
                        Escribe el nombre de la nueva materia que deseas registrar.
                    </DialogDescription>
                </DialogHeader>
                <CreateSubjectForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
      </div>
      
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la materia.
            </DialogDescription>
          </DialogHeader>
          {subjectToEdit && (
            <EditSubjectForm
              subject={subjectToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la materia
                <span className="font-bold text-white"> {subjectToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubjectToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                Materias disponibles en el sistema.
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
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
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubjects.map(subject => (
                            <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell>{subject.offeredLevels}</TableCell>
                                <TableCell>{subject.careerCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="warning" size="icon" onClick={() => handleEditClick(subject)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => setSubjectToDelete(subject)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Eliminar</span>
                                        </Button>
                                    </div>
                                </TableCell>
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
