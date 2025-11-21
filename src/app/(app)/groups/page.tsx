
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Pencil, PlusCircle, Trash2, Search } from "lucide-react"
import { Toast } from 'primereact/toast';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

import { CreateGroupForm } from "@/components/create-group-form"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Group } from "@/lib/modelos"
import { getGroups, deleteGroup } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeString } from "@/lib/utils";

export default function GroupsPage() {
  const toast = useRef<Toast>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);


  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los grupos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    const normalizedSearchTerm = normalizeString(searchTerm);
    return groups.filter(group => 
        normalizeString(group.name).includes(normalizedSearchTerm) ||
        normalizeString(group.career).includes(normalizedSearchTerm) ||
        (group.cycle && normalizeString(group.cycle).includes(normalizedSearchTerm)) ||
        (group.turno && normalizeString(group.turno).includes(normalizedSearchTerm))
    );
  }, [groups, searchTerm]);


  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchGroups();
  };
  
  const handleDelete = async () => {
    if (!groupToDelete) return;
    try {
        await deleteGroup(groupToDelete.id);
        toast.current?.show({
            severity: "success",
            summary: "Grupo Eliminado",
            detail: `El grupo ${groupToDelete.name} ha sido eliminado.`,
        });
        setGroupToDelete(null);
        fetchGroups();
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


  if (error) {
    return <p className="text-destructive text-center">{error}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <Toast ref={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Gestión de Grupos
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar un nuevo grupo.
                    </DialogDescription>
                </DialogHeader>
                <CreateGroupForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
      </div>
      
       <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el grupo 
                <span className="font-bold text-white"> {groupToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Buscar grupos..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

       {isLoading ? (
         <>
            <div className="md:hidden flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
            <Card className="hidden md:block rounded-xl">
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
         </>
       ) : (
         <>
          {/* Mobile View - Card List */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>{group.career}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="warning">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => setGroupToDelete(group)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <Separator className="my-2"/>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                        <div className="font-semibold">Grado:</div>
                        <div>{group.semester}</div>
                        <div className="font-semibold">Ciclo:</div>
                        <div>{group.cycle}</div>
                        <div className="font-semibold">Turno:</div>
                        <div>{group.turno}</div>
                        <div className="font-semibold">Alumnos:</div>
                        <div>{group.students?.length || 0}</div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table */}
          <Card className="hidden md:block rounded-xl">
            <CardHeader>
              <CardTitle>Grupos</CardTitle>
              <CardDescription>
                Administra todos los grupos en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Alumnos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.career}</TableCell>
                      <TableCell>{group.semester}</TableCell>
                      <TableCell>{group.cycle}</TableCell>
                      <TableCell>{group.turno}</TableCell>
                      <TableCell>{group.students?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                            <Button size="icon" variant="warning">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => setGroupToDelete(group)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>1-{filteredGroups.length}</strong> de <strong>{groups.length}</strong> grupos
              </div>
            </CardFooter>
          </Card>
         </>
       )}
    </div>
  )
}

    