"use client"
import { useState } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { careers, subjects } from "@/lib/data"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  const [activeTabs, setActiveTabs] = useState<Record<number, string>>({})

  const handleTabChange = (careerId: number, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [careerId]: value }))
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Planes de Estudio por Carrera
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Carrera
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {careers.map((career) => {
          const filteredSubjects = subjects.filter(
            (subject) => subject.career === career.name
          )
          const semesters = Array.from(
            new Set(filteredSubjects.map((s) => s.semester))
          ).sort((a, b) => a - b)
          const defaultTabValue =
            semesters.length > 0 ? `sem-${semesters[0]}` : ""

          return (
            <Card key={career.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{career.name}</CardTitle>
                    <CardDescription>{career.campus}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="warning">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button size="icon" variant="destructive-outline">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {semesters.length > 0 ? (
                  <Tabs
                    defaultValue={defaultTabValue}
                    value={activeTabs[career.id] || defaultTabValue}
                    onValueChange={(value) => handleTabChange(career.id, value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      {semesters.map((semester) => (
                        <TabsTrigger key={semester} value={`sem-${semester}`}>
                          Sem. {semester}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {semesters.map((semester) => (
                      <TabsContent key={semester} value={`sem-${semester}`}>
                        <ul className="mt-4 space-y-3">
                          {filteredSubjects
                            .filter((s) => s.semester === semester)
                            .map((subject) => (
                              <li
                                key={subject.id}
                                className="rounded-md border p-3"
                              >
                                <h4 className="font-medium">{subject.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Docente: {subject.teacher}
                                </p>
                              </li>
                            ))}
                        </ul>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay materias asignadas para esta carrera aún.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
