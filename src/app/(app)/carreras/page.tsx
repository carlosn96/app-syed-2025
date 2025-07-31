
"use client"
import { useState } from "react"
import { Pencil, PlusCircle, Trash2, Search, ChevronDown } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { careers as allCareers, subjects } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateCareerForm } from "@/components/create-career-form"
import { Input } from "@/components/ui/input"
import { FloatingButton } from "@/components/ui/floating-button"
import { useAuth } from "@/context/auth-context"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


export default function CareersPage() {
  const { user } = useAuth();
  const [activeTabs, setActiveTabs] = useState<Record<number, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (careerId: number, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [careerId]: value }))
  }

  const getOrdinal = (n: number) => {
    return `${n}°`;
  }

  const filteredCareers = allCareers.filter(career => 
    career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    career.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    career.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSubjectTabs = (career: any) => {
    const filteredSubjects = subjects.filter(
        (subject) => subject.career === career.name
    )
    const semesters = Array.from(
        new Set(filteredSubjects.map((s) => s.semester))
    ).sort((a, b) => a - b)
    const defaultTabValue =
        semesters.length > 0 ? `sem-${semesters[0]}` : ""
    
    if (semesters.length === 0) {
        return (
            <div className="flex-grow flex items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                    No hay materias asignadas para esta carrera aún.
                </p>
            </div>
        );
    }
    
    return (
         <Tabs
            defaultValue={defaultTabValue}
            value={activeTabs[career.id] || defaultTabValue}
            onValueChange={(value) => handleTabChange(career.id, value)}
            className="flex flex-col flex-grow w-full p-6 pt-0"
        >
            <div className="flex-grow">
            {semesters.map((semester) => (
                <TabsContent key={semester} value={`sem-${semester}`}>
                <ul className="space-y-3">
                    {filteredSubjects
                    .filter((s) => s.semester === semester)
                    .map((subject) => (
                        <li key={subject.id}>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {subject.teacher}
                        </p>
                        </li>
                    ))}
                </ul>
                </TabsContent>
            ))}
            </div>
            <TabsList 
                className="grid w-full mt-4" 
                style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0, 1fr))`}}
            >
            {semesters.map((semester) => (
                <TabsTrigger 
                    key={semester} 
                    value={`sem-${semester}`}
                    className="text-xs"
                >
                    {getOrdinal(semester)}
                </TabsTrigger>
            ))}
            </TabsList>
        </Tabs>
    )
  }

  const renderAdminView = () => (
    <Accordion type="single" collapsible className="w-full space-y-4">
        {filteredCareers.map((career) => {
             const hasSubjects = subjects.some(s => s.career === career.name);
             return (
                <AccordionItem value={`item-${career.id}`} key={career.id} className="bg-white/10 rounded-xl border-none">
                    <Card className="flex flex-col rounded-xl p-0">
                         <AccordionTrigger className="w-full" disabled={!hasSubjects}>
                            <CardHeader className="flex-grow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left">
                                    <div>
                                        <CardTitle>{career.name}</CardTitle>
                                        <CardDescription>{career.campus}</CardDescription>
                                        <p className="text-xs text-muted-foreground pt-1">{career.coordinator}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="icon" variant="warning">
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <Button size="icon" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Eliminar</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                         </AccordionTrigger>
                        <AccordionContent>
                           {renderSubjectTabs(career)}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
             )
        })}
    </Accordion>
  );

  const renderDefaultView = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {filteredCareers.map((career) => (
            <Card key={career.id} className="flex flex-col rounded-xl">
              <CardHeader>
                 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle>{career.name}</CardTitle>
                    <CardDescription>{career.campus}</CardDescription>
                     <p className="text-xs text-muted-foreground pt-1">{career.coordinator}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="icon" variant="warning">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow pb-2">
                {renderSubjectTabs(career)}
              </CardContent>
            </Card>
        ))}
    </div>
  );


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Planes de Estudio
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <FloatingButton text="Crear Carrera" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Carrera</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar una nueva carrera.
                    </DialogDescription>
                </DialogHeader>
                <CreateCareerForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar carreras..."
                className="pl-9 w-full sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {user?.rol === 'administrator' ? renderAdminView() : renderDefaultView()}

    </div>
  )
}
