"use client"

import { useMemo, useState } from "react"
import { Search, Grid3X3, List, Key, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Alumno } from "@/lib/modelos"
import { normalizeString } from "@/lib/utils"
import { AlumnoCard } from "./alumno-card"

interface AlumnosListProps {
  alumnos: Alumno[]
  isLoading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  onEdit: (alumno: Alumno) => void
  onDelete: (alumno: Alumno) => void
  onResetPassword?: (userId: number, userName: string) => void
  showResetPassword?: boolean
  viewMode?: 'gallery' | 'list'
  onViewModeChange?: (mode: 'gallery' | 'list') => void
  onBulkDelete?: (alumnos: Alumno[]) => void
}

export function AlumnosList({
  alumnos,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onResetPassword,
  showResetPassword = false,
  viewMode = 'gallery',
  onViewModeChange,
  onBulkDelete
}: AlumnosListProps) {
  const [selectedAlumnos, setSelectedAlumnos] = useState<Set<number>>(new Set())

  const filteredAlumnos = useMemo(() => {
    if (!searchTerm) {
      return alumnos
    }
    const normalizedSearchTerm = normalizeString(searchTerm)
    return alumnos.filter(alumno => {
      const fullName = normalizeString(alumno.nombre_completo)
      const email = normalizeString(alumno.correo)
      const career = alumno.carrera ? normalizeString(alumno.carrera) : ''

      return fullName.includes(normalizedSearchTerm) ||
             email.includes(normalizedSearchTerm) ||
             (career && career.includes(normalizedSearchTerm))
    })
  }, [alumnos, searchTerm])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlumnos(new Set(filteredAlumnos.map(a => a.id_alumno)))
    } else {
      setSelectedAlumnos(new Set())
    }
  }

  const handleSelectAlumno = (alumnoId: number, checked: boolean) => {
    const newSelected = new Set(selectedAlumnos)
    if (checked) {
      newSelected.add(alumnoId)
    } else {
      newSelected.delete(alumnoId)
    }
    setSelectedAlumnos(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedAlumnos.size > 0) {
      const alumnosToDelete = filteredAlumnos.filter(a => selectedAlumnos.has(a.id_alumno))
      onBulkDelete(alumnosToDelete)
      setSelectedAlumnos(new Set())
    }
  }

  const isAllSelected = filteredAlumnos.length > 0 && selectedAlumnos.size === filteredAlumnos.length

  const renderTableRow = (alumno: Alumno) => (
    <TableRow key={alumno.id_alumno}>
      <TableCell>
        <Checkbox
          checked={selectedAlumnos.has(alumno.id_alumno)}
          onCheckedChange={(checked) => handleSelectAlumno(alumno.id_alumno, checked as boolean)}
        />
      </TableCell>
      <TableCell className="font-medium">{alumno.nombre_completo}</TableCell>
      <TableCell>{alumno.correo}</TableCell>
      <TableCell>{alumno.matricula}</TableCell>
      <TableCell>{alumno.carrera || 'No asignada'}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {showResetPassword && onResetPassword && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onResetPassword(alumno.id_usuario, alumno.nombre_completo)}
              title="Cambiar contraseña"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="info" 
            onClick={() => onEdit(alumno)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                  <span className="font-bold text-primary"> {alumno.nombre_completo}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(alumno)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )

  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <div className="flex justify-end gap-2 pt-2">
          {showResetPassword && <Skeleton className="h-10 w-10 rounded-full" />}
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )

  const renderSkeletonTableRow = (index: number) => (
    <TableRow key={index}>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {showResetPassword && <Skeleton className="h-8 w-8 rounded" />}
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alumnos..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {onViewModeChange && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'gallery' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('gallery')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Galería
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading 
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))
            : filteredAlumnos.map(alumno => (
                <AlumnoCard
                  key={alumno.id_alumno}
                  alumno={alumno}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResetPassword={onResetPassword}
                  showResetPassword={showResetPassword}
                />
              ))}
        </div>
      ) : (
        <>
          {selectedAlumnos.size > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedAlumnos.size} alumno{selectedAlumnos.size !== 1 ? 's' : ''} seleccionado{selectedAlumnos.size !== 1 ? 's' : ''}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar Seleccionados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente a {selectedAlumnos.size} alumno{selectedAlumnos.size !== 1 ? 's' : ''}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading 
                ? Array.from({ length: 6 }).map((_, i) => renderSkeletonTableRow(i))
                : filteredAlumnos.map(renderTableRow)}
            </TableBody>
          </Table>
        </>
      )}
    </>
  )
}
