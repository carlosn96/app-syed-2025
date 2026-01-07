
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Pencil, PlusCircle, Trash2, Search, QrCode, MoreVertical } from "lucide-react"
import toast from 'react-hot-toast';

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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Group } from "@/lib/modelos"
import { getGroups, deleteGroup } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateGroupForm } from "@/components/create-group-form"
import { EditGroupForm } from "@/components/edit-group-form"
import { normalizeString } from "@/lib/utils";

// Componente para mostrar el código QR con skeleton
interface QRCodeContentProps {
  group: Group;
}

function QRCodeContent({ group }: QRCodeContentProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Resetear el estado cuando cambia el grupo
  useEffect(() => {
    setImageLoaded(false);
  }, [group.id_grupo]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="bg-white p-4 rounded-lg">
        {!imageLoaded && (
          <Skeleton className="w-[200px] h-[200px]" />
        )}
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(group.codigo_inscripcion)}`}
          alt="Código QR"
          className={`w-[200px] h-[200px] ${!imageLoaded ? 'hidden' : ''}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <div className="w-full space-y-2">
        <p className="text-sm text-muted-foreground text-center">Código de inscripción:</p>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-center font-mono text-lg font-semibold tracking-wider">
            {group.codigo_inscripcion}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            navigator.clipboard.writeText(group.codigo_inscripcion);
            toast.success('Código copiado al portapapeles');
          }}
        >
          Copiar Código
        </Button>
      </div>
    </div>
  );
}

// Componente reutilizable para el menú de acciones
interface GroupActionsMenuProps {
  group: Group;
  onQRClick: (group: Group) => void;
  onEditClick: (group: Group) => void;
  onDeleteClick: (group: Group) => void;
}

function GroupActionsMenu({ group, onQRClick, onEditClick, onDeleteClick }: GroupActionsMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onQRClick(group)} className="cursor-pointer">
          <QrCode className="mr-2 h-4 w-4" />
          Ver código de Inscripción
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditClick(group)} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDeleteClick(group)}
          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupForQR, setGroupForQR] = useState<Group | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  
  // Filtros
  const [filterCarrera, setFilterCarrera] = useState<string>("");
  const [filterModalidad, setFilterModalidad] = useState<string>("");
  const [filterTurno, setFilterTurno] = useState<string>("");
  const [filterNivel, setFilterNivel] = useState<string>("");
  const [filterPlantel, setFilterPlantel] = useState<string>("");


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

  // Obtener valores únicos para los filtros
  const filterOptions = useMemo(() => {
    return {
      carreras: [...new Set(groups.map(g => g.carrera))].sort(),
      modalidades: [...new Set(groups.map(g => g.modalidad))].sort(),
      turnos: [...new Set(groups.map(g => g.turno))].sort(),
      niveles: [...new Set(groups.map(g => g.nivel))].sort(),
      planteles: [...new Set(groups.map(g => g.plantel).filter(Boolean))].sort(),
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let filtered = groups;
    
    // Filtro por búsqueda de texto
    if (searchTerm) {
      const normalizedSearchTerm = normalizeString(searchTerm);
      filtered = filtered.filter(group => 
        normalizeString(group.acronimo).includes(normalizedSearchTerm) ||
        normalizeString(group.carrera).includes(normalizedSearchTerm) ||
        (group.modalidad && normalizeString(group.modalidad).includes(normalizedSearchTerm))
      );
    }
    
    // Filtros por categoría
    if (filterCarrera) {
      filtered = filtered.filter(group => group.carrera === filterCarrera);
    }
    if (filterModalidad) {
      filtered = filtered.filter(group => group.modalidad === filterModalidad);
    }
    if (filterTurno) {
      filtered = filtered.filter(group => group.turno === filterTurno);
    }
    if (filterNivel) {
      filtered = filtered.filter(group => group.nivel === filterNivel);
    }
    if (filterPlantel) {
      filtered = filtered.filter(group => group.plantel === filterPlantel);
    }
    
    return filtered;
  }, [groups, searchTerm, filterCarrera, filterModalidad, filterTurno, filterNivel, filterPlantel]);


  const handleSuccess = (message: { summary: string, detail: string }) => {
    toast.success(message.detail);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    fetchGroups();
  };
  
  const clearFilters = () => {
    setFilterCarrera("");
    setFilterModalidad("");
    setFilterTurno("");
    setFilterNivel("");
    setFilterPlantel("");
  };

  const handleEditClick = (group: Group) => {
    setGroupToEdit(group);
    setIsEditModalOpen(true);
  };
  
  const handleQRClick = (group: Group) => {
    setGroupForQR(group);
    setIsQRModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!groupToDelete) return;
    try {
        await deleteGroup(groupToDelete.id_grupo);
        toast.success(`El grupo ${groupToDelete.acronimo} ha sido eliminado.`);
        setGroupToDelete(null);
        fetchGroups();
    } catch (error) {
        if (error instanceof Error) {
            toast.error(error.message);
        }
    }
  }


  if (error) {
    return <p className="text-destructive text-center">{error}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageTitle>Gestión de Grupos</PageTitle>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del grupo.
            </DialogDescription>
          </DialogHeader>
          {groupToEdit && (
            <EditGroupForm
              group={groupToEdit}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Código de Inscripción</DialogTitle>
            <DialogDescription>
              Escanea el código QR o copia el código de inscripción para este grupo.
            </DialogDescription>
          </DialogHeader>
          {groupForQR && (
            <QRCodeContent group={groupForQR} />
          )}
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el grupo 
                <span className="font-bold text-white"> {groupToDelete?.acronimo}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filtros */}
      <div className="flex flex-col gap-4">
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
        
        <div className="flex flex-wrap gap-3">
          <Select value={filterCarrera} onValueChange={(value) => setFilterCarrera(value === "_all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las carreras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todas las carreras</SelectItem>
              {filterOptions.carreras.map((carrera) => (
                <SelectItem key={carrera} value={carrera}>
                  {carrera}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterModalidad} onValueChange={(value) => setFilterModalidad(value === "_all" ? "" : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las modalidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todas las modalidades</SelectItem>
              {filterOptions.modalidades.map((modalidad) => (
                <SelectItem key={modalidad} value={modalidad}>
                  {modalidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTurno} onValueChange={(value) => setFilterTurno(value === "_all" ? "" : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todos los turnos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos los turnos</SelectItem>
              {filterOptions.turnos.map((turno) => (
                <SelectItem key={turno} value={turno}>
                  {turno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterNivel} onValueChange={(value) => setFilterNivel(value === "_all" ? "" : value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos los niveles</SelectItem>
              {filterOptions.niveles.map((nivel) => (
                <SelectItem key={nivel} value={nivel}>
                  {nivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPlantel} onValueChange={(value) => setFilterPlantel(value === "_all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los planteles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos los planteles</SelectItem>
              {filterOptions.planteles.map((plantel) => (
                <SelectItem key={plantel} value={plantel!}>
                  {plantel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterCarrera || filterModalidad || filterTurno || filterNivel || filterPlantel) && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

       {isLoading ? (
         <>
            <div className="md:hidden flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
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
       ) : filteredGroups.length === 0 ? (
         <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-primary rounded-xl">
           <h3 className="text-lg font-semibold text-primary">No hay grupos</h3>
           <p className="text-muted-foreground mt-2">
             {searchTerm 
               ? "No se encontraron grupos que coincidan con tu búsqueda."
               : "Aún no se han creado grupos. Crea uno para comenzar."}
           </p>
         </div>
       ) : (
         <>
          {/* Mobile View - Card List */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredGroups.map((group) => (
              <Card 
                key={group.id_grupo} 
                className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/groups/${group.id_grupo}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                  <div>
                      <CardTitle>{group.acronimo}</CardTitle>
                      <CardDescription>{group.carrera}</CardDescription>
                    </div>
                    <GroupActionsMenu
                      group={group}
                      onQRClick={handleQRClick}
                      onEditClick={handleEditClick}
                      onDeleteClick={setGroupToDelete}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                    <Separator className="my-2"/>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                        <div className="font-semibold">Nivel:</div>
                        <div>{group.nivel}</div>
                        <div className="font-semibold">Modalidad:</div>
                        <div>{group.modalidad}</div>
                        <div className="font-semibold">Turno:</div>
                        <div>{group.turno}</div>
                         <div className="font-semibold">Plantel:</div>
                        <div>{group.plantel || 'N/A'}</div>
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
                    <TableHead>Nivel</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Plantel</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow 
                      key={group.id_grupo}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/groups/${group.id_grupo}`)}
                    >
                      <TableCell className="font-medium">{group.acronimo}</TableCell>
                      <TableCell>{group.carrera}</TableCell>
                      <TableCell>{group.nivel}</TableCell>
                      <TableCell>{group.modalidad}</TableCell>
                      <TableCell>{group.turno}</TableCell>
                      <TableCell>{group.plantel || 'N/A'}</TableCell>
                      <TableCell>
                        <GroupActionsMenu
                          group={group}
                          onQRClick={handleQRClick}
                          onEditClick={handleEditClick}
                          onDeleteClick={setGroupToDelete}
                        />
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
