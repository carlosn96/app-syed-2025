"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useRef } from "react"
import { Toast } from "primereact/toast"

import { SupervisionProvider, useSupervision } from "@/context/supervision-context"
import { 
  SupervisionDocenteOverview, 
  RubroSupervisionView 
} from "@/components/supervision"
import { RubroEvaluacion } from "@/lib/supervision-types"
import { supervisionRubrics, supervisions } from "@/lib/data"

// Transform API rubrics to our format
function transformRubrics(apiRubrics: typeof supervisionRubrics): RubroEvaluacion[] {
  return apiRubrics.map(rubric => ({
    id: rubric.id,
    nombre: rubric.title,
    tipo: rubric.category,
    criterios: rubric.criteria.map(c => ({
      id: c.id,
      texto: c.text
    })),
    evaluaciones: rubric.criteria.map(c => ({
      criterioId: c.id,
      decision: null,
      comentario: ''
    }))
  }))
}

// Inner component that uses the context
function SupervisionEvaluateContent() {
  const router = useRouter()
  const toast = useRef<Toast>(null)
  const params = useParams()
  const supervisionId = Number(params.supervisionId)
  
  const { state, currentRubro, canSave, rubrosStatus } = useSupervision()
  
  // Find supervision in mock data
  const supervision = React.useMemo(() => {
    return supervisions.find(s => s.id === supervisionId)
  }, [supervisionId])

  // Handle save
  const handleSave = () => {
    // Calculate final score from countable rubrics
    const contableRubros = rubrosStatus.filter(r => r.tipo === 'Contable')
    const finalScore = contableRubros.length > 0
      ? Math.round(contableRubros.reduce((sum, r) => sum + r.porcentaje, 0) / contableRubros.length)
      : 0
    
    // Update supervision in mock data
    const supervisionIndex = supervisions.findIndex(s => s.id === supervisionId)
    if (supervisionIndex !== -1) {
      supervisions[supervisionIndex].status = 'Completada'
      supervisions[supervisionIndex].score = finalScore
    }
    
    // Prepare data for submission
    const submissionData = {
      supervisionId,
      docenteId: state.docenteId,
      cicloId: state.ciclo.id,
      contexto: state.contexto,
      rubros: state.rubros.map(rubro => ({
        id: rubro.id,
        nombre: rubro.nombre,
        tipo: rubro.tipo,
        evaluaciones: rubro.evaluaciones
      })),
      fechaGuardado: new Date().toISOString(),
      puntajeFinal: finalScore
    }
    
    console.log("Supervisión guardada:", submissionData)
    
    toast.current?.show({
      severity: "success",
      summary: "Supervisión Completada",
      detail: `Evaluación guardada exitosamente. Puntaje: ${finalScore}%`,
      life: 3000
    })
    
    // Navigate back after a short delay
    setTimeout(() => {
      router.push('/supervision')
    }, 1500)
  }

  // Handle back navigation
  const handleBack = () => {
    router.push('/supervision')
  }

  if (!supervision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Supervisión no encontrada</p>
      </div>
    )
  }

  return (
    <>
      <Toast ref={toast} position="top-center" />
      
      {/* Render based on current view */}
      {currentRubro ? (
        <RubroSupervisionView />
      ) : (
        <SupervisionDocenteOverview
          onSave={handleSave}
          onBack={handleBack}
        />
      )}
    </>
  )
}

// Main page component with provider
export default function SupervisionEvaluatePage() {
  const params = useParams()
  const router = useRouter()
  const supervisionId = Number(params.supervisionId)
  
  // Find supervision in mock data
  const supervision = React.useMemo(() => {
    return supervisions.find(s => s.id === supervisionId)
  }, [supervisionId])
  
  // Transform rubrics to our format
  const rubrosData = React.useMemo(() => {
    return transformRubrics(supervisionRubrics)
  }, [])

  if (!supervision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Supervisión no encontrada</p>
      </div>
    )
  }

  // Create docente and ciclo from supervision data
  const docente = {
    id: 1, // Would come from API
    nombreCompleto: supervision.teacher,
    programa: supervision.career
  }

  const ciclo = {
    id: 1, // Would come from API
    nombre: "2024-B",
    activo: true
  }

  return (
    <SupervisionProvider
      docente={docente}
      ciclo={ciclo}
      rubrosData={rubrosData}
    >
      <SupervisionEvaluateContent />
    </SupervisionProvider>
  )
}
