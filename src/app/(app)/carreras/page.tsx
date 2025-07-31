
"use client"
import { useState, useMemo } from "react"
import { Pencil, PlusCircle, Trash2, Search, ChevronDown, BookOpenCheck } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { careers as allCareers, subjects, Career } from "@/lib/data"
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


interface GroupedCareer {
    name: string;
    campus: string;
    modalities: Career[];
}


export default function CareersPage() {
  const { user } = useAuth();
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<Record<string, number>>({});

  const groupedCareers = useMemo(() => {
    const groups: Record<string, GroupedCareer> = {};
    allCareers.forEach(career => {
        const key = `${career.name}-${career.campus}`;
        if (!groups[key]) {
            groups[key] = {
                name: career.name,
                campus: career.campus,
                modalities: [],
            };
        }
        groups[key].modalities.push(career);
    });
    return Object.values(groups);
  }, []);

  const handleTabChange = (key: string, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [key]: value }))
  }
  
  const handleModalityChange = (key: string, modalityId: number) => {
    setSelectedModalities(prev => ({ ...prev, [key]: modalityId }));
  }

  const getOrdinal = (n: number) => {
    return `${n}°`;
  }

  const filteredGroupedCareers = groupedCareers.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.modalities.some(m => m.modality.toLowerCase().includes(searchTerm.toLowerCase())) ||
    group.modalities.some(m => m.coordinator.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderSubjectTabs = (career: Career, uniqueKey: string) => {
    const filteredSubjects = subjects.filter(
        (subject) => subject.career === career.name && subject.semester <= career.semesters
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
            value={activeTabs[uniqueKey] || defaultTabValue}
            onValueChange={(value) => handleTabChange(uniqueKey, value)}
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

  const renderCareerContent = (group: GroupedCareer, isAccordion: boolean) => {
    const key = `${group.name}-${group.campus}`;
    const selectedModalityId = selectedModalities[key] || group.modalities[0].id;
    const selectedCareer = group.modalities.find(m => m.id === selectedModalityId)!;
    const hasSubjects = subjects.some(s => s.career === selectedCareer.name && s.semester <= selectedCareer.semesters);

    const header = (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left w-full">
            <div>
                <CardTitle>{selectedCareer.name}</CardTitle>
                <CardDescription>{selectedCareer.campus}</CardDescription>
                 <p className="text-xs text-muted-foreground pt-2">{selectedCareer.coordinator}</p>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button size="icon" variant="warning" onClick={(e) => e.stopPropagation()}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
                <Button size="icon" variant="destructive" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                </Button>
                <Button asChild size="icon" variant="success" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/carreras/${encodeURIComponent(group.name)}`}>
                        <BookOpenCheck className="h-4 w-4" />
                        <span className="sr-only">Planes de estudio</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
    
    if (isAccordion) {
        return (
            <AccordionItem value={key} key={key} className="bg-white/10 rounded-xl border-none">
                <Card className="flex flex-col rounded-xl p-0">
                    <AccordionTrigger asChild disabled={!hasSubjects}>
                        <div className="flex flex-1 items-center justify-between p-6">
                            {header}
                            {hasSubjects && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {group.modalities.length > 1 && (
                            <div className="flex gap-2 pt-2 px-6 pb-4">
                                {group.modalities.map(modality => (
                                    <Button
                                        key={modality.id}
                                        size="sm"
                                        variant={selectedCareer.id === modality.id ? "default" : "outline-filter"}
                                        onClick={(e) => { e.stopPropagation(); handleModalityChange(key, modality.id); }}
                                        className="h-7 rounded-md"
                                    >
                                        {modality.modality}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {renderSubjectTabs(selectedCareer, key)}
                    </AccordionContent>
                </Card>
            </AccordionItem>
        );
    }

    return (
         <Card key={key} className="flex flex-col rounded-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left w-full">
                  <div>
                      <CardTitle>{selectedCareer.name}</CardTitle>
                      <CardDescription>{selectedCareer.campus}</CardDescription>
                      
                      {group.modalities.length > 1 && (
                          <div className="flex gap-2 pt-2">
                              {group.modalities.map(modality => (
                                  <Button
                                      key={modality.id}
                                      size="sm"
                                      variant={selectedCareer.id === modality.id ? "default" : "outline-filter"}
                                      onClick={(e) => { e.stopPropagation(); handleModalityChange(key, modality.id); }}
                                      className="h-7 rounded-md"
                                  >
                                      {modality.modality}
                                  </Button>
                              ))}
                          </div>
                      )}
                      <p className="text-xs text-muted-foreground pt-2">{selectedCareer.coordinator}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                      <Button size="icon" variant="warning" onClick={(e) => e.stopPropagation()}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                      </Button>
                      <Button size="icon" variant="destructive" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                      </Button>
                      <Button asChild size="icon" variant="success" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/carreras/${encodeURIComponent(group.name)}`}>
                              <BookOpenCheck className="h-4 w-4" />
                              <span className="sr-only">Planes de estudio</span>
                          </Link>
                      </Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow pb-2">
                {renderSubjectTabs(selectedCareer, key)}
            </CardContent>
        </Card>
    );
  };


  const renderAdminView = () => (
    <Accordion type="single" collapsible className="w-full space-y-4">
        {filteredGroupedCareers.map(group => renderCareerContent(group, true))}
    </Accordion>
  );

  const renderDefaultView = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {filteredGroupedCareers.map(group => renderCareerContent(group, false))}
    </div>
  );


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras
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
