
import type { Plantel, User, Alumno } from '@/lib/modelos';

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

interface ApiPlantel {
    id_plantel: number;
    nombre: string;
    ubicacion: string;
}

export const getPlanteles = async (): Promise<Plantel[]> => {
    const apiPlanteles: ApiPlantel[] = await apiFetch('/planteles');
    return apiPlanteles.map(p => ({
        id: p.id_plantel,
        name: p.nombre,
        location: p.ubicacion,
        director: '', // Director field is not in the API response
    }));
};
export const createPlantel = (data: Omit<Plantel, 'id'>): Promise<Plantel> => apiFetch('/planteles', { method: 'POST', body: JSON.stringify(data) });
export const getPlantelById = (id: number): Promise<Plantel> => apiFetch(`/planteles/${id}`);
export const updatePlantel = (id: number, data: Partial<Omit<Plantel, 'id'>>): Promise<Plantel> => apiFetch(`/planteles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePlantel = (id: number): Promise<void> => apiFetch(`/planteles/${id}`, { method: 'DELETE' });

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
export const getDocentes = (): Promise<any[]> => apiFetch('/docentes');
// ... y así sucesivamente para los demás endpoints de docentes.

// Coordinator Management
export const getCoordinadores = (): Promise<any[]> => apiFetch('/coordinadores');
// ... y así sucesivamente para los demás endpoints de coordinadores.
