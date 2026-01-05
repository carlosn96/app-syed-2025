"use client"

import { useState } from "react"
import { Pencil, Trash2, Key, Grid3X3, List, CheckSquare, Square, BookCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Coordinador } from "@/lib/modelos"

interface CoordinadoresListProps {
  coordinators: Coordinador[]
  isLoading: boolean
  viewMode: 'gallery' | 'list'
  onEdit: (coordinator: Coordinador) => void
  onDelete: (userId: number) => void
  onResetPassword: (user: { id: number; name: string }) => void
  onBulkDelete: (userIds: number[]) => void
}

export function CoordinadoresList({
  coordinators,
  isLoading,
  viewMode,
  onEdit,
  onDelete,
  onResetPassword,
  onBulkDelete
}: CoordinadoresListProps) {
  const [selectedCoordinators, setSelectedCoordinators] = useState<Set<number>>(new Set())

  const handleSelectCoordinator = (coordinatorId: number, checked: boolean) => {
    const newSelected = new Set(selectedCoordinators)
    if (checked) {
      newSelected.add(coordinatorId)
    } else {
      newSelected.delete(coordinatorId)
    }
    setSelectedCoordinators(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoordinators(new Set(coordinators.map(c => c.usuario_id)))
    } else {
      setSelectedCoordinators(new Set())
    }
  }

  const handleBulkDelete = () => {
    const userIds = Array.from(selectedCoordinators)
    onBulkDelete(userIds)
    setSelectedCoordinators(new Set())
  }

  const renderCoordinatorCard = (coordinator: Coordinador) => {
    return (
      <Card key={coordinator.id_coordinador} className="relative flex flex-col">
        {/* Botones superiores: Cambiar contraseña, Editar y Eliminar */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onResetPassword({ id: coordinator.usuario_id, name: coordinator.nombre_completo })}
            title="Cambiar contraseña"
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(coordinator)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(coordinator.usuario_id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{coordinator.nombre_completo}</CardTitle>
          <CardDescription>{coordinator.correo}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Fecha de registro:</span>
              <p>{new Date(coordinator.fecha_registro).toLocaleDateString('es-ES')}</p>
            </div>
            {coordinator.ultimo_acceso && (
              <div>
                <span className="font-medium">Último acceso:</span>
                <p>{new Date(coordinator.ultimo_acceso).toLocaleDateString('es-ES')}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Link href={`/carrerasPorCoordinador/${coordinator.id_coordinador}`}>
              <BookCopy className="h-4 w-4 mr-2" />
              <span>Ver Carreras</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderTableRow = (coordinator: Coordinador) => {
    const isSelected = selectedCoordinators.has(coordinator.usuario_id)

    return (
      <TableRow key={coordinator.id_coordinador} className={isSelected ? 'bg-muted/50' : ''}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectCoordinator(coordinator.usuario_id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="font-medium">{coordinator.nombre_completo}</TableCell>
        <TableCell>{coordinator.correo}</TableCell>
        <TableCell>{new Date(coordinator.fecha_registro).toLocaleDateString('es-ES')}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResetPassword({ id: coordinator.usuario_id, name: coordinator.nombre_completo })}
              title="Cambiar contraseña"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(coordinator)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(coordinator.usuario_id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href={`/carrerasPorCoordinador/${coordinator.id_coordinador}`}>
                <BookCopy className="h-4 w-4 mr-1" />
                Ver Carreras
              </Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const renderSkeletonCard = (index: number) => (
    <Card key={`skeleton-${index}`} className="relative flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )

  const renderSkeletonTableRow = (index: number) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
    </TableRow>
  )

  const hasSelections = selectedCoordinators.size > 0

  return (
    <div className="space-y-4">
      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
            : coordinators.map(renderCoordinatorCard)}
        </div>
      ) : (
        <>
          {hasSelections && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedCoordinators.size} coordinador{selectedCoordinators.size !== 1 ? 'es' : ''} seleccionado{selectedCoordinators.size !== 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar seleccionados
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCoordinators.size === coordinators.length && coordinators.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => renderSkeletonTableRow(i))
                : coordinators.map(renderTableRow)}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}