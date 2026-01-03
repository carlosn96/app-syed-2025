"use client"

import { useState } from "react"
import { Pencil, Trash2, Key } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alumno } from "@/lib/modelos"

interface AlumnoCardProps {
  alumno: Alumno
  onEdit: (alumno: Alumno) => void
  onDelete: (alumno: Alumno) => void
  onResetPassword?: (userId: number, userName: string) => void
  showResetPassword?: boolean
}

export function AlumnoCard({ 
  alumno, 
  onEdit, 
  onDelete, 
  onResetPassword,
  showResetPassword = false 
}: AlumnoCardProps) {
  const [name, ...restOfName] = (alumno.nombre_completo || '').split(' ')
  const lastName = restOfName.join(' ')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{`${name} ${lastName}`}</CardTitle>
            <CardDescription>{alumno.correo}</CardDescription>
          </div>
          <Badge variant="outline">Alumno</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p><span className="font-semibold">Matrícula:</span> {alumno.matricula}</p>
        <p><span className="font-semibold">Carrera:</span> {alumno.carrera || 'No asignada'}</p>
        <div className="flex justify-end gap-2 pt-2">
          {showResetPassword && onResetPassword && (
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onResetPassword(alumno.id_usuario, alumno.nombre_completo)}
              title="Cambiar contraseña"
            >
              <Key className="h-4 w-4" />
              <span className="sr-only">Cambiar contraseña</span>
            </Button>
          )}
          <Button 
            size="icon" 
            variant="info" 
            onClick={() => onEdit(alumno)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                  <span className="font-bold text-white"> {alumno.nombre_completo}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(alumno)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
