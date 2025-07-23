
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
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
import { schedules, teachers, groups, subjects } from "@/lib/data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
]

export default function SchedulesPage() {
  const [filterType, setFilterType] = useState("teacher")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const getSchedulesForDay = (day: string) => {
    let filteredSchedules = schedules

    if (selectedFilter) {
      if (filterType === "teacher") {
        filteredSchedules = schedules.filter(
          (s) => s.teacherId === Number(selectedFilter)
        )
      } else if (filterType === "group") {
        filteredSchedules = schedules.filter(
          (s) => s.groupId === Number(selectedFilter)
        )
      }
    }
    return filteredSchedules
      .filter((schedule) => schedule.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
  
  const getEntityName = (
    type: "teacher" | "group" | "subject",
    id: number
  ) => {
    switch (type) {
      case "teacher":
        return teachers.find((t) => t.id === id)?.name || "N/A"
      case "group":
        return groups.find((g) => g.id === id)?.name || "N/A"
      case "subject":
        return subjects.find((s) => s.id === id)?.name || "N/A"
    }
  }
  
  const handleClearFilter = () => {
    setSelectedFilter(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Horarios de Clase
        </h1>
        <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(value) => { setFilterType(value); setSelectedFilter(null); }}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="teacher">Docente</SelectItem>
                    <SelectItem value="group">Grupo</SelectItem>
                </SelectContent>
            </Select>
            <Select value={selectedFilter || ''} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={`Seleccionar ${filterType === 'teacher' ? 'docente' : 'grupo'}`} />
                </SelectTrigger>
                <SelectContent>
                    {filterType === 'teacher' ? (
                        teachers.map(teacher => (
                            <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                        ))
                    ) : (
                        groups.map(group => (
                            <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            <Button variant="ghost" onClick={handleClearFilter} disabled={!selectedFilter}>Limpiar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {daysOfWeek.map((day) => {
          const dailySchedules = getSchedulesForDay(day);
          return (
            <Card key={day} className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-xl">
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailySchedules.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Hora</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Docente</TableHead>
                        <TableHead>Grupo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailySchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium text-primary">
                            {schedule.startTime} - {schedule.endTime}
                          </TableCell>
                          <TableCell className="font-semibold">{getEntityName("subject", schedule.subjectId)}</TableCell>
                          <TableCell>{getEntityName("teacher", schedule.teacherId)}</TableCell>
                          <TableCell>{getEntityName("group", schedule.groupId)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-24 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No hay clases programadas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
}
