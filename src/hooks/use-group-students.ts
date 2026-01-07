"use client"

import { useState, useEffect } from "react"
import { Alumno } from "@/lib/modelos"
import { getAlumnosByGroup, assignAlumnosToGroup, getAlumnosForCoordinador, removeAlumnoFromGroup } from "@/services/api"

export function useGroupStudents(groupId: number) {
  const [alumnosInscritos, setAlumnosInscritos] = useState<Alumno[]>([])
  const [isReloadingAlumnos, setIsReloadingAlumnos] = useState(false)
  const [removingAlumnoId, setRemovingAlumnoId] = useState<number | null>(null)

  const loadEnrolledStudents = async () => {
    setIsReloadingAlumnos(true)
    try {
      const alumnos = await getAlumnosByGroup(groupId)
      setAlumnosInscritos(alumnos)
    } catch (error) {
      console.error('Error loading enrolled students:', error)
    } finally {
      setIsReloadingAlumnos(false)
    }
  }

  const handleRemoveAlumno = async (alumnoId: number) => {
    if (removingAlumnoId !== null) return

    const alumnoExists = alumnosInscritos.some(a => a.id_alumno === alumnoId)
    if (!alumnoExists) {
      throw new Error('El alumno no se encuentra en este grupo')
    }

    setRemovingAlumnoId(alumnoId)
    try {
      await removeAlumnoFromGroup(groupId, alumnoId)
      setAlumnosInscritos(prev => prev.filter(a => a.id_alumno !== alumnoId))
    } catch (error) {
      throw error
    } finally {
      setRemovingAlumnoId(null)
    }
  }

  const handleAssignAlumnos = async (selectedAlumnos: Set<number>) => {
    await assignAlumnosToGroup({
      id_grupo: groupId,
      ids_alumnos: Array.from(selectedAlumnos)
    })
    await loadEnrolledStudents()
  }

  useEffect(() => {
    loadEnrolledStudents()
  }, [groupId])

  return {
    alumnosInscritos,
    isReloadingAlumnos,
    removingAlumnoId,
    loadEnrolledStudents,
    handleRemoveAlumno,
    handleAssignAlumnos
  }
}