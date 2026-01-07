"use client"

import { useState, useEffect } from "react"
import { Alumno } from "@/lib/modelos"
import { getAlumnosForCoordinador } from "@/services/api"

export function useEnrollmentDialog(alumnosInscritos: Alumno[]) {
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [availableAlumnos, setAvailableAlumnos] = useState<Alumno[]>([])
  const [selectedAlumnos, setSelectedAlumnos] = useState<Set<number>>(new Set())
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isEnrollDialogOpen) {
      const loadAvailableAlumnos = async () => {
        setIsLoadingAlumnos(true)
        try {
          const allAlumnos = await getAlumnosForCoordinador()
          const enrolledIds = new Set(alumnosInscritos.map(a => a.id_alumno))
          const available = allAlumnos.filter(a => !enrolledIds.has(a.id_alumno))
          setAvailableAlumnos(available)
        } catch (error) {
          console.error('Error loading available students:', error)
        } finally {
          setIsLoadingAlumnos(false)
        }
      }
      loadAvailableAlumnos()
    }
  }, [isEnrollDialogOpen, alumnosInscritos])

  const handleSelectAlumno = (id: number) => {
    setSelectedAlumnos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredAlumnos = availableAlumnos.filter(alumno =>
    `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumno.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedAlumnos.size === filteredAlumnos.length) {
      setSelectedAlumnos(new Set())
    } else {
      setSelectedAlumnos(new Set(filteredAlumnos.map(a => a.id_alumno)))
    }
  }

  const resetDialog = () => {
    setIsEnrollDialogOpen(false)
    setSelectedAlumnos(new Set())
    setSearchTerm("")
  }

  return {
    isEnrollDialogOpen,
    setIsEnrollDialogOpen,
    availableAlumnos: filteredAlumnos,
    selectedAlumnos,
    isLoadingAlumnos,
    searchTerm,
    setSearchTerm,
    handleSelectAlumno,
    handleSelectAll,
    resetDialog
  }
}