
let loadedCareers: Career[] = [];
let loadedSubjects: Subject[] = [];

export const setAcademicData = (careers: Career[], subjects: Subject[]) => {
    loadedCareers = careers;
    loadedSubjects = subjects;
};

export type Role = 'administrator' | 'coordinator' | 'teacher' | 'student';

export interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  rol: Role;
  grupo?: string;
  fecha_registro: string;
  ultimo_acceso: string | null;
}

export const users: User[] = [
  { id: 2, nombre: 'Coordinador', apellido_paterno: 'User', apellido_materno: 'Staff', correo: 'coordinator@example.com', rol: 'coordinator', fecha_registro: '2023-02-20T11:00:00Z', ultimo_acceso: '2024-05-21T09:00:00Z' },
  { id: 3, nombre: 'Docente', apellido_paterno: 'User', apellido_materno: 'Faculty', correo: 'teacher@example.com', rol: 'teacher', fecha_registro: '2023-03-10T09:00:00Z', ultimo_acceso: '2024-05-22T14:00:00Z' },
  { id: 4, nombre: 'Alumno', apellido_paterno: 'User', apellido_materno: 'Student', correo: 'student@example.com', rol: 'student', grupo: 'COMPINCO2025A', fecha_registro: '2023-09-01T08:00:00Z', ultimo_acceso: '2024-05-22T16:45:00Z' },
  { id: 5, nombre: 'John', apellido_paterno: 'Doe', apellido_materno: 'Smith', correo: 'john.d@example.com', rol: 'teacher', fecha_registro: '2022-08-21T15:30:00Z', ultimo_acceso: '2024-05-19T11:00:00Z' },
  { id: 6, nombre: 'Jane', apellido_paterno: 'Smith', apellido_materno: 'Doe', correo: 'jane.s@example.com', rol: 'student', grupo: 'COMPINCO2025A', fecha_registro: '2023-09-01T08:15:00Z', ultimo_acceso: '2024-05-21T18:00:00Z' },
  { id: 7, nombre: 'Laura', apellido_paterno: 'García', apellido_materno: 'Perez', correo: 'laura.g@example.com', rol: 'coordinator', fecha_registro: '2023-01-15T10:00:00Z', ultimo_acceso: '2024-05-23T10:00:00Z' },
  { id: 8, nombre: 'Carlos', apellido_paterno: 'Martínez', apellido_materno: 'Rodriguez', correo: 'carlos.m@example.com', rol: 'coordinator', fecha_registro: '2023-01-18T12:00:00Z', ultimo_acceso: '2024-05-23T11:30:00Z' },
];

export const planteles = [
  { id: 1, name: 'Plantel Principal', location: 'Centro de la Ciudad', director: 'Dra. Alice Johnson' },
  { id: 2, name: 'Plantel Norte', location: 'Suburbios del Norte', director: 'Sr. Bob Williams' },
  { id: 3, name: 'Plantel Sur', location: 'Distrito Sur', director: 'Sra. Carol White' },
];

export interface Career {
  id: number;
  name: string;
  modality: string;
  campus: string;
  semesters: number;
  coordinator: string;
}

export const careers: Career[] = loadedCareers;

export interface Subject {
  id: number;
  name: string;
  career: string;
  semester: number;
}

export const subjects: Subject[] = loadedSubjects;

export interface Teacher {
    id: number;
    name: string;
}

export const teachers: Teacher[] = [
  { id: 1, name: 'Docente User Faculty' },
  { id: 2, name: 'Dra. Ada Lovelace' },
  { id: 3, name: 'Prof. Philip Kotler' },
  { id: 4, name: 'Dr. James Watt' },
  { id: 5, name: 'Dr. Edgar Codd' },
  { id: 6, name: 'C.P. Luca Pacioli' },
  { id: 7, name: 'Dr. Andrew Tanenbaum' },
  { id: 8, name: 'Prof. Idalberto Chiavenato' },
  { id: 9, name: 'Lic. Jorge Barrera Graf' },
  { id: 10, name: 'Dr. Isaac Newton' },
  { id: 11, name: 'John Doe Smith' },
];

export interface Supervision {
    id: number;
    teacher: string;
    subject: string;
    coordinator: string;
    date: Date;
    status: 'Programada' | 'Completada';
    groupId: number;
    startTime: string;
    endTime: string;
    score?: number;
}

// Function to get a future date based on a specific day of the week
const getNextDateForDay = (dayOfWeek: number) => { // 0=Sun, 1=Mon, ...
  const today = new Date();
  const resultDate = new Date(today.getTime());
  resultDate.setDate(today.getDate() + (dayOfWeek + 7 - today.getDay()) % 7);
  if (resultDate <= today) {
    resultDate.setDate(resultDate.getDate() + 7);
  }
  return resultDate;
};


export const supervisions: Supervision[] = [
    { id: 1, teacher: 'Docente User Faculty', subject: 'Introducción a la Programación', coordinator: 'Coordinador User', date: getNextDateForDay(1), status: 'Programada', groupId: 1, startTime: '07:00', endTime: '09:00' }, 
    { id: 2, teacher: 'C.P. Luca Pacioli', subject: 'Contabilidad Financiera', coordinator: 'Laura García', date: getNextDateForDay(1), status: 'Programada', groupId: 2, startTime: '16:00', endTime: '18:00' }, 
    { id: 3, teacher: 'Dr. Andrew Tanenbaum', subject: 'Fundamentos de Hardware', coordinator: 'Coordinador User', date: getNextDateForDay(2), status: 'Programada', groupId: 1, startTime: '08:00', endTime: '10:00' },
    { id: 4, teacher: 'Dra. Ada Lovelace', subject: 'Estructuras de Datos', coordinator: 'Coordinador User', date: getNextDateForDay(3), status: 'Programada', groupId: 1, startTime: '09:00', endTime: '11:00' }, 
    
    // -- Completed Supervisions with scores --
    // Teacher: Docente User Faculty
    { id: 5, teacher: 'Docente User Faculty', subject: 'Matemáticas Discretas', coordinator: 'Coordinador User', date: new Date("2024-03-15"), status: 'Completada', groupId: 1, startTime: '10:00', endTime: '12:00', score: 85},
    { id: 6, teacher: 'Docente User Faculty', subject: 'Lógica Computacional', coordinator: 'Coordinador User', date: new Date("2024-04-22"), status: 'Completada', groupId: 1, startTime: '10:00', endTime: '12:00', score: 88},
    { id: 7, teacher: 'Docente User Faculty', subject: 'Ingeniería de Software', coordinator: 'Coordinador User', date: new Date("2024-05-20"), status: 'Completada', groupId: 1, startTime: '10:00', endTime: '12:00', score: 92},
    
    // Teacher: John Doe Smith
    { id: 8, teacher: 'John Doe Smith', subject: 'Termodinámica', coordinator: 'Carlos Martínez', date: new Date("2024-03-10"), status: 'Completada', groupId: 3, startTime: '10:00', endTime: '12:00', score: 58},
    { id: 9, teacher: 'John Doe Smith', subject: 'Mecánica de Fluidos', coordinator: 'Carlos Martínez', date: new Date("2024-04-15"), status: 'Completada', groupId: 3, startTime: '10:00', endTime: '12:00', score: 62},
    { id: 12, teacher: 'John Doe Smith', subject: 'Diseño Asistido por Computadora (CAD)', coordinator: 'Carlos Martínez', date: new Date("2024-05-18"), status: 'Completada', groupId: 3, startTime: '10:00', endTime: '12:00', score: 68},
    { id: 13, teacher: 'John Doe Smith', subject: 'Termodinámica', coordinator: 'Carlos Martínez', date: new Date("2024-02-12"), status: 'Completada', groupId: 3, startTime: '10:00', endTime: '12:00', score: 55},


    // Teacher: Dra. Ada Lovelace
    { id: 10, teacher: 'Dra. Ada Lovelace', subject: 'Programación Orientada a Objetos', coordinator: 'Coordinador User', date: new Date("2024-05-01"), status: 'Completada', groupId: 1, startTime: '09:00', endTime: '11:00', score: 98},

    // Teacher: Prof. Philip Kotler
    { id: 11, teacher: 'Prof. Philip Kotler', subject: 'Principios de Marketing', coordinator: 'Laura García', date: new Date("2024-05-20"), status: 'Completada', groupId: 2, startTime: '18:00', endTime: '20:00', score: 95 },
];

export interface Evaluation {
  id: number;
  student: string;
  teacherName: string;
  feedback: string;
  date: string;
  overallRating: number;
  ratings: {
    clarity: number;
    engagement: number;
    punctuality: number;
    knowledge: number;
    feedback: number;
  };
}

export const evaluations: Evaluation[] = [
  { id: 1, student: 'Jane Smith', teacherName: 'Docente User Faculty', feedback: '¡Clase genial, muy participativa!', date: '2024-05-10', overallRating: 5, ratings: { clarity: 5, engagement: 5, punctuality: 5, knowledge: 5, feedback: 4 } },
  { id: 2, student: 'Alumno User Student', teacherName: 'Docente User Faculty', feedback: 'El profesor tiene mucho conocimiento pero el ritmo es un poco rápido.', date: '2024-05-11', overallRating: 4, ratings: { clarity: 3, engagement: 4, punctuality: 5, knowledge: 5, feedback: 3 } },
  { id: 3, student: 'John Appleseed', teacherName: 'John Doe Smith', feedback: 'Aprendí mucho. Los ejemplos prácticos fueron muy útiles.', date: '2024-05-12', overallRating: 5, ratings: { clarity: 5, engagement: 5, punctuality: 4, knowledge: 5, feedback: 5 } },
  { id: 4, student: 'Emily White', teacherName: 'Docente User Faculty', feedback: 'Necesita mejorar la puntualidad, pero las explicaciones son excelentes.', date: '2024-05-15', overallRating: 4, ratings: { clarity: 5, engagement: 4, punctuality: 3, knowledge: 5, feedback: 4 } },
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
  { id: 1, name: 'COMPINCO2025A', career: 'Ciencias de la Computación', semester: 1, cycle: '2025-A', turno: 'Matutino', students: [4, 6] },
  { id: 2, name: 'ADMEM2025A', career: 'Administración de Empresas', semester: 2, cycle: '2025-A', turno: 'Vespertino', students: [] },
  { id: 3, name: 'INGMEC2026A', career: 'Ingeniería Mecánica', semester: 1, cycle: '2026-A', turno: 'Matutino', students: [] },
];

export interface Schedule {
  id: number;
  teacherId: number;
  subjectId: number;
  groupId: number;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export const schedules: Schedule[] = [
    { id: 1, teacherId: 1, subjectId: 1, groupId: 1, dayOfWeek: 'Lunes', startTime: '07:00', endTime: '09:00' },
    { id: 2, teacherId: 2, subjectId: 2, groupId: 1, dayOfWeek: 'Lunes', startTime: '09:00', endTime: '11:00' },
    { id: 3, teacherId: 10, subjectId: 24, groupId: 1, dayOfWeek: 'Lunes', startTime: '11:00', endTime: '13:00' },

    { id: 4, teacherId: 7, subjectId: 25, groupId: 1, dayOfWeek: 'Martes', startTime: '08:00', endTime: '10:00' },
    { id: 5, teacherId: 1, subjectId: 23, groupId: 1, dayOfWeek: 'Martes', startTime: '10:00', endTime: '12:00' },

    { id: 6, teacherId: 1, subjectId: 1, groupId: 1, dayOfWeek: 'Miércoles', startTime: '07:00', endTime: '09:00' },
    { id: 7, teacherId: 2, subjectId: 2, groupId: 1, dayOfWeek: 'Miércoles', startTime: '09:00', endTime: '11:00' },
    { id: 8, teacherId: 10, subjectId: 24, groupId: 1, dayOfWeek: 'Miércoles', startTime: '11:00', endTime: '13:00' },

    { id: 9, teacherId: 7, subjectId: 25, groupId: 1, dayOfWeek: 'Jueves', startTime: '08:00', endTime: '10:00' },
    { id: 10, teacherId: 1, subjectId: 26, groupId: 1, dayOfWeek: 'Jueves', startTime: '10:00', endTime: '12:00' },

    { id: 11, teacherId: 8, subjectId: 27, groupId: 1, dayOfWeek: 'Viernes', startTime: '09:00', endTime: '11:00' },
    { id: 12, teacherId: 6, subjectId: 13, groupId: 2, dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00' },
    { id: 13, teacherId: 3, subjectId: 3, groupId: 2, dayOfWeek: 'Martes', startTime: '18:00', endTime: '20:00' },
    { id: 14, teacherId: 11, subjectId: 4, groupId: 3, dayOfWeek: 'Martes', startTime: '10:00', endTime: '12:00' },
    { id: 15, teacherId: 11, subjectId: 21, groupId: 3, dayOfWeek: 'Jueves', startTime: '10:00', endTime: '12:00' },
    { id: 16, teacherId: 11, subjectId: 22, groupId: 3, dayOfWeek: 'Viernes', startTime: '12:00', endTime: '14:00' },
];
