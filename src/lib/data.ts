
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
];

export const planteles = [
  { id: 1, name: 'Plantel Principal', location: 'Centro de la Ciudad', director: 'Dra. Alice Johnson' },
  { id: 2, name: 'Plantel Norte', location: 'Suburbios del Norte', director: 'Sr. Bob Williams' },
  { id: 3, name: 'Plantel Sur', location: 'Distrito Sur', director: 'Sra. Carol White' },
];

export const careers = [
  { id: 1, name: 'Ciencias de la Computación', campus: 'Plantel Principal', semesters: 8 },
  { id: 2, name: 'Administración de Empresas', campus: 'Plantel Principal', semesters: 8 },
  { id: 3, name: 'Ingeniería Mecánica', campus: 'Plantel Norte', semesters: 10 },
  { id: 4, name: 'Bellas Artes', campus: 'Plantel Sur', semesters: 6 },
];

export const subjects = [
  { id: 1, name: 'Introducción a la Programación', career: 'Ciencias de la Computación', teacher: 'Dr. Alan Turing', semester: 1 },
  { id: 2, name: 'Estructuras de Datos', career: 'Ciencias de la Computación', teacher: 'Dra. Ada Lovelace', semester: 2 },
  { id: 11, name: 'Algoritmos Avanzados', career: 'Ciencias de la Computación', teacher: 'Dr. Donald Knuth', semester: 3 },
  { id: 12, name: 'Bases de Datos', career: 'Ciencias de la Computación', teacher: 'Dr. Edgar Codd', semester: 4 },
  { id: 14, name: 'Sistemas Operativos', career: 'Ciencias de la Computación', teacher: 'Dr. Andrew Tanenbaum', semester: 5 },
  { id: 15, name: 'Redes de Computadoras', career: 'Ciencias de la Computación', teacher: 'Dr. Andrew Tanenbaum', semester: 5 },
  { id: 16, name: 'Ingeniería de Software', career: 'Ciencias de la Computación', teacher: 'Dr. Ian Sommerville', semester: 6 },
  { id: 17, name: 'Inteligencia Artificial', career: 'Ciencias de la Computación', teacher: 'Dr. Stuart Russell', semester: 7 },
  { id: 3, name: 'Principios de Marketing', career: 'Administración de Empresas', teacher: 'Prof. Philip Kotler', semester: 1 },
  { id: 13, name: 'Contabilidad Financiera', career: 'Administración de Empresas', teacher: 'C.P. Luca Pacioli', semester: 2 },
  { id: 18, name: 'Gestión de Recursos Humanos', career: 'Administración de Empresas', teacher: 'Prof. Idalberto Chiavenato', semester: 3 },
  { id: 19, name: 'Finanzas Corporativas', career: 'Administración de Empresas', teacher: 'Dr. Stephen Ross', semester: 4 },
  { id: 20, name: 'Derecho Mercantil', career: 'Administración de Empresas', teacher: 'Lic. Jorge Barrera Graf', semester: 5 },
  { id: 4, name: 'Termodinámica', career: 'Ingeniería Mecánica', teacher: 'Dr. James Watt', semester: 1 },
  { id: 21, name: 'Mecánica de Fluidos', career: 'Ingeniería Mecánica', teacher: 'Dr. Frank M. White', semester: 2 },
  { id: 22, name: 'Diseño Asistido por Computadora (CAD)', career: 'Ingeniería Mecánica', teacher: 'Dr. James Watt', semester: 3 },
];

export const teachers = [
  { id: 1, name: 'Dr. Alan Turing' },
  { id: 2, name: 'Dra. Ada Lovelace' },
  { id: 3, name: 'Prof. Philip Kotler' },
  { id: 4, name: 'Dr. James Watt' },
  { id: 5, name: 'Prof. Marie Curie' },
  { id: 11, name: 'Dr. Donald Knuth' },
  { id: 12, name: 'Dr. Edgar Codd' },
  { id: 13, name: 'C.P. Luca Pacioli' },
  { id: 14, name: 'Dr. Andrew Tanenbaum' },
  { id: 15, name: 'Dr. Ian Sommerville' },
  { id: 16, name: 'Dr. Stuart Russell' },
  { id: 17, name: 'Prof. Idalberto Chiavenato' },
  { id: 18, name: 'Dr. Stephen Ross' },
  { id: 19, name: 'Lic. Jorge Barrera Graf' },
  { id: 20, name: 'Dr. Frank M. White' },
];

export const evaluations = [
  { id: 1, student: 'Jane Smith', feedback: '¡Clase genial, muy participativa!', rating: 5, date: '2024-05-10' },
  { id: 2, student: 'Usuario Alumno', feedback: 'El profesor tiene mucho conocimiento pero el ritmo es un poco rápido.', rating: 4, date: '2024-05-11' },
  { id: 3, student: 'John Appleseed', feedback: 'Aprendí mucho. Los ejemplos prácticos fueron muy útiles.', rating: 5, date: '2024-05-12' },
];

export const supervisions = [
    { id: 1, date: new Date(), teacher: 'Dr. Alan Turing', subject: 'Intro a Programación', coordinator: 'Usuario Coordinador' },
    { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 2)), teacher: 'Dra. Ada Lovelace', subject: 'Estructuras de Datos', coordinator: 'Usuario Coordinador' },
    { id: 3, date: new Date(new Date().setDate(new Date().getDate() + 5)), teacher: 'Prof. Philip Kotler', subject: 'Principios de Marketing', coordinator: 'Usuario Coordinador' },
];

export interface Group {
  id: number;
  name: string;
  career: string;
  semester: number;
  students: number[];
}

export const groups: Group[] = [
  { id: 1, name: 'COMPINCO2025A', career: 'Ciencias de la Computación', semester: 1, students: [4, 6] },
  { id: 2, name: 'ADMEM2025A', career: 'Administración de Empresas', semester: 2, students: [] },
  { id: 3, name: 'COMPINCO2025B', career: 'Ciencias de la Computación', semester: 1, students: [] },
];
