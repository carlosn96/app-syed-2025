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
  showProfile = false
}: DocentesListProps) {
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

  return (
    <>
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
    </>
  )
}
