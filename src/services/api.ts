

import type { Plantel, User, Alumno, Docente, Coordinador, Career, CareerSummary, Subject, Group, Schedule, EvaluationPeriod, Teacher, Supervision, Evaluation, SupervisionRubric, AssignedCareer, SupervisionCriterion } from '@/lib/modelos';

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

  if (!response.ok) {
    let errorMessage = `Error de servidor: ${response.status} ${response.statusText}`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.mensaje || (errorResult.datos?.errors ? Object.values(errorResult.datos.errors).flat().join(' ') : errorMessage);
    } catch (e) {
      // The response was not a valid JSON, so we stick with the status text.
    }
    console.error(`API Error on ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  if (result.exito || response.ok) { // Some endpoints might not have 'exito'
    return result; // Return 'datos' if it exists, otherwise the whole result.
  } else {
    const errorMessage = result.mensaje || (result.datos?.errors ? Object.values(result.datos.errors).flat().join(' ') : 'Ocurrió un error desconocido.');
    throw new Error(errorMessage);
  }
};

// Campus Management
export const getPlanteles = async (): Promise<Plantel[]> => {
    const data = await apiFetch('/planteles');
    return data.datos.map((item: any) => ({
        id: item.id_plantel,
        name: item.nombre,
        location: item.ubicacion,
    }));
};

export const createPlantel = async (data: { nombre: string, ubicacion: string }): Promise<Plantel> => {
    const newPlantel = await apiFetch('/planteles', { method: 'POST', body: JSON.stringify(data) });
     return {
        id: newPlantel.datos.id_plantel,
        name: newPlantel.datos.nombre,
        location: newPlantel.datos.ubicacion
    };
};

export const getPlantelById = async (id: number): Promise<Plantel> => {
    const item = await apiFetch(`/planteles/${id}`);
    return {
        id: item.datos.id_plantel,
        name: item.datos.nombre,
        location: item.datos.ubicacion,
    };
};
export const updatePlantel = (id: number, data: { nombre: string, ubicacion: string }): Promise<Plantel> => apiFetch(`/planteles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePlantel = (id: number): Promise<void> => apiFetch(`/planteles/${id}`, { method: 'DELETE' });

// Career and Subject Management
export const getCareers = async (): Promise<CareerSummary[]> => {
    const data = await apiFetch('/carreras');
    return data.datos.map((item: any) => ({
        id: item.id_carrera,
        name: item.carrera,
        coordinator: null,
        totalMaterias: 0,
        totalPlanteles: 0,
        totalModalidades: 0,
    }));
};

export const getCareerModalities = async (): Promise<Career[]> => {
    // This function might need a more specific endpoint, e.g., /carreras/modalities
    // For now, it's a placeholder.
    console.warn("getCareerModalities is using mock data. Implement API endpoint for /carreras/modalities");
    const data = await apiFetch('/carreras'); // Assuming this returns all career variations
    return data.datos.map((item:any) => ({
        id: item.id_carrera, // This might not be unique per modality, adjust if needed
        name: item.carrera,
        modality: item.modalidad || 'N/A', // Adjust field name if different
        campus: item.plantel || 'N/A', // Adjust field name
        semesters: item.semestres || 0, // Adjust field name
        coordinator: item.coordinador || 'No Asignado', // Adjust field name
    }));
};

export const createCareer = (data: {nombre: string}): Promise<Career> => apiFetch('/carreras', { method: 'POST', body: JSON.stringify(data) });

export const assignCoordinatorToCareer = (data: { id_coordinador: number, id_carrera: number }): Promise<void> => 
    apiFetch('/asignarCarreraCoordinador', { method: 'POST', body: JSON.stringify(data) });


export const updateCareer = async (id_carrera: number, data: {carrera: string, id_coordinador: number | null}): Promise<Career> => {
    // First, update the career name
    const updatePayload = { carrera: data.carrera };
    const updatedCareer = await apiFetch(`/carreras/${id_carrera}`, { method: 'PUT', body: JSON.stringify(updatePayload) });

    // Then, if a coordinator is selected, assign them.
    if (data.id_coordinador) {
        await assignCoordinatorToCareer({ id_coordinador: data.id_coordinador, id_carrera });
    }
    // If coordinator is null, we might need a /de-assign endpoint, or the backend handles this.
    // For now, we assume assigning a new one overwrites or we can only assign.

    return updatedCareer;
};
export const deleteCareer = (id: number): Promise<void> => apiFetch(`/carreras/${id}`, { method: 'DELETE' });


export const getSubjects = async (): Promise<Subject[]> => {
    console.warn("getSubjects is using mock data. Implement API endpoint for /materias.");
    return Promise.resolve([
        { id: 1, name: 'Cálculo Diferencial', career: 'Ingeniería en Computación', semester: 1, modality: 'INCO' },
        { id: 2, name: 'Programación Orientada a Objetos', career: 'Ingeniería en Computación', semester: 2, modality: 'INCO' },
        { id: 3, name: 'Estructura de Datos', career: 'Ingeniería en Computación', semester: 3, modality: 'INCO' },
        { id: 4, name: 'Contabilidad Básica', career: 'Licenciatura en Administración', semester: 1, modality: 'LAET' },
        { id: 5, name: 'Microeconomía', career: 'Licenciatura en Administración', semester: 2, modality: 'LAET' },
        { id: 6, name: 'Derecho Romano', career: 'Derecho', semester: 1, modality: 'LDE' },
        { id: 7, name: 'Cálculo Diferencial', career: 'Ingeniería en Computación', semester: 1, modality: 'INCO-S' },
    ]);
};
export const createSubject = (data: any): Promise<Subject> => {
    console.warn("createSubject is using mock implementation.");
    return Promise.resolve({ ...data, id: Date.now() });
};

// User Management
export const getUsers = async (): Promise<User[]> => {
    const result = await apiFetch('/usuario');
    return result.datos.map((user: any) => ({
        ...user,
        id_rol: user.id_rol,
        rol: user.rol.toLowerCase(), 
    }));
};

export const createUser = (data: any, basePath: string): Promise<User> => {
    return apiFetch(basePath, { method: 'POST', body: JSON.stringify(data) });
};

export const getUserById = (id: number): Promise<User> => apiFetch(`/usuario/${id}`);

export const updateUser = (id: number, data: any, options?: { basePath?: string }): Promise<User> => {
    const endpoint = options?.basePath ? `${options.basePath}/${id}` : `/usuario/${id}`;
    return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteUser = (id: number): Promise<void> => apiFetch(`/usuario/${id}`, { method: 'DELETE' });

// Student Management
export const getAlumnos = (): Promise<Alumno[]> => apiFetch('/alumnos');

// Teacher Management
export const getDocentes = async (id?: number): Promise<Docente | Docente[]> => {
    const endpoint = id ? `/docentes/${id}` : '/docentes';
    const result = await apiFetch(endpoint);
    return result.datos;
}

// Coordinator Management
export const getCoordinadores = async (): Promise<Coordinador[]> => {
    const result = await apiFetch('/coordinadores');
    return result.datos;
};

// Group Management
export const getGroups = async (): Promise<Group[]> => {
    console.warn("getGroups is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, name: 'COMPINCO2024A', career: 'Ingeniería en Computación', semester: 2, cycle: '2024-A', turno: 'Matutino', students: [1, 2] },
        { id: 2, name: 'LAET2024B', career: 'Licenciatura en Administración', semester: 1, cycle: '2024-B', turno: 'Vespertino', students: [7, 8] },
        { id: 3, name: 'LDE2023A', career: 'Derecho', semester: 4, cycle: '2023-A', turno: 'Matutino', students: [] },
    ]);
};
export const createGroup = (data: any): Promise<Group> => {
    console.warn("createGroup is using mock implementation.");
    return Promise.resolve({ ...data, id: Date.now() });
};


// Schedule Management
export const getSchedules = async (): Promise<Schedule[]> => {
    console.warn("getSchedules is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, teacherId: 1, subjectId: 2, groupId: 1, groupName: "COMPINCO2024A", dayOfWeek: 'Lunes', startTime: '09:00', endTime: '11:00' },
        { id: 2, teacherId: 2, subjectId: 1, groupId: 1, groupName: "COMPINCO2024A", dayOfWeek: 'Martes', startTime: '07:00', endTime: '09:00' },
        { id: 3, teacherId: 3, subjectId: 4, groupId: 2, groupName: "LAET2024B", dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00' },
    ]);
};

// Teacher data for schedules/evaluations
export const getTeachers = async (): Promise<Teacher[]> => {
    console.warn("getTeachers is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, name: "Carlos Ramírez Pérez" },
        { id: 2, name: "Laura Rojas Mendoza" },
        { id: 3, name: "Ricardo Palma Solis" },
        { id: 4, name: "Mónica Salazar Cruz" },
    ]);
};

// Evaluation Period Management
export const getEvaluationPeriods = async (): Promise<EvaluationPeriod[]> => {
    console.warn("getEvaluationPeriods is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, name: "Evaluación Docente 2024-A", startDate: new Date("2024-05-15"), endDate: new Date("2024-05-30"), careers: ["Ingeniería en Computación", "Licenciatura en Administración"] },
        { id: 2, name: "Evaluación Docente 2024-B", startDate: new Date("2024-11-10"), endDate: new Date("2024-11-25"), careers: ["Derecho", "Ingeniería en Computación"] },
    ]);
};
export const createEvaluationPeriod = (data: any): Promise<EvaluationPeriod> => {
    console.warn("createEvaluationPeriod is using mock implementation.");
    return Promise.resolve({ ...data, id: Date.now(), startDate: new Date(data.startDate), endDate: new Date(data.endDate) });
};


// Supervision Management
export const getSupervisions = async (): Promise<Supervision[]> => {
    console.warn("getSupervisions is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, teacher: 'Carlos Ramírez Pérez', career: 'Ingeniería en Computación', coordinator: 'Sofía Gómez Díaz', date: new Date('2024-06-10'), status: 'Completada', startTime: '10:00', endTime: '11:00', score: 85 },
        { id: 2, teacher: 'Laura Rojas Mendoza', career: 'Licenciatura en Administración', coordinator: 'Sofía Gómez Díaz', date: new Date('2024-06-12'), status: 'Programada', startTime: '12:00', endTime: '13:00' },
    ]);
};
export const createSupervision = (data: any): Promise<Supervision> => {
    console.warn("createSupervision is using mock implementation.");
    return Promise.resolve({ ...data, id: Date.now(), date: new Date(data.date) });
};

// Student Evaluations
export const getEvaluations = async (): Promise<Evaluation[]> => {
    console.warn("getEvaluations is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, student: "Ana García López", teacherName: "Carlos Ramírez Pérez", groupName: "COMPINCO2024A", feedback: "El profesor explica muy bien, pero a veces va muy rápido.", date: "2024-05-20T10:00:00Z", overallRating: 85, ratings: { clarity: 'bueno', engagement: 'excelente', punctuality: 'excelente', knowledge: 'bueno' } },
        { id: 2, student: "Luis Martínez Hernández", teacherName: "Carlos Ramírez Pérez", groupName: "COMPINCO2024A", feedback: "Las clases son interesantes y dinámicas.", date: "2024-05-21T10:00:00Z", overallRating: 95, ratings: { clarity: 'excelente', engagement: 'excelente', punctuality: 'excelente', knowledge: 'excelente' } },
    ]);
};
export const createEvaluation = (data: any): Promise<Evaluation> => {
    console.warn("createEvaluation is using mock implementation.");
    return Promise.resolve({ ...data, id: Date.now(), date: new Date().toISOString() });
};

// Rubrics
export const getSupervisionRubrics = async (): Promise<SupervisionRubric[]> => {
    const [rubricsData, countableCriteriaData, nonCountableCriteriaData] = await Promise.all([
        apiFetch('/supervision/rubros'),
        apiFetch('/supervision/contable'),
        apiFetch('/no-contables')
    ]);

    const criteriaByRubric = [...countableCriteriaData.datos, ...nonCountableCriteriaData.datos].reduce((acc: Record<number, SupervisionCriterion[]>, criterion: any) => {
        const rubricId = criterion.id_rubro || criterion.id_nc_rubro;
        if (!acc[rubricId]) {
            acc[rubricId] = [];
        }
        acc[rubricId].push({
            id: criterion.id_supcriterio || criterion.id_nc_criterio,
            text: criterion.descripcion,
            rubricId: rubricId,
        });
        return acc;
    }, {});

    return rubricsData.datos.map((rubric: any) => ({
        id: rubric.id_rubro,
        title: rubric.nombre,
        category: rubric.tipo === 'Contable' ? 'Contable' : 'No Contable',
        type: rubric.tipo, // Assuming type is also 'Contable' or 'No Contable'
        criteria: criteriaByRubric[rubric.id_rubro] || [],
    }));
};

export const createNonCountableCriterion = (data: { p_descripcion: string, p_id_nc_rubro: number }): Promise<SupervisionCriterion> => 
    apiFetch('/no-contables', { method: 'POST', body: JSON.stringify(data) });


// Plantel-Career relationship
export const getCarrerasPorPlantel = async (plantelId: number): Promise<AssignedCareer[]> => {
    const data = await apiFetch(`/carrerasPorPlantel/${plantelId}`);
    return data.datos.map((item: any) => ({
        id_carrera: item.id_carrera,
        carrera: item.carrera,
    }));
}

export const assignCarreraToPlantel = (data: { id_plantel: number, id_carrera: number }): Promise<void> => 
    apiFetch('/asignarCarreraPlantel', { method: 'POST', body: JSON.stringify(data) });

export const removeCarreraFromPlantel = (data: { id_plantel: number, id_carrera: number }): Promise<void> =>
    apiFetch('/eliminarCarreraPlantel', { method: 'POST', body: JSON.stringify(data) });
    
