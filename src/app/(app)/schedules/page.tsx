
"use client"

import { useState, useMemo, useEffect } from "react"
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
import { schedules, teachers, groups as allGroups, subjects, Group, careers as allCareers } from "@/lib/data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
]

export default function SchedulesPage() {
  const { user } = useAuth()
  const [filterType, setFilterType] = useState("group")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const [availableGroups, setAvailableGroups] = useState<Group[]>(allGroups);
  const [availableCareers, setAvailableCareers] = useState<string[]>([]);
  
  const uniqueCareerNames = useMemo(() => [...new Set(allCareers.map(c => c.name))], []);


  useEffect(() => {
    if (user?.rol === 'teacher') {
        setFilterType('group');
        const teacherSchedules = schedules.filter(s => s.teacherId === user.id);
        const groupIds = [...new Set(teacherSchedules.map(s => s.groupId))];
        const teacherGroups = allGroups.filter(g => groupIds.includes(g.id));
        setAvailableGroups(teacherGroups);
        
        const teacherCareerNames = [...new Set(teacherGroups.map(g => g.career))];
        setAvailableCareers(teacherCareerNames);

    } else {
        setAvailableGroups(allGroups);
        setAvailableCareers(uniqueCareerNames);
    }
  }, [user, uniqueCareerNames]);


  const getSchedulesForDay = (day: string) => {
    let filteredSchedules = schedules

    if (user?.rol === 'student') {
        const studentGroup = allGroups.find(g => g.name === user.grupo);
        if (studentGroup) {
            filteredSchedules = schedules.filter(s => s.groupId === studentGroup.id);
        } else {
            return []; // No group found, no schedules
        }
    } else if (selectedFilter) {
      if (filterType === "teacher") {
        filteredSchedules = schedules.filter(
          (s) => s.teacherId === Number(selectedFilter)
        )
      } else if (filterType === "group") {
        filteredSchedules = schedules.filter(
          (s) => s.groupId === Number(selectedFilter)
        )
      } else if (filterType === "career") {
        const groupIdsInCareer = allGroups
            .filter(g => g.career === selectedFilter)
            .map(g => g.id);
        filteredSchedules = schedules.filter(s => groupIdsInCareer.includes(s.groupId));
      }
    } else if (user?.rol !== 'administrator' && user?.rol !== 'coordinator') {
        // Default to empty if no filter is selected and user is not admin/coord
        return [];
    }

    return filteredSchedules
      .filter((schedule) => schedule.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
  
  const getEntityName = (
    type: "teacher" | "subject",
    id: number
  ) => {
    switch (type) {
      case "teacher":
        return teachers.find((t) => t.id === id)?.name || "N/A"
      case "subject":
        return subjects.find((s) => s.id === id)?.name || "N/A"
    }
  }
  
  const handleClearFilter = () => {
    setSelectedFilter(null);
  }

  const renderFilterSelect = () => {
    switch(filterType) {
        case 'teacher':
            return (
                <Select value={selectedFilter || ''} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="Seleccionar docente" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map(teacher => (
                            <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'group':
             return (
                <Select value={selectedFilter || ''} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                         {availableGroups.map(group => (
                            <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'career':
            return (
                <Select value={selectedFilter || ''} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="Seleccionar carrera" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCareers.map(careerName => (
                            <SelectItem key={careerName} value={careerName}>{careerName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        default:
            return null;
    }
  }

  const shouldShowFilters = user?.rol === 'administrator' || user?.rol === 'coordinator' || user?.rol === 'teacher';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Horarios de Clases
        </h1>
        {shouldShowFilters && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {user?.rol === 'teacher' ? (
                    <Select value={filterType} onValueChange={(value) => { setFilterType(value); setSelectedFilter(null); }}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder="Filtrar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="group">Grupo</SelectItem>
                            <SelectItem value="career">Carrera</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                <Select value={filterType} onValueChange={(value) => { setFilterType(value); setSelectedFilter(null); }}>
                    <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Filtrar por..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="teacher">Docente</SelectItem>
                        <SelectItem value="group">Grupo</SelectItem>
                        <SelectItem value="career">Carrera</SelectItem>
                    </SelectContent>
                </Select>
                )}
                {renderFilterSelect()}
                <Button variant="ghost" onClick={handleClearFilter} disabled={!selectedFilter}>Limpiar</Button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {daysOfWeek.map((day) => {
          const dailySchedules = getSchedulesForDay(day);
          return (
            <Card key={day} className="flex flex-col rounded-xl">
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
                        <TableHead className="w-[100px] md:w-[150px]">Hora</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Docente</TableHead>
                        {user?.rol !== 'student' && <TableHead>Carrera</TableHead>}
                        {user?.rol !== 'student' && <TableHead>Nivel</TableHead>}
                        {user?.rol !== 'student' && <TableHead>Grupo</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailySchedules.map((schedule) => {
                        const groupDetails = allGroups.find(g => g.id === schedule.groupId);
                        return (
                            <TableRow key={schedule.id}>
                            <TableCell className="font-medium text-primary text-xs sm:text-sm">
                                {schedule.startTime} - {schedule.endTime}
                            </TableCell>
                            <TableCell className="font-semibold">
                                <div>{getEntityName("subject", schedule.subjectId)}</div>
                            </TableCell>
                            <TableCell>{getEntityName("teacher", schedule.teacherId)}</TableCell>
                            {user?.rol !== 'student' && <TableCell>{groupDetails?.career || 'N/A'}</TableCell>}
                            {user?.rol !== 'student' && <TableCell>{groupDetails?.semester ? `${groupDetails.semester}°` : 'N/A'}</TableCell>}
                            {user?.rol !== 'student' && <TableCell>{groupDetails?.name || 'N/A'}</TableCell>}
                            </TableRow>
                        )
                      })}
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
