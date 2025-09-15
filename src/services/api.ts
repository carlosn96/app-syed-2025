
import type { Plantel, User, Alumno, Docente, Coordinador, Career, Subject } from '@/lib/modelos';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('access_token');
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();
  
  if (result.exito) {
    return result.datos;
  } else {
    const errorMessage = result.mensaje || (result.datos?.errors ? Object.values(result.datos.errors).flat().join(' ') : 'Ocurrió un error desconocido.');
    console.error(`API Error on ${endpoint}:`, response.status, response.statusText, result);
    throw new Error(errorMessage);
  }
};

// Campus Management
export const getPlanteles = async (): Promise<Plantel[]> => {
    const data = await apiFetch('/planteles');
    return data.map((item: any) => ({
        id: item.id_plantel,
        name: item.nombre,
        location: item.ubicacion,
        director: item.director || "Director no asignado"
    }));
};
export const createPlantel = (data: Omit<Plantel, 'id'>): Promise<Plantel> => apiFetch('/planteles', { method: 'POST', body: JSON.stringify(data) });
export const getPlantelById = (id: number): Promise<Plantel> => apiFetch(`/planteles/${id}`);
export const updatePlantel = (id: number, data: Partial<Omit<Plantel, 'id'>>): Promise<Plantel> => apiFetch(`/planteles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePlantel = (id: number): Promise<void> => apiFetch(`/planteles/${id}`, { method: 'DELETE' });

// Career and Subject Management
export const getCareers = async (): Promise<Career[]> => {
    // Assuming an endpoint /carreras exists. This might need to be created.
    // For now, returning a mock. Replace with: await apiFetch('/carreras');
    console.warn("getCareers is using mock data. Implement API endpoint.");
    return [
        { id: 1, name: 'Ingeniería en Computación', modality: 'INCO', campus: 'Reynosa', semesters: 9, coordinator: 'Sofía Gómez Díaz' },
        { id: 2, name: 'Licenciatura en Administración', modality: 'LAET', campus: 'Reynosa', semesters: 8, coordinator: 'Sofía Gómez Díaz' },
    ];
};
export const getSubjects = async (): Promise<Subject[]> => {
    // Assuming an endpoint /materias exists. This might need to be created.
    // For now, returning a mock. Replace with: await apiFetch('/materias');
    console.warn("getSubjects is using mock data. Implement API endpoint.");
    return [
        { id: 1, name: 'Cálculo Diferencial', career: 'Ingeniería en Computación', semester: 1, modality: 'INCO' },
        { id: 2, name: 'Programación Orientada a Objetos', career: 'Ingeniería en Computación', semester: 2, modality: 'INCO' },
        { id: 4, name: 'Contabilidad Básica', career: 'Licenciatura en Administración', semester: 1, modality: 'LAET' },
    ];
};


// User Management
export const getUsers = (): Promise<User[]> => apiFetch('/usuario');
export const createUser = (data: any): Promise<User> => apiFetch('/usuario', { method: 'POST', body: JSON.stringify(data) });
export const getUserById = (id: number): Promise<User> => apiFetch(`/usuario/${id}`);
export const updateUser = (id: number, data: any): Promise<User> => apiFetch(`/usuario/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: number): Promise<void> => apiFetch(`/usuario/${id}`, { method: 'DELETE' });

// Student Management
export const getAlumnos = (): Promise<Alumno[]> => apiFetch('/alumnos');
// ... y así sucesivamente para los demás endpoints de alumnos.

// Teacher Management
export const getDocentes = (): Promise<Docente[]> => apiFetch('/docentes');
// ... y así sucesivamente para los demás endpoints de docentes.

// Coordinator Management
export const getCoordinadores = (): Promise<Coordinador[]> => apiFetch('/coordinadores');
// ... y así sucesivamente para los demás endpoints de coordinadores.
