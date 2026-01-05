"use client"

import { useMemo, useState } from "react"
import { Search, Grid3X3, List, Key, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
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
import { Docente } from "@/lib/modelos"
import { normalizeString } from "@/lib/utils"
import { DocenteCard } from "./docente-card"

interface DocentesListProps {
  docentes: Docente[]
  isLoading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  onEdit: (docente: Docente) => void
  onDelete: (docente: Docente) => void
  onResetPassword?: (userId: number, userName: string) => void
  showResetPassword?: boolean
  showProfile?: boolean
  viewMode?: 'gallery' | 'list'
  onViewModeChange?: (mode: 'gallery' | 'list') => void
  onBulkDelete?: (docentes: Docente[]) => void
}

export function DocentesList({
  docentes,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onResetPassword,
  showResetPassword = false,
  showProfile = false,
  viewMode = 'gallery',
  onViewModeChange,
  onBulkDelete
}: DocentesListProps) {
  const [selectedDocentes, setSelectedDocentes] = useState<Set<number>>(new Set())

  const filteredDocentes = useMemo(() => {
    if (!searchTerm) {
      return docentes
    }
    const normalizedSearchTerm = normalizeString(searchTerm)
    return docentes.filter(docente => {
      const fullName = normalizeString(docente.nombre_completo)
      const email = normalizeString(docente.correo)
      return fullName.includes(normalizedSearchTerm) || email.includes(normalizedSearchTerm)
    })
  }, [docentes, searchTerm])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocentes(new Set(filteredDocentes.map(d => d.id_docente)))
    } else {
      setSelectedDocentes(new Set())
    }
  }

  const handleSelectDocente = (docenteId: number, checked: boolean) => {
    const newSelected = new Set(selectedDocentes)
    if (checked) {
      newSelected.add(docenteId)
    } else {
      newSelected.delete(docenteId)
    }
    setSelectedDocentes(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedDocentes.size > 0) {
      const docentesToDelete = filteredDocentes.filter(d => selectedDocentes.has(d.id_docente))
      onBulkDelete(docentesToDelete)
      setSelectedDocentes(new Set())
    }
  }

  const isAllSelected = filteredDocentes.length > 0 && selectedDocentes.size === filteredDocentes.length

  const renderTableRow = (docente: Docente) => (
    <TableRow key={docente.id_docente}>
      <TableCell>
        <Checkbox
          checked={selectedDocentes.has(docente.id_docente)}
          onCheckedChange={(checked) => handleSelectDocente(docente.id_docente, checked as boolean)}
        />
      </TableCell>
      <TableCell className="font-medium">{docente.nombre_completo}</TableCell>
      <TableCell>{docente.correo}</TableCell>
      <TableCell>{docente.grado_academico}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {showResetPassword && onResetPassword && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onResetPassword(docente.id_usuario, docente.nombre_completo)}
              title="Cambiar contraseña"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="info" 
            onClick={() => onEdit(docente)}
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
                  <span className="font-bold text-white"> {docente.nombre_completo}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(docente)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {showProfile && docente.id_docente && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/users/teachers/${docente.id_docente}`}>
                <Eye className="h-4 w-4 mr-1" />
                Ver Perfil
              </Link>
            </Button>
          )}
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
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {showResetPassword && <Skeleton className="h-8 w-8 rounded" />}
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
          {showProfile && <Skeleton className="h-8 w-24 rounded" />}
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
            placeholder="Buscar docentes..."
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
            : filteredDocentes.map(docente => (
                <DocenteCard
                  key={docente.id_docente}
                  docente={docente}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResetPassword={onResetPassword}
                  showResetPassword={showResetPassword}
                  showProfile={showProfile}
                />
              ))}
        </div>
      ) : (
        <>
          {selectedDocentes.size > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedDocentes.size} docente{selectedDocentes.size !== 1 ? 's' : ''} seleccionado{selectedDocentes.size !== 1 ? 's' : ''}
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
                      Esta acción no se puede deshacer. Esto eliminará permanentemente a {selectedDocentes.size} docente{selectedDocentes.size !== 1 ? 's' : ''}.
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
                <TableHead>Grado Académico</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading 
                ? Array.from({ length: 6 }).map((_, i) => renderSkeletonTableRow(i))
                : filteredDocentes.map(renderTableRow)}
            </TableBody>
          </Table>
        </>
      )}
    </>
  )
}
