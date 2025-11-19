
"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { getCareers } from '@/services/api'
import { CareerSummary } from '@/lib/modelos'

export default function CrearPlanEstudioPage() {
    const params = useParams()
    const careerId = Number(params.careerId);
    const [career, setCareer] = useState<CareerSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCareerInfo = async () => {
            if (isNaN(careerId)) return;
            try {
                setIsLoading(true);
                const careers = await getCareers();
                const currentCareer = careers.find(c => c.id === careerId);
                setCareer(currentCareer || null);
            } catch (error) {
                console.error("Failed to fetch career info", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCareerInfo();
    }, [careerId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de envío se implementará después
        console.log("Formulario enviado (simulación)");
    };

    return (
        <div className="flex flex-col gap-8">
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Crear Plan de Estudio
                </h1>
                <p className="text-muted-foreground">
                    Define una nueva modalidad para la carrera: {isLoading ? "Cargando..." : career?.name || `Carrera #${careerId}`}
                </p>
            </div>
            
            <Card className="rounded-xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Nueva Modalidad</CardTitle>
                        <CardDescription>
                            Completa los detalles para la nueva modalidad del plan de estudios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="modality-name">Nombre de la Modalidad</Label>
                            <Input id="modality-name" placeholder="Ej. Escolarizado, Sabatino" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semesters">Duración en Semestres</Label>
                            <Input id="semesters" type="number" placeholder="Ej. 9" />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                         <Button type="submit" className="w-full">
                            Crear y Continuar
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
