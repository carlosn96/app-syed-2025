"use client"

import { useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
}

export function AlumnosList({
  alumnos,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onResetPassword,
  showResetPassword = false
}: AlumnosListProps) {
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

  return (
    <>
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
    </>
  )
}
