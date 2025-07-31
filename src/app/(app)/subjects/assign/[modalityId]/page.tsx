
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ManageModalitySubjectsPage() {
    const params = useParams()
    const modalityId = Number(params.modalityId)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const [_, setForceRender] = useState(0); 

    const modality = useMemo(() => {
        return careers.find(c => c.id === modalityId)
    }, [modalityId])

    const subjectsForModality = useMemo(() => {
      if (!modality) return [];
      return allSubjects
          .filter(s => s.career === modality.name) 
          .sort((a, b) => a.semester - b.semester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modality, _]);

    const semesters = useMemo(() => {
        if (!modality) return [];
        return Array.from({ length: modality.semesters }, (_, i) => i + 1);
    }, [modality]);

    const handleOpenModal = (semester: number) => {
        setSelectedSemester(semester);
        setIsModalOpen(true);
    };
    
    const handleSuccess = () => {
        setIsModalOpen(false);
        setSelectedSemester(null);
        setForceRender(Math.random()); 
    };
    
    if (!modality) {
        return <div>Modalidad no encontrada.</div>
    }

    const getOrdinal = (n: number) => {
        return `${n}°`;
    };
    
    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Gestionar Plan de Estudio
                </h1>
                <p className="text-muted-foreground">
                    {modality.name} - {modality.modality} ({modality.campus})
                </p>
            </div>
            
             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Materia</DialogTitle>
                         <DialogDescription>
                            La materia se asignará automáticamente a {modality.name} ({modality.modality}) en el {getOrdinal(selectedSemester || 0)} Grado.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateSubjectForm 
                        careerName={modality.name} 
                        semester={selectedSemester}
                        onSuccess={handleSuccess} 
                    />
                </DialogContent>
             </Dialog>


            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Materias del Plan</CardTitle>
                    <CardDescription>
                        Lista de materias asignadas a esta modalidad, agrupadas por grado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {semesters.length > 0 ? (
                        <Tabs defaultValue={`sem-${semesters[0]}`} className="w-full">
                            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0, 1fr))`}}>
                                {semesters.map(semester => (
                                     <TabsTrigger key={semester} value={`sem-${semester}`} className="text-xs">
                                        {getOrdinal(semester)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {semesters.map(semester => {
                                const semesterSubjects = subjectsForModality.filter(s => s.semester === semester);
                                return (
                                    <TabsContent key={semester} value={`sem-${semester}`}>
                                        <div className="flex justify-end my-4">
                                            <Button onClick={() => handleOpenModal(semester)}>
                                                Crear Materia
                                            </Button>
                                        </div>
                                        {semesterSubjects.length > 0 ? (
                                            <div className='rounded-xl overflow-hidden'>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nombre</TableHead>
                                                            <TableHead>Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {semesterSubjects.map(subject => (
                                                            <TableRow key={subject.id}>
                                                                <TableCell className="font-medium">{subject.name}</TableCell>
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
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                                                <h3 className="text-lg font-semibold text-white">Grado Vacío</h3>
                                                <p className="text-muted-foreground mt-2">
                                                    Aún no se han creado materias para este grado. <br/>
                                                    Usa el botón "Crear Nueva Materia" para empezar.
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                )
                            })}
                        </Tabs>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                           <h3 className="text-lg font-semibold text-white">Plan de Estudios Vacío</h3>
                           <p className="text-muted-foreground mt-2">
                                Aún no se han creado materias para esta modalidad. <br/>
                                El plan de estudios debe tener al menos 1 semestre.
                           </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
