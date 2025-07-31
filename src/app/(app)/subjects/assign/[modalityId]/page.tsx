
"use client"

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { careers, subjects as allSubjects } from '@/lib/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function AssignSubjectsPage() {
    const params = useParams()
    const modalityId = Number(params.modalityId)

    const modality = useMemo(() => {
        return careers.find(c => c.id === modalityId)
    }, [modalityId])

    if (!modality) {
        return <div>Modalidad no encontrada.</div>
    }
    
    const subjectsForCareer = allSubjects.filter(s => s.career === modality.name)
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Asignar Materias
                </h1>
                <p className="text-muted-foreground">
                    {modality.name} - {modality.modality}
                </p>
            </div>
            
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Plan de Estudios</CardTitle>
                    <CardDescription>
                        Selecciona las materias que forman parte de esta modalidad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <ScrollArea className="h-96">
                            <div className="space-y-4 p-4">
                                {allSubjects.map(subject => (
                                    <div key={subject.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`subject-${subject.id}`} 
                                            defaultChecked={subjectsForCareer.some(s => s.id === subject.id)}
                                        />
                                        <Label htmlFor={`subject-${subject.id}`} className="flex flex-col">
                                            <span>{subject.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Semestre: {subject.semester} - Docente: {subject.teacher}
                                            </span>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="flex justify-end pt-6">
                            <Button type="submit">Guardar Cambios</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

        </div>
    )
}
