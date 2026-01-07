"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { Group } from "@/lib/modelos"

interface GroupInfoProps {
  group: Group
}

export function GroupInfo({ group }: GroupInfoProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Información del Grupo
        </CardTitle>
        <CardDescription>
          Detalles y configuración del grupo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Acrónimo:</div>
            <div className="col-span-2">{group.acronimo}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Código de Inscripción:</div>
            <div className="col-span-2 font-mono">{group.codigo_inscripcion}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Carrera:</div>
            <div className="col-span-2">{group.carrera}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Modalidad:</div>
            <div className="col-span-2">{group.modalidad}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Turno:</div>
            <div className="col-span-2">{group.turno}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Nivel:</div>
            <div className="col-span-2">{group.nivel}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Plantel:</div>
            <div className="col-span-2">{group.plantel || 'No asignado'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}