
"use client"

import { useState, useMemo } from "react"
import { Pencil, PlusCircle, Trash2, Search, ChevronDown, BookOpenCheck, Filter } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { careers as allCareers, subjects, planteles } from "@/lib/data"
import { Career } from "@/lib/modelos"
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
import { useAuth } from "@/context/auth-context"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { FilterPopover } from "@/components/ui/filter-popover"
import { Badge } from "@/components/ui/badge"


interface GroupedCareer {
    name: string;
    modalitiesByCampus: Record<string, Career[]>;
    allModalities: Career[];
}


export default function CareersPage() {
  const { user } = useAuth();
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<Record<string, number>>({});
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);

  const filteredGroupedCareers = useMemo(() => {
    let careersToProcess = allCareers;

    // Filter by selected campuses (UNION logic)
    if (selectedCampuses.length > 0) {
      careersToProcess = allCareers.filter(career => selectedCampuses.includes(career.campus));
    }

    // Filter by search term
    if (searchTerm) {
      careersToProcess = careersToProcess.filter(career => 
        career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Group the filtered careers
    const groups: Record<string, GroupedCareer> = {};
    careersToProcess.forEach(career => {
        const key = career.name;
        if (!groups[key]) {
            groups[key] = {
                name: career.name,
                modalitiesByCampus: {},
                allModalities: [],
            };
        }
        if (!groups[key].modalitiesByCampus[career.campus]) {
            groups[key].modalitiesByCampus[career.campus] = [];
        }
        groups[key].modalitiesByCampus[career.campus].push(career);
        groups[key].allModalities.push(career);
    });

    return Object.values(groups);
  }, [selectedCampuses, searchTerm]);

  const handleTabChange = (key: string, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [key]: value }))
  }
  
  const handleModalityChange = (key: string, modalityId: number) => {
    setSelectedModalities(prev => ({ ...prev, [key]: modalityId }));
  }

  const getOrdinal = (n: number) => {
    return `${n}°`;
  }

  
  const plantelOptions = useMemo(() => planteles.map(p => ({
    value: p.name,
    label: p.name
  })), []);


  const renderSubjectTabs = (career: Career, uniqueKey: string) => {
    const filteredSubjects = subjects.filter(
        (subject) => subject.career === career.name && subject.modality === career.modality && subject.semester <= career.semesters
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
    const campusesForGroup = Object.keys(group.modalitiesByCampus);
    const hasMultipleCampuses = campusesForGroup.length > 1;
    const isFiltered = selectedCampuses.length > 0;
    
    // Determine the primary campus to display info from
    const primaryCampus = isFiltered ? (campusesForGroup.find(c => selectedCampuses.includes(c)) || campusesForGroup[0]) : campusesForGroup[0];
    const modalitiesForPrimaryCampus = group.modalitiesByCampus[primaryCampus] || [];
    
    if (modalitiesForPrimaryCampus.length === 0) return null; // Should not happen with new logic, but a good safeguard.

    const key = group.name; // Use career name as the key
    const selectedModalityId = selectedModalities[key] || modalitiesForPrimaryCampus[0].id;
    const selectedCareer = group.allModalities.find(m => m.id === selectedModalityId)!;
    const hasSubjects = subjects.some(s => s.career === selectedCareer.name && s.modality === selectedCareer.modality && s.semester <= selectedCareer.semesters);

    const header = (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left w-full">
            <div>
                <CardTitle>{group.name}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    {campusesForGroup.map(campus => (
                        <Badge key={campus} variant="info">{campus}</Badge>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                {user?.rol === 'administrator' && (
                  <>
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
                  </>
                )}
            </div>
        </div>
    );
    
    if (isAccordion) {
        return (
            <AccordionItem value={key} key={key} className="bg-white/10 rounded-xl border-none">
                <Card className="flex flex-col p-0">
                    <AccordionTrigger asChild disabled={!hasSubjects}>
                        <div className="flex flex-1 items-center justify-between p-6">
                            {header}
                            {hasSubjects && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {modalitiesForPrimaryCampus.length > 1 && (
                            <div className="flex gap-2 pt-2 px-6 pb-4">
                                {modalitiesForPrimaryCampus.map(modality => (
                                    <Button
                                        key={modality.id}
                                        size="sm"
                                        variant={selectedCareer.id === modality.id ? "default" : "info-outline"}
                                        onClick={(e) => { e.stopPropagation(); handleModalityChange(key, modality.id); }}
                                        className="h-7 rounded-md"
                                    >
                                        {modality.modality}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground px-6 pb-4">{selectedCareer.coordinator}</p>
                        {renderSubjectTabs(selectedCareer, key)}
                    </AccordionContent>
                </Card>
            </AccordionItem>
        );
    }

    return (
         <Card key={key} className="flex flex-col">
            <CardHeader>
                {header}
            </CardHeader>
            <CardContent className="flex flex-col flex-grow pb-2">
                 <div className="flex gap-2 pt-2 px-6 pb-4">
                    {modalitiesForPrimaryCampus.map(modality => (
                        <Button
                            key={modality.id}
                            size="sm"
                            variant={selectedCareer.id === modality.id ? "default" : "info-outline"}
                            onClick={(e) => { e.stopPropagation(); handleModalityChange(key, modality.id); }}
                            className="h-7 rounded-md"
                        >
                            {modality.modality}
                        </Button>
                    ))}
                </div>
                 <p className="text-xs text-muted-foreground px-6 pb-4">{selectedCareer.coordinator}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroupedCareers.map(group => renderCareerContent(group, false))}
    </div>
  );


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          Carreras
        </h1>
        {user?.rol === 'administrator' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Carrera
                    </Button>
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
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
        <div className="relative w-full flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar carreras..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 items-center">
             <FilterPopover 
                title="Filtrar por Plantel"
                options={plantelOptions}
                selectedValues={selectedCampuses}
                onApply={setSelectedCampuses}
            />
        </div>
      </div>
      
      {user?.rol === 'administrator' ? renderAdminView() : renderDefaultView()}

    </div>
  )
}
