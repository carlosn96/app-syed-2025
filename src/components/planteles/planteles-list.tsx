"use client"

import { useState } from "react"
import { Pencil, Trash2, Grid3X3, List, CheckSquare, Square, BookCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Plantel } from "@/lib/modelos"

interface PlantelesListProps {
  planteles: Plantel[]
  isLoading: boolean
  viewMode: 'gallery' | 'list'
  onEdit: (plantel: Plantel) => void
  onDelete: (plantelId: number) => void
  onBulkDelete: (plantelIds: number[]) => void
}

export function PlantelesList({
  planteles,
  isLoading,
  viewMode,
  onEdit,
  onDelete,
  onBulkDelete
}: PlantelesListProps) {
  const [selectedPlanteles, setSelectedPlanteles] = useState<Set<number>>(new Set())

  const handleSelectPlantel = (plantelId: number, checked: boolean) => {
    const newSelected = new Set(selectedPlanteles)
    if (checked) {
      newSelected.add(plantelId)
    } else {
      newSelected.delete(plantelId)
    }
    setSelectedPlanteles(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlanteles(new Set(planteles.map(p => p.id)))
    } else {
      setSelectedPlanteles(new Set())
    }
  }

  const handleBulkDelete = () => {
    const plantelIds = Array.from(selectedPlanteles)
    onBulkDelete(plantelIds)
    setSelectedPlanteles(new Set())
  }

  const renderCampusCard = (campus: Plantel) => {
    return (
      <Card key={campus.id} className="relative flex flex-col">
        {/* Botones superiores: Editar y Eliminar */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(campus)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(campus.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{campus.name}</CardTitle>
          <CardDescription>{campus.location}</CardDescription>
        </CardHeader>

        

        <CardFooter className="mt-auto">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Link href={`/planteles/${campus.id}/carreras`}>
              <BookCopy className="h-4 w-4 mr-2" />
              <span>Ver Carreras</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderTableRow = (campus: Plantel) => {
    const isSelected = selectedPlanteles.has(campus.id)

    return (
      <TableRow key={campus.id} className={isSelected ? 'bg-muted/50' : ''}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectPlantel(campus.id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="font-medium">{campus.name}</TableCell>
        <TableCell>{campus.location}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(campus)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(campus.id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href={`/planteles/${campus.id}/carreras`}>
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
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
    </TableRow>
  )

  const hasSelections = selectedPlanteles.size > 0

  return (
    <div className="space-y-4">
      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
            : planteles.map(renderCampusCard)}
        </div>
      ) : (
        <>
          {hasSelections && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedPlanteles.size} plantel{selectedPlanteles.size !== 1 ? 'es' : ''} seleccionado{selectedPlanteles.size !== 1 ? 's' : ''}
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
                    checked={selectedPlanteles.size === planteles.length && planteles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => renderSkeletonTableRow(i))
                : planteles.map(renderTableRow)}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}