/**
 * Types for Mobile-First Teacher Supervision Interface
 * Ciclo-based evaluation system with binary criteria decisions
 */

// Cycle information (read-only, from server)
export interface CicloEscolarInfo {
  id: number;
  nombre: string; // e.g., "2024-B"
  activo: boolean;
}

// Teacher being supervised
export interface DocenteSupervision {
  id: number;
  nombreCompleto: string;
  programa: string; // Academic program
}

// Individual criterion evaluation state
export interface CriterionEvaluation {
  criterioId: string | number;
  decision: 'cumplido' | 'no_cumplido' | null; // null = pending
  comentario?: string;
}

// Rubric with criteria and evaluation state
export interface RubroEvaluacion {
  id: number;
  nombre: string;
  tipo: 'Contable' | 'No Contable';
  criterios: {
    id: string | number;
    texto: string;
  }[];
  evaluaciones: CriterionEvaluation[];
}

// Global supervision context (editable)
export interface SupervisionContexto {
  temaVisto: string;
  resumenGeneral: string;
  fechaSupervision: Date; // Auto-calculated, read-only
}

// Complete supervision state
export interface SupervisionState {
  // Identifiers
  id: number | null;
  docenteId: number;
  
  // Read-only context
  docente: DocenteSupervision;
  ciclo: CicloEscolarInfo;
  
  // Editable context
  contexto: SupervisionContexto;
  
  // Evaluation data
  rubros: RubroEvaluacion[];
  
  // UI state
  isContextPanelExpanded: boolean;
  currentRubroId: number | null;
  currentCriterioIndex: number;
}

// Computed values for UI
export interface RubroStatus {
  id: number;
  nombre: string;
  tipo: 'Contable' | 'No Contable';
  totalCriterios: number;
  criteriosEvaluados: number;
  criteriosCumplidos: number;
  porcentaje: number; // Only meaningful for Contable
  completado: boolean;
}

// Actions for supervision state
export type SupervisionAction =
  | { type: 'SET_DECISION'; rubroId: number; criterioId: string | number; decision: 'cumplido' | 'no_cumplido' }
  | { type: 'SET_COMENTARIO'; rubroId: number; criterioId: string | number; comentario: string }
  | { type: 'UPDATE_TEMA'; tema: string }
  | { type: 'UPDATE_RESUMEN'; resumen: string }
  | { type: 'TOGGLE_CONTEXT_PANEL' }
  | { type: 'SET_CONTEXT_PANEL_EXPANDED'; expanded: boolean }
  | { type: 'SET_CURRENT_RUBRO'; rubroId: number | null }
  | { type: 'SET_CURRENT_CRITERIO_INDEX'; index: number }
  | { type: 'NEXT_CRITERIO' }
  | { type: 'RESET_SUPERVISION' }
  | { type: 'LOAD_SUPERVISION'; state: Partial<SupervisionState> };

// Helper function to calculate rubric status
export function calcularEstadoRubro(rubro: RubroEvaluacion): RubroStatus {
  const totalCriterios = rubro.criterios.length;
  const criteriosEvaluados = rubro.evaluaciones.filter(e => e.decision !== null).length;
  const criteriosCumplidos = rubro.evaluaciones.filter(e => e.decision === 'cumplido').length;
  const porcentaje = totalCriterios > 0 ? Math.round((criteriosCumplidos / totalCriterios) * 100) : 0;
  
  return {
    id: rubro.id,
    nombre: rubro.nombre,
    tipo: rubro.tipo,
    totalCriterios,
    criteriosEvaluados,
    criteriosCumplidos,
    porcentaje,
    completado: criteriosEvaluados === totalCriterios
  };
}

// Check if all rubrics are completed
export function todosRubrosCompletados(rubros: RubroEvaluacion[]): boolean {
  return rubros.every(rubro => {
    const estado = calcularEstadoRubro(rubro);
    return estado.completado;
  });
}

// Format date for display
export function formatearFechaSupervision(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia} / ${mes} / ${anio}`;
}
