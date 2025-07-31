
"use client"
import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { Button } from "@/components/ui/button"
import { Book, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateCareerForm } from "@/components/create-career-form"


export default function CareerPlansPage() {
  const params = useParams();
  const careerName = decodeURIComponent(params.careerName as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_, setForceRender] = useState(0);

  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  const careerModalities = useMemo(() => {
    return allCareers.filter(c => c.name === careerName);
  }, [careerName, _]);

  const handleTabChange = (key: string, value: string) => {
    setActiveTabs((prev) => ({ ...prev, [key]: value }));
  };

  const getOrdinal = (n: number) => {
    return `${n}°`;
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setForceRender(Math.random());
  }

  const renderSubjectTabs = (career: Career, uniqueKey: string) => {
    const filteredSubjects = subjects.filter(
      (subject) => subject.career === career.name && subject.semester <= career.semesters
    );
    const semesters = Array.from(
      new Set(filteredSubjects.map((s) => s.semester))
    ).sort((a, b) => a - b);
    const defaultTabValue = semesters.length > 0 ? `sem-${semesters[0]}` : "";

    if (semesters.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            No hay materias asignadas para este plan de estudio aún.
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
          style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0, 1fr))` }}
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
    );
  };

  if (careerModalities.length === 0 && !careerName) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <FloatingBackButton />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            {`Planes de Estudio: ${careerName}`}
          </h1>
          <p className="text-muted-foreground">
              Modalidades disponibles para esta carrera.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button>Crear Plan de Estudio</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Plan de Estudio</DialogTitle>
                    <DialogDescription>
                        Completa el formulario para registrar una nueva modalidad para {careerName}.
                    </DialogDescription>
                </DialogHeader>
                <CreateCareerForm onSuccess={handleSuccess} careerName={careerName} />
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {careerModalities.length > 0 ? careerModalities.map(modality => {
            const key = `${modality.name}-${modality.campus}-${modality.modality}`;
            return (
                <Card key={key} className="flex flex-col rounded-xl">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{modality.modality}</CardTitle>
                                <CardDescription>{modality.campus}</CardDescription>
                                <p className="text-xs text-muted-foreground pt-2">{modality.coordinator}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="warning">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                </Button>
                                <Button size="icon" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                                <Button asChild size="icon" variant="default">
                                    <Link href={`/subjects/assign/${modality.id}`}>
                                        <Book className="h-4 w-4" />
                                        <span className="sr-only">Gestionar Materias</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pb-2">
                        {renderSubjectTabs(modality, key)}
                    </CardContent>
                </Card>
            )
        }) : (
             <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-xl">
                <h3 className="text-lg font-semibold text-white">No hay planes de estudio</h3>
                <p className="text-muted-foreground mt-2">
                    Aún no se han creado planes de estudio para esta carrera. <br/>
                    Usa el botón "Crear Plan de Estudio" para empezar.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
