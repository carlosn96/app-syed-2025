
"use client"

import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { careers, subjects as allSubjects, Subject } from '@/lib/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { CreateSubjectForm } from '@/components/create-subject-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"


export default function ManageModalitySubjectsPage() {
    const params = useParams()
    const modalityId = Number(params.modalityId)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [_, setForceRender] = useState(0); // State to force re-render

    const modality = useMemo(() => {
        return careers.find(c => c.id === modalityId)
    }, [modalityId])

    const subjectsForModality = useMemo(() => {
      if (!modality) return [];
      return allSubjects
          .filter(s => s.career === modality.name) // This might need refinement if careers can have same name in different campuses
          .sort((a, b) => a.semester - b.semester);
    }, [modality, _]);

    const groupedSubjects = useMemo(() => {
        const groups: Record<number, Subject[]> = {};
        subjectsForModality.forEach(subject => {
            if (!groups[subject.semester]) {
                groups[subject.semester] = [];
            }
            groups[subject.semester].push(subject);
        });
        return groups;
    }, [subjectsForModality]);


    if (!modality) {
        return <div>Modalidad no encontrada.</div>
    }
    
    const handleSuccess = () => {
        setIsModalOpen(false);
        // Force a re-render to show the new subject in the list
        setForceRender(Math.random()); 
    };
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className='flex flex-col'>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                        Gestionar Plan de Estudio
                    </h1>
                    <p className="text-muted-foreground">
                        {modality.name} - {modality.modality} ({modality.campus})
                    </p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button>Crear Nueva Materia</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Materia</DialogTitle>
                             <DialogDescription>
                                La materia se asignará automáticamente a {modality.name} ({modality.modality}).
                            </DialogDescription>
                        </DialogHeader>
                        <CreateSubjectForm 
                            careerName={modality.name} 
                            onSuccess={handleSuccess} 
                        />
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Materias del Plan</CardTitle>
                    <CardDescription>
                        Lista de materias asignadas a esta modalidad, agrupadas por semestre.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(groupedSubjects).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedSubjects).map(([semester, subjects]) => (
                                <div key={semester}>
                                    <h3 className="text-lg font-semibold text-white mb-2">Semestre {semester}</h3>
                                    <div className='rounded-xl overflow-hidden'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Docente</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {subjects.map(subject => (
                                                    <TableRow key={subject.id}>
                                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                                        <TableCell>{subject.teacher}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button size="icon" variant="warning">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                           <h3 className="text-lg font-semibold text-white">Plan de Estudios Vacío</h3>
                           <p className="text-muted-foreground mt-2">
                                Aún no se han creado materias para esta modalidad. <br/>
                                Usa el botón "Crear Nueva Materia" para empezar.
                           </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
