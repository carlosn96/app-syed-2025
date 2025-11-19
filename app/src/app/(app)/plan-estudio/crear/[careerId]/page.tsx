
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import { FloatingBackButton } from '@/components/ui/floating-back-button'
import { CreateStudyPlanForm } from '@/components/create-study-plan-form'
import { CareerSummary } from '@/lib/modelos'
import { getCareers } from '@/services/api'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'

export default function CrearPlanEstudioPage() {
    const params = useParams()
    const router = useRouter()
    const toast = useRef<Toast>(null)
    const careerId = Number(params.careerId)

    const [career, setCareer] = useState<CareerSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isNaN(careerId)) {
            setError("ID de carrera inválido.")
            setIsLoading(false)
            return
        }

        const fetchCareerData = async () => {
            setIsLoading(true)
            try {
                const careers = await getCareers()
                const currentCareer = careers.find(c => c.id === careerId)
                if (!currentCareer) {
                    throw new Error("No se encontró la carrera.")
                }
                setCareer(currentCareer)
            } catch (err: any) {
                setError(err.message || "Error al cargar los datos de la carrera.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchCareerData()
    }, [careerId])

    const handleSuccess = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Plan de Estudio Creado',
            detail: 'La modalidad se ha asignado correctamente a la carrera.',
        });
        // Redirect back to the study plan page after a short delay
        setTimeout(() => {
            router.push(`/plan-estudio/${careerId}`);
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    if (error || !career) {
        return (
            <div className="flex flex-col gap-8 text-center">
                <FloatingBackButton />
                <p className="text-destructive">{error || "No se pudo cargar la información de la carrera."}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <Toast ref={toast} />
            <FloatingBackButton />
            <div className="flex flex-col">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                    Crear Plan de Estudio para {career.name}
                </h1>
                <p className="text-muted-foreground">
                    Asigna una nueva modalidad a esta carrera para comenzar a construir su plan de estudios.
                </p>
            </div>

            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Nueva Modalidad</CardTitle>
                    <CardDescription>
                        Selecciona una modalidad existente para asignarla a la carrera de <span className='font-bold text-white'>{career.name}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateStudyPlanForm careerId={careerId} onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </div>
    )
}
