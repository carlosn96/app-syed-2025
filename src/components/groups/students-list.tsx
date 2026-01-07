"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserPlus, Search } from "lucide-react"
import { Alumno } from "@/lib/modelos"
import { SearchInput } from "./search-input"
import { StudentCard } from "./student-card"

interface StudentsListProps {
  alumnos: Alumno[]
  isReloading: boolean
  onEnrollClick: () => void
  onRemoveStudent: (id: number) => void
  removingStudentId: number | null
}

export function StudentsList({ alumnos, isReloading, onEnrollClick, onRemoveStudent, removingStudentId }: StudentsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAlumnos = alumnos.filter(alumno =>
    `${alumno.nombre_completo}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumno.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Alumnos Inscritos
            </CardTitle>
            <CardDescription>
              Lista de estudiantes que pertenecen a este grupo
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Buscar alumnos..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-auto sm:min-w-[300px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          {isReloading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAlumnos.length > 0 ? (
            <div className="space-y-3">
              {filteredAlumnos.map((alumno) => (
                <StudentCard
                  key={alumno.id_alumno}
                  alumno={alumno}
                  onRemove={onRemoveStudent}
                  isRemoving={removingStudentId === alumno.id_alumno}
                />
              ))}
            </div>
          ) : alumnos.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No se encontraron alumnos</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
                No hay alumnos que coincidan con tu búsqueda "{searchTerm}".
              </p>
              <Button onClick={() => setSearchTerm("")} variant="outline">
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No hay alumnos inscritos</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
                Los estudiantes aparecerán aquí una vez que se inscriban al grupo. Comienza inscribiendo alumnos ahora.
              </p>
              <Button onClick={onEnrollClick} size="lg" className="gap-2">
                <UserPlus className="h-5 w-5" />
                Inscribir Alumnos
              </Button>
            </div>
          )}
        </div>
        {filteredAlumnos.length > 0 && (
          <div className="pt-4 border-t mt-4">
            <Button onClick={onEnrollClick} variant="outline" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Inscribir Más Alumnos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}