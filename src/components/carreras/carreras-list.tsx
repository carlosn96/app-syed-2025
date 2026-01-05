"use client"

import { useMemo, useState } from "react"
import { Search, Pencil, Trash2, Grid3X3, List, CheckSquare, Square, UserPlus, BookCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { CareerSummary } from "@/lib/modelos"
import { normalizeString } from "@/lib/utils"

interface CarrerasListProps {
  careers: CareerSummary[]
  isLoading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  viewMode?: 'gallery' | 'list'
  onViewModeChange?: (mode: 'gallery' | 'list') => void
  onEdit: (career: CareerSummary) => void
  onAssign: (career: CareerSummary) => void
  onDelete: (careerId: number) => void
  onBulkDelete: (careerIds: number[]) => void
}

export function CarrerasList({
  careers,
  isLoading,
  searchTerm,
  onSearchChange,
  viewMode = 'gallery',
  onViewModeChange,
  onEdit,
  onAssign,
  onDelete,
  onBulkDelete
}: CarrerasListProps) {
  const [selectedCareers, setSelectedCareers] = useState<Set<number>>(new Set())

  const filteredCareers = useMemo(() => {
    if (!searchTerm) {
      return careers
    }
    const normalizedSearchTerm = normalizeString(searchTerm)
    return careers.filter(career => {
      const name = normalizeString(career.name)
      const coordinator = career.coordinator ? normalizeString(career.coordinator) : ''
      return name.includes(normalizedSearchTerm) || coordinator.includes(normalizedSearchTerm)
    })
  }, [careers, searchTerm])

  const handleSelectCareer = (careerId: number, checked: boolean) => {
    const newSelected = new Set(selectedCareers)
    if (checked) {
      newSelected.add(careerId)
    } else {
      newSelected.delete(careerId)
    }
    setSelectedCareers(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCareers(new Set(filteredCareers.map(c => c.id)))
    } else {
      setSelectedCareers(new Set())
    }
  }

  const handleBulkDelete = () => {
    const careerIds = Array.from(selectedCareers)
    onBulkDelete(careerIds)
    setSelectedCareers(new Set())
  }

  const renderCareerCard = (career: CareerSummary) => {
    return (
      <Card key={career.id} className="relative flex flex-col">
        {/* Botones superiores: Editar, Asignar y Eliminar */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(career)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onAssign(career)}
            title="Asignar Coordinador"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(career.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{career.name}</CardTitle>
          <CardDescription>{career.coordinator || 'Sin coordinador asignado'}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Materias:</span>
              <p>{career.totalMaterias}</p>
            </div>
            <div>
              <span className="font-medium">Planteles:</span>
              <p>{career.totalPlanteles}</p>
            </div>
            <div>
              <span className="font-medium">Modalidades:</span>
              <p>{career.totalModalidades}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Link href={`/plan-estudio/${career.id}`}>
              <BookCopy className="h-4 w-4 mr-2" />
              <span>Planes de Estudio</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderTableRow = (career: CareerSummary) => {
    const isSelected = selectedCareers.has(career.id)

    return (
      <TableRow key={career.id} className={isSelected ? 'bg-muted/50' : ''}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectCareer(career.id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="font-medium">{career.name}</TableCell>
        <TableCell>{career.totalMaterias}</TableCell>
        <TableCell>{career.totalPlanteles}</TableCell>
        <TableCell>{career.totalModalidades}</TableCell>
        <TableCell>{career.coordinator || 'Sin asignar'}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(career)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(career)}
              title="Asignar Coordinador"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(career.id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href={`/plan-estudio/${career.id}`}>
                <BookCopy className="h-4 w-4 mr-1" />
                Planes de Estudio
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
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  )

  const renderSkeletonTableRow = (index: number) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
    </TableRow>
  )

  const hasSelections = selectedCareers.size > 0

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:max-w-xs flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar carreras..."
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

      <div className="space-y-4">
        {viewMode === 'gallery' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
              : filteredCareers.map(renderCareerCard)}
          </div>
        ) : (
          <>
            {hasSelections && (
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {selectedCareers.size} carrera{selectedCareers.size !== 1 ? 's' : ''} seleccionada{selectedCareers.size !== 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar seleccionadas
                </Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCareers.size === filteredCareers.length && filteredCareers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Materias</TableHead>
                  <TableHead>Planteles</TableHead>
                  <TableHead>Modalidades</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => renderSkeletonTableRow(i))
                  : filteredCareers.map(renderTableRow)}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </>
  )
}