
export interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  id_rol: number;
  rol: string;
  fecha_registro: string;
  ultimo_acceso: string | null;
  grupo?: string;
  rol_nombre?: string;
}

export interface Alumno {
  id_alumno: number;
  id_usuario: number;
  matricula: string;
  nombre_completo: string;
  correo: string;
  id_carrera: number;
  carrera: string;
}

export interface Docente {
  id_docente: number;
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  grado_academico: string;
}

export interface Coordinador {
  id_coordinador: number;
  usuario_id: number;
  nombre_completo: string;
  correo: string;
  rol: string;
  fecha_registro: string;
  ultimo_acceso: string;
}

export const Roles = {
    Administrador: 1,
    Coordinador: 2,
    Docente: 3,
    Alumno: 4,
  };
  
  export const roleRedirects: { [key: number]: string } = {
    [Roles.Administrador]: '/dashboard',
    [Roles.Coordinador]: '/dashboard',
    [Roles.Docente]: '/dashboard',
    [Roles.Alumno]: '/dashboard',
  };
  
  export const getRedirectPath = (roleId: number): string => {
    return roleRedirects[roleId] || '/dashboard'; // Fallback to /dashboard
  };


export interface Plantel {
  id: number;
  name: string;
  location: string;
  director: string;
}

export interface Career {
  id: number;
  name: string;
  modality: string;
  campus: string;
  semesters: number;
  coordinator: string;
}

export interface Subject {
  id: number;
  name: string;
  career: string;
  semester: number;
  modality: string;
}

export interface Teacher {
    id: number;
    name: string;
}

export type EvaluationResult = {
  [key: string]: {
    criteria: { [key: string]: "yes" | "no" },
    observations: string
  }
}
export interface Supervision {
    id: number;
    teacher: string;
    career: string;
    coordinator: string;
    date: Date | null;
    status: 'Programada' | 'Completada';
    startTime: string;
    endTime: string;
    score?: number;
    evaluationData?: EvaluationResult;
}

export type EvaluationRating = 'excelente' | 'bueno' | 'regular' | 'necesita_mejorar' | 'deficiente';

export interface Evaluation {
  id: number;
  student: string;
  teacherName: string;
  groupName: string;
  feedback: string;
  date: string;
  overallRating: number;
  evaluationBatchId?: string; // Used to group evaluations from the same "session"
  ratings: {
    clarity: EvaluationRating;
    engagement: EvaluationRating;
    punctuality: EvaluationRating;
    knowledge: EvaluationRating;
  };
}


export interface Group {
  id: number;
  name: string;
  career: string;
  semester: number;
  cycle: string;
  turno: string;
  students: number[];
}

export interface Schedule {
  id: number;
  teacherId: number;
  subjectId: number;
  groupId: number;
  groupName: string;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface SupervisionCriterion {
  id: string;
  text: string;
}

export interface SupervisionRubric {
  id: number;
  title: string;
  type: 'checkbox';
  category: 'Contable' | 'No Contable';
  criteria: SupervisionCriterion[];
}

export interface EvaluationCriterion {
    id: string;
    text: string;
}

export interface EvaluationRubric {
    id: number;
    category: string;
    criteria: EvaluationCriterion[];
}

export interface EvaluationPeriod {
  id: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  careers: string[];
}
