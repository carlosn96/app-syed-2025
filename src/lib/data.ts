export type Role = 'administrator' | 'coordinator' | 'teacher' | 'student';

export interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  rol: Role;
  fecha_registro: string;
  ultimo_acceso: string | null;
}

export const users: User[] = [
  { id: 2, nombre: 'Coordinador', apellido_paterno: 'User', apellido_materno: 'Staff', correo: 'coordinator@example.com', rol: 'coordinator', fecha_registro: '2023-02-20T11:00:00Z', ultimo_acceso: '2024-05-21T09:00:00Z' },
  { id: 3, nombre: 'Docente', apellido_paterno: 'User', apellido_materno: 'Faculty', correo: 'teacher@example.com', rol: 'teacher', fecha_registro: '2023-03-10T09:00:00Z', ultimo_acceso: '2024-05-22T14:00:00Z' },
  { id: 4, nombre: 'Alumno', apellido_paterno: 'User', apellido_materno: 'Student', correo: 'student@example.com', rol: 'student', fecha_registro: '2023-09-01T08:00:00Z', ultimo_acceso: '2024-05-22T16:45:00Z' },
  { id: 5, nombre: 'John', apellido_paterno: 'Doe', apellido_materno: 'Smith', correo: 'john.d@example.com', rol: 'teacher', fecha_registro: '2022-08-21T15:30:00Z', ultimo_acceso: '2024-05-19T11:00:00Z' },
  { id: 6, nombre: 'Jane', apellido_paterno: 'Smith', apellido_materno: 'Doe', correo: 'jane.s@example.com', rol: 'student', fecha_registro: '2023-09-01T08:15:00Z', ultimo_acceso: '2024-05-21T18:00:00Z' },
];

export const planteles = [
  { id: 1, name: 'Plantel Principal', location: 'Centro de la Ciudad', director: 'Dra. Alice Johnson' },
  { id: 2, name: 'Plantel Norte', location: 'Suburbios del Norte', director: 'Sr. Bob Williams' },
  { id: 3, name: 'Plantel Sur', location: 'Distrito Sur', director: 'Sra. Carol White' },
];

export const programs = [
  { id: 1, name: 'Ciencias de la Computación', campus: 'Plantel Principal', duration: '4 Años' },
  { id: 2, name: 'Administración de Empresas', campus: 'Plantel Principal', duration: '4 Años' },
  { id: 3, name: 'Ingeniería Mecánica', campus: 'Plantel Norte', duration: '5 Años' },
  { id: 4, name: 'Bellas Artes', campus: 'Plantel Sur', duration: '3 Años' },
];

export const subjects = [
  { id: 1, name: 'Introducción a la Programación', program: 'Ciencias de la Computación', teacher: 'Dr. Alan Turing' },
  { id: 2, name: 'Estructuras de Datos', program: 'Ciencias de la Computación', teacher: 'Dra. Ada Lovelace' },
  { id: 3, name: 'Principios de Marketing', program: 'Administración de Empresas', teacher: 'Prof. Philip Kotler' },
  { id: 4, name: 'Termodinámica', program: 'Ingeniería Mecánica', teacher: 'Dr. James Watt' },
];

export const teachers = [
  { id: 1, name: 'Dr. Alan Turing' },
  { id: 2, name: 'Dra. Ada Lovelace' },
  { id: 3, name: 'Prof. Philip Kotler' },
  { id: 4, name: 'Dr. James Watt' },
  { id: 5, name: 'Prof. Marie Curie' },
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
