

export interface User {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    rol: 'administrator' | 'coordinator' | 'teacher' | 'student';
    fecha_registro: string;
    ultimo_acceso: string | null;
    grupo?: string;
    id_rol?: number;
    rol_nombre?: string;
}

export const users: User[] = [
    { id: 1, nombre: 'Ana', apellido_paterno: 'García', apellido_materno: 'López', correo: 'ana.garcia@example.com', rol: 'student', fecha_registro: '2023-01-15', ultimo_acceso: '2024-05-20T10:00:00Z', grupo: 'COMPINCO2024A' },
    { id: 2, nombre: 'Luis', apellido_paterno: 'Martínez', apellido_materno: 'Hernández', correo: 'luis.martinez@example.com', rol: 'student', fecha_registro: '2023-01-16', ultimo_acceso: '2024-05-21T09:00:00Z', grupo: 'COMPINCO2024A' },
    { id: 3, nombre: 'Carlos', apellido_paterno: 'Ramírez', apellido_materno: 'Pérez', correo: 'carlos.ramirez@example.com', rol: 'teacher', fecha_registro: '2022-08-20', ultimo_acceso: '2024-05-21T08:30:00Z' },
    { id: 4, nombre: 'Sofía', apellido_paterno: 'Gómez', apellido_materno: 'Díaz', correo: 'sofia.gomez@example.com', rol: 'coordinator', fecha_registro: '2021-06-10', ultimo_acceso: '2024-05-21T11:00:00Z' },
    { id: 5, nombre: 'Javier', apellido_paterno: 'Torres', apellido_materno: 'Vargas', correo: 'javier.torres@example.com', rol: 'administrator', fecha_registro: '2020-01-05', ultimo_acceso: '2024-05-21T12:00:00Z' },
    { id: 6, nombre: 'Laura', apellido_paterno: 'Rojas', apellido_materno: 'Mendoza', correo: 'laura.rojas@example.com', rol: 'teacher', fecha_registro: '2023-02-10', ultimo_acceso: '2024-05-20T15:00:00Z' },
    { id: 7, nombre: 'Miguel', apellido_paterno: 'Vázquez', apellido_materno: 'Castro', correo: 'miguel.vazquez@example.com', rol: 'student', fecha_registro: '2023-08-22', ultimo_acceso: '2024-05-19T14:00:00Z', grupo: 'LAET2024B' },
    { id: 8, nombre: 'Isabela', apellido_paterno: 'Reyes', apellido_materno: 'Soto', correo: 'isabela.reyes@example.com', rol: 'student', fecha_registro: '2023-08-22', ultimo_acceso: '2024-05-18T16:00:00Z', grupo: 'LAET2024B' },
    { id: 9, nombre: 'admin', apellido_paterno: 'admin', apellido_materno: 'admin', correo: 'admin', rol: 'administrator', fecha_registro: '2020-01-05', ultimo_acceso: '2024-05-21T12:00:00Z' },
    { id: 10, nombre: 'student', apellido_paterno: 'student', apellido_materno: 'student', correo: 'student', rol: 'student', fecha_registro: '2023-01-15', ultimo_acceso: '2024-05-20T10:00:00Z', grupo: 'COMPINCO2024A' },
    { id: 11, nombre: 'teacher', apellido_paterno: 'teacher', apellido_materno: 'teacher', correo: 'teacher', rol: 'teacher', fecha_registro: '2022-08-20', ultimo_acceso: '2024-05-21T08:30:00Z' },
    { id: 12, nombre: 'coordinator', apellido_paterno: 'coordinator', apellido_materno: 'coordinator', correo: 'coordinator', rol: 'coordinator', fecha_registro: '2021-06-10', ultimo_acceso: '2024-05-21T11:00:00Z' },
];

export interface Plantel {
    id: number;
    name: string;
    location: string;
    director: string;
}

export const planteles: Plantel[] = [
    { id: 1, name: 'Reynosa', location: 'Reynosa, Tamaulipas', director: 'Dr. Armando Flores' },
    { id: 2, name: 'Río Bravo', location: 'Río Bravo, Tamaulipas', director: 'Lic. Sandra Torres' },
    { id: 3, name: 'Matamoros', location: 'Matamoros, Tamaulipas', director: 'Ing. Roberto Morales' },
];

export interface Career {
    id: number;
    name: string;
    modality: string;
    campus: string;
    semesters: number;
    coordinator: string;
}

export const careers: Career[] = [
    { id: 1, name: 'Ingeniería en Computación', modality: 'INCO', campus: 'Reynosa', semesters: 9, coordinator: 'Sofía Gómez Díaz' },
    { id: 2, name: 'Licenciatura en Administración', modality: 'LAET', campus: 'Reynosa', semesters: 8, coordinator: 'Sofía Gómez Díaz' },
    { id:_3, name: 'Derecho', modality: 'LDE', campus: 'Reynosa', semesters: 10, coordinator: 'Sofía Gómez Díaz' },
    { id: 4, name: 'Ingeniería en Computación', modality: 'INCO-S', campus: 'Río Bravo', semesters: 9, coordinator: 'Sofía Gómez Díaz' },
    { id: 5, name: 'Licenciatura en Administración', modality: 'LAET-M', campus: 'Matamoros', semesters: 8, coordinator: 'Sofía Gómez Díaz' },
];


export interface Subject {
    id: number;
    name: string;
    career: string;
    semester: number;
    modality: string;
}

export const subjects: Subject[] = [
    { id: 1, name: 'Cálculo Diferencial', career: 'Ingeniería en Computación', semester: 1, modality: 'INCO' },
    { id: 2, name: 'Programación Orientada a Objetos', career: 'Ingeniería en Computación', semester: 2, modality: 'INCO' },
    { id: 3, name: 'Estructura de Datos', career: 'Ingeniería en Computación', semester: 3, modality: 'INCO' },
    { id: 4, name: 'Contabilidad Básica', career: 'Licenciatura en Administración', semester: 1, modality: 'LAET' },
    { id: 5, name: 'Microeconomía', career: 'Licenciatura en Administración', semester: 2, modality: 'LAET' },
    { id: 6, name: 'Derecho Romano', career: 'Derecho', semester: 1, modality: 'LDE' },
    { id: 7, name: 'Cálculo Diferencial', career: 'Ingeniería en Computación', semester: 1, modality: 'INCO-S' },
];

export interface Teacher {
    id: number;
    name: string;
}

export const teachers: Teacher[] = [
    { id: 1, name: "Carlos Ramírez Pérez" },
    { id: 2, name: "Laura Rojas Mendoza" },
    { id: 3, name: "Ricardo Palma Solis" },
    { id: 4, name: "Mónica Salazar Cruz" },
];

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


export const supervisions: Supervision[] = [
    {
        id: 1,
        teacher: 'Carlos Ramírez Pérez',
        career: 'Ingeniería en Computación',
        coordinator: 'Sofía Gómez Díaz',
        date: new Date('2024-06-10'),
        status: 'Completada',
        startTime: '10:00',
        endTime: '11:00',
        score: 85,
        evaluationData: {
            rubric_1: {
                criteria: {
                    criterion_1_1: 'yes',
                    criterion_1_2: 'no',
                    criterion_1_3: 'yes'
                },
                observations: "El docente debe mejorar la presentación de los materiales."
            },
            rubric_2: {
                criteria: {
                    criterion_2_1: 'yes',
                    criterion_2_2: 'yes',
                },
                observations: "Excelente interacción con los alumnos."
            }
        }
    },
    {
        id: 2,
        teacher: 'Laura Rojas Mendoza',
        career: 'Licenciatura en Administración',
        coordinator: 'Sofía Gómez Díaz',
        date: new Date('2024-06-12'),
        status: 'Programada',
        startTime: '12:00',
        endTime: '13:00'
    },
    {
        id: 3,
        teacher: 'Ricardo Palma Solis',
        career: 'Derecho',
        coordinator: 'Sofía Gómez Díaz',
        date: new Date('2024-06-15'),
        status: 'Programada',
        startTime: '09:00',
        endTime: '10:00'
    }
];

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


export const evaluations: Evaluation[] = [
    { 
        id: 1, 
        student: "Ana García López", 
        teacherName: "Carlos Ramírez Pérez", 
        groupName: "COMPINCO2024A",
        feedback: "El profesor explica muy bien, pero a veces va muy rápido.",
        date: "2024-05-20T10:00:00Z",
        overallRating: 85,
        evaluationBatchId: 'eval-batch-1',
        ratings: { clarity: 'bueno', engagement: 'excelente', punctuality: 'excelente', knowledge: 'bueno' }
    },
    { 
        id: 2, 
        student: "Luis Martínez Hernández", 
        teacherName: "Carlos Ramírez Pérez", 
        groupName: "COMPINCO2024A",
        feedback: "Las clases son interesantes y dinámicas.",
        date: "2024-05-21T10:00:00Z",
        overallRating: 95,
        evaluationBatchId: 'eval-batch-1',
        ratings: { clarity: 'excelente', engagement: 'excelente', punctuality: 'excelente', knowledge: 'excelente' }
    },
    { 
        id: 3, 
        student: "Ana García López", 
        teacherName: "Laura Rojas Mendoza",
        groupName: "COMPINCO2024A",
        feedback: "Me gustaría que usara más ejemplos prácticos.",
        date: "2024-05-22T11:00:00Z",
        overallRating: 75,
        evaluationBatchId: 'eval-batch-1',
        ratings: { clarity: 'bueno', engagement: 'bueno', punctuality: 'excelente', knowledge: 'regular' }
    },
    { 
        id: 4, 
        student: "Miguel Vázquez Castro", 
        teacherName: "Ricardo Palma Solis",
        groupName: "LAET2024B",
        feedback: "El profesor es un experto en el tema, sus clases son muy enriquecedoras.",
        date: "2024-05-23T09:00:00Z",
        overallRating: 98,
        evaluationBatchId: 'eval-batch-1',
        ratings: { clarity: 'excelente', engagement: 'excelente', punctuality: 'excelente', knowledge: 'excelente' }
    },
];


export interface Group {
  id: number;
  name: string;
  career: string;
  semester: number;
  cycle: string;
  turno: string;
  students: number[];
}

export const groups: Group[] = [
    { id: 1, name: 'COMPINCO2024A', career: 'Ingeniería en Computación', semester: 2, cycle: '2024-A', turno: 'Matutino', students: [1, 2] },
    { id: 2, name: 'LAET2024B', career: 'Licenciatura en Administración', semester: 1, cycle: '2024-B', turno: 'Vespertino', students: [7, 8] },
    { id: 3, name: 'LDE2023A', career: 'Derecho', semester: 4, cycle: '2023-A', turno: 'Matutino', students: [] },
];


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

export const schedules: Schedule[] = [
    { id: 1, teacherId: 1, subjectId: 2, groupId: 1, groupName: "COMPINCO2024A", dayOfWeek: 'Lunes', startTime: '09:00', endTime: '11:00' },
    { id: 2, teacherId: 2, subjectId: 1, groupId: 1, groupName: "COMPINCO2024A", dayOfWeek: 'Martes', startTime: '07:00', endTime: '09:00' },
    { id: 3, teacherId: 3, subjectId: 4, groupId: 2, groupName: "LAET2024B", dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00' },
    { id: 4, teacherId: 4, subjectId: 5, groupId: 2, groupName: "LAET2024B", dayOfWeek: 'Miércoles', startTime: '18:00', endTime: '20:00' },
    { id: 5, teacherId: 1, subjectId: 7, groupId: 3, groupName: "LDE2023A", dayOfWeek: 'Jueves', startTime: '10:00', endTime: '12:00' },
];


export interface SupervisionCriterion {
    id: string;
    text: string;
}

export interface SupervisionRubric {
  id: number;
  title: string;
  type: 'checkbox'; // For now, only checkbox is supported
  category: 'Contable' | 'No Contable';
  criteria: SupervisionCriterion[];
}


export const supervisionRubrics: SupervisionRubric[] = [
    {
        id: 1,
        title: "Presentación de la clase",
        type: "checkbox",
        category: "Contable",
        criteria: [
            { id: "1_1", text: "Inicia la clase puntualmente." },
            { id: "1_2", text: "Presenta el objetivo de la clase de manera clara." },
            { id: "1_3", text: "Utiliza una agenda o guion para la sesión." },
        ]
    },
    {
        id: 2,
        title: "Dominio del Contenido",
        type: "checkbox",
        category: "Contable",
        criteria: [
            { id: "2_1", text: "Demuestra conocimiento profundo y actualizado del tema." },
            { id: "2_2", text: "Responde a las preguntas de los estudiantes con seguridad y precisión." },
            { id: "2_3", text: "Relaciona el contenido con ejemplos prácticos y relevantes." },
        ]
    },
    {
        id: 3,
        title: "Estrategias de Enseñanza",
        type: "checkbox",
        category: "No Contable",
        criteria: [
            { id: "3_1", text: "Utiliza diversas técnicas didácticas (exposición, debate, etc.)." },
            { id_other: "3_2", text: "Emplea recursos tecnológicos de apoyo (presentaciones, videos, etc.)." },
            { id: "3_3", text: "Fomenta la participación activa de los estudiantes." },
        ]
    },
];

export interface EvaluationCriterion {
    id: string;
    text: string;
}

export interface EvaluationRubric {
    id: number;
    category: string;
    criteria: EvaluationCriterion[];
}

export const evaluationRubrics: EvaluationRubric[] = [
    {
        id: 1,
        category: "Claridad en la Explicación",
        criteria: [
            { id: "clarity_1", text: "Excelente" },
            { id: "clarity_2", text: "Bueno" },
            { id: "clarity_3", text: "Regular" },
            { id: "clarity_4", text: "Necesita Mejorar" },
        ]
    },
    {
        id: 2,
        category: "Compromiso y Motivación",
        criteria: [
            { id: "engagement_1", text: "Excelente" },
            { id: "engagement_2", text: "Bueno" },
            { id_engagement: "engagement_3", text: "Regular" },
            { id: "engagement_4", text: "Necesita Mejorar" },
        ]
    }
];

export interface EvaluationPeriod {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    careers: string[];
}

export const evaluationPeriods: EvaluationPeriod[] = [
    { id: 1, name: "Evaluación Docente 2024-A", startDate: new Date("2024-05-15"), endDate: new Date("2024-05-30"), careers: ["Ingeniería en Computación", "Licenciatura en Administración"] },
    { id: 2, name: "Evaluación Docente 2024-B", startDate: new Date("2024-11-10"), endDate: new Date("2024-11-25"), careers: ["Derecho", "Ingeniería en Computación"] },
];
