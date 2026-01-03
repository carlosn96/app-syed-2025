"use client"

import { Eye, Pencil, Trash2, Key } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Docente } from "@/lib/modelos"

interface DocenteCardProps {
  docente: Docente
  onEdit: (docente: Docente) => void
  onDelete: (docente: Docente) => void
  onResetPassword?: (userId: number, userName: string) => void
  showResetPassword?: boolean
  showProfile?: boolean
}

export function DocenteCard({ 
  docente, 
  onEdit, 
  onDelete, 
  onResetPassword,
  showResetPassword = false,
  showProfile = false
}: DocenteCardProps) {
  return (
    <Card className={showResetPassword ? "relative flex flex-col" : ""}>
      {showResetPassword && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          {onResetPassword && (
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onResetPassword(docente.id_usuario, docente.nombre_completo)}
              title="Cambiar contraseña"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="info" onClick={() => onEdit(docente)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                  <span className="font-bold text-primary"> {docente.nombre_completo}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(docente)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <CardHeader className={showResetPassword ? "pt-12" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{docente.nombre_completo}</CardTitle>
            <CardDescription>{docente.correo}</CardDescription>
            <CardDescription>
              <span className="font-semibold">Grado Académico:</span>{" "}
              <span className="break-words">{docente.grado_academico}</span>
            </CardDescription>
          </div>
          {!showResetPassword && <Badge variant="outline">Docente</Badge>}
        </div>
      </CardHeader>

      {!showResetPassword && (
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-end gap-2 pt-2">
            <Button size="icon" variant="warning" onClick={() => onEdit(docente)}>
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
                    <span className="font-bold text-white"> {docente.nombre_completo}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(docente)}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      )}

      {showProfile && docente.id_docente && (
        <CardFooter className="mt-auto">
          <Button asChild size="sm" variant="info-outline" className="w-full">
            <Link href={`/users/teachers/${docente.id_docente}`}>
              <Eye className="h-4 w-4 mr-2" />
              <span>Ver Perfil</span>
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
