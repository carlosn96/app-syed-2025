export const users = [
  { id: 1, name: 'Usuario Administrador', email: 'admin@example.com', role: 'Administrador', joined: '2023-01-15' },
  { id: 2, name: 'Usuario Coordinador', email: 'coordinator@example.com', role: 'Coordinador', joined: '2023-02-20' },
  { id: 3, name: 'Usuario Docente', email: 'teacher@example.com', role: 'Docente', joined: '2023-03-10' },
  { id: 4, name: 'Usuario Alumno', email: 'student@example.com', role: 'Alumno', joined: '2023-09-01' },
  { id: 5, name: 'John Doe', email: 'john.d@example.com', role: 'Docente', joined: '2022-08-21' },
  { id: 6, name: 'Jane Smith', email: 'jane.s@example.com', role: 'Alumno', joined: '2023-09-01' },
];

export const campuses = [
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
