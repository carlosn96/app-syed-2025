"use client"

import * as React from "react"
import { 
  SupervisionState, 
  SupervisionAction, 
  RubroEvaluacion,
  RubroStatus,
  calcularEstadoRubro,
  todosRubrosCompletados
} from "@/lib/supervision-types"

// Reducer for supervision state management
function supervisionReducer(
  state: SupervisionState, 
  action: SupervisionAction
): SupervisionState {
  switch (action.type) {
    case 'SET_DECISION': {
      const rubros = state.rubros.map(rubro => {
        if (rubro.id !== action.rubroId) return rubro
        
        const evaluaciones = rubro.evaluaciones.map(evaluacion => {
          if (evaluacion.criterioId !== action.criterioId) return evaluacion
          return { ...evaluacion, decision: action.decision }
        })
        
        return { ...rubro, evaluaciones }
      })
      return { ...state, rubros }
    }
    
    case 'SET_COMENTARIO': {
      const rubros = state.rubros.map(rubro => {
        if (rubro.id !== action.rubroId) return rubro
        
        const evaluaciones = rubro.evaluaciones.map(evaluacion => {
          if (evaluacion.criterioId !== action.criterioId) return evaluacion
          return { ...evaluacion, comentario: action.comentario }
        })
        
        return { ...rubro, evaluaciones }
      })
      return { ...state, rubros }
    }
    
    case 'UPDATE_TEMA':
      return { 
        ...state, 
        contexto: { ...state.contexto, temaVisto: action.tema } 
      }
    
    case 'UPDATE_RESUMEN':
      return { 
        ...state, 
        contexto: { ...state.contexto, resumenGeneral: action.resumen } 
      }
    
    case 'TOGGLE_CONTEXT_PANEL':
      return { ...state, isContextPanelExpanded: !state.isContextPanelExpanded }
    
    case 'SET_CONTEXT_PANEL_EXPANDED':
      return { ...state, isContextPanelExpanded: action.expanded }
    
    case 'SET_CURRENT_RUBRO':
      return { ...state, currentRubroId: action.rubroId, currentCriterioIndex: 0 }
    
    case 'SET_CURRENT_CRITERIO_INDEX':
      return { ...state, currentCriterioIndex: action.index }
    
    case 'NEXT_CRITERIO': {
      const currentRubro = state.rubros.find(r => r.id === state.currentRubroId)
      if (!currentRubro) return state
      
      const nextIndex = state.currentCriterioIndex + 1
      if (nextIndex >= currentRubro.criterios.length) {
        // Last criterion - return to overview
        return { ...state, currentRubroId: null, currentCriterioIndex: 0 }
      }
      return { ...state, currentCriterioIndex: nextIndex }
    }
    
    case 'RESET_SUPERVISION':
      return createInitialState(
        state.docente,
        state.ciclo,
        state.rubros.map(r => ({
          ...r,
          evaluaciones: r.criterios.map(c => ({
            criterioId: c.id,
            decision: null,
            comentario: ''
          }))
        }))
      )
    
    case 'LOAD_SUPERVISION':
      return { ...state, ...action.state }
    
    default:
      return state
  }
}

// Create initial state
function createInitialState(
  docente: SupervisionState['docente'],
  ciclo: SupervisionState['ciclo'],
  rubros: RubroEvaluacion[]
): SupervisionState {
  return {
    id: null,
    docenteId: docente.id,
    docente,
    ciclo,
    contexto: {
      temaVisto: '',
      resumenGeneral: '',
      fechaSupervision: new Date()
    },
    rubros,
    isContextPanelExpanded: false,
    currentRubroId: null,
    currentCriterioIndex: 0
  }
}

// Context type
interface SupervisionContextType {
  state: SupervisionState
  dispatch: React.Dispatch<SupervisionAction>
  
  // Computed values
  rubrosStatus: RubroStatus[]
  currentRubro: RubroEvaluacion | null
  currentCriterio: RubroEvaluacion['criterios'][0] | null
  currentEvaluation: RubroEvaluacion['evaluaciones'][0] | null
  canSave: boolean
  
  // Actions
  setDecision: (rubroId: number, criterioId: string | number, decision: 'cumplido' | 'no_cumplido') => void
  setComentario: (rubroId: number, criterioId: string | number, comentario: string) => void
  updateTema: (tema: string) => void
  updateResumen: (resumen: string) => void
  toggleContextPanel: () => void
  navigateToRubro: (rubroId: number) => void
  nextCriterio: () => void
  goToOverview: () => void
}

const SupervisionContext = React.createContext<SupervisionContextType | null>(null)

// Provider Props
interface SupervisionProviderProps {
  children: React.ReactNode
  docente: SupervisionState['docente']
  ciclo: SupervisionState['ciclo']
  rubrosData: RubroEvaluacion[]
  initialState?: Partial<SupervisionState>
}

export function SupervisionProvider({
  children,
  docente,
  ciclo,
  rubrosData,
  initialState
}: SupervisionProviderProps) {
  const [state, dispatch] = React.useReducer(
    supervisionReducer,
    { docente, ciclo, rubrosData, initialState },
    ({ docente, ciclo, rubrosData, initialState }) => {
      const baseState = createInitialState(docente, ciclo, rubrosData)
      return initialState ? { ...baseState, ...initialState } : baseState
    }
  )
  
  // Computed values
  const rubrosStatus = React.useMemo(() => 
    state.rubros.map(calcularEstadoRubro),
    [state.rubros]
  )
  
  const currentRubro = React.useMemo(() => 
    state.rubros.find(r => r.id === state.currentRubroId) ?? null,
    [state.rubros, state.currentRubroId]
  )
  
  const currentCriterio = React.useMemo(() => 
    currentRubro?.criterios[state.currentCriterioIndex] ?? null,
    [currentRubro, state.currentCriterioIndex]
  )
  
  const currentEvaluation = React.useMemo(() => {
    if (!currentRubro || !currentCriterio) return null
    return currentRubro.evaluaciones.find(e => e.criterioId === currentCriterio.id) ?? null
  }, [currentRubro, currentCriterio])
  
  const canSave = React.useMemo(() => 
    todosRubrosCompletados(state.rubros),
    [state.rubros]
  )
  
  // Actions
  const setDecision = React.useCallback(
    (rubroId: number, criterioId: string | number, decision: 'cumplido' | 'no_cumplido') => {
      dispatch({ type: 'SET_DECISION', rubroId, criterioId, decision })
    },
    []
  )
  
  const setComentario = React.useCallback(
    (rubroId: number, criterioId: string | number, comentario: string) => {
      dispatch({ type: 'SET_COMENTARIO', rubroId, criterioId, comentario })
    },
    []
  )
  
  const updateTema = React.useCallback(
    (tema: string) => dispatch({ type: 'UPDATE_TEMA', tema }),
    []
  )
  
  const updateResumen = React.useCallback(
    (resumen: string) => dispatch({ type: 'UPDATE_RESUMEN', resumen }),
    []
  )
  
  const toggleContextPanel = React.useCallback(
    () => dispatch({ type: 'TOGGLE_CONTEXT_PANEL' }),
    []
  )
  
  const navigateToRubro = React.useCallback(
    (rubroId: number) => dispatch({ type: 'SET_CURRENT_RUBRO', rubroId }),
    []
  )
  
  const nextCriterio = React.useCallback(
    () => dispatch({ type: 'NEXT_CRITERIO' }),
    []
  )
  
  const goToOverview = React.useCallback(
    () => dispatch({ type: 'SET_CURRENT_RUBRO', rubroId: null }),
    []
  )
  
  const value: SupervisionContextType = {
    state,
    dispatch,
    rubrosStatus,
    currentRubro,
    currentCriterio,
    currentEvaluation,
    canSave,
    setDecision,
    setComentario,
    updateTema,
    updateResumen,
    toggleContextPanel,
    navigateToRubro,
    nextCriterio,
    goToOverview
  }
  
  return (
    <SupervisionContext.Provider value={value}>
      {children}
    </SupervisionContext.Provider>
  )
}

// Hook to use supervision context
export function useSupervision() {
  const context = React.useContext(SupervisionContext)
  if (!context) {
    throw new Error('useSupervision must be used within a SupervisionProvider')
  }
  return context
}
