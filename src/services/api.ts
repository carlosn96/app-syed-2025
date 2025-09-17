


import type { Plantel, User, Alumno, Docente, Coordinador, Career, CareerSummary, Subject, Group, Schedule, EvaluationPeriod, Teacher, Supervision, Evaluation, SupervisionRubric, Roles } from '@/lib/modelos';

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
    return result.datos ?? result; // Return 'datos' if it exists, otherwise the whole result.
  } else {
    const errorMessage = result.mensaje || (result.datos?.errors ? Object.values(result.datos.errors).flat().join(' ') : 'Ocurrió un error desconocido.');
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
    }));
};

export const createPlantel = async (data: { nombre: string, ubicacion: string }): Promise<Plantel> => {
    const newPlantel = await apiFetch('/planteles', { method: 'POST', body: JSON.stringify(data) });
     return {
        id: newPlantel.id_plantel,
        name: newPlantel.nombre,
        location: newPlantel.ubicacion
    };
};

export const getPlantelById = async (id: number): Promise<Plantel> => {
    const item = await apiFetch(`/planteles/${id}`);
    return {
        id: item.id_plantel,
        name: item.nombre,
        location: item.ubicacion,
    };
};
export const updatePlantel = (id: number, data: { nombre: string, ubicacion: string }): Promise<Plantel> => apiFetch(`/planteles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePlantel = (id: number): Promise<void> => apiFetch(`/planteles/${id}`, { method: 'DELETE' });

// Career and Subject Management
export const getCareers = async (): Promise<CareerSummary[]> => {
    const data = await apiFetch('/carreras');
    return data.map((item: any) => ({
        id: item.id_carrera,
        name: item.carrera,
        coordinator: item.coordinador,
        totalMaterias: item.total_materias,
        totalPlanteles: item.total_planteles,
        totalModalidades: item.total_modalidades,
        modalities: item.modalidades, // Assuming API returns this
    }));
};

export const getCareerModalities = async (): Promise<Career[]> => {
    // This function might need a more specific endpoint, e.g., /carreras/modalities
    // For now, it's a placeholder.
    console.warn("getCareerModalities is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, name: 'Ingeniería en Computación', modality: 'INCO', campus: 'Reynosa', semesters: 9, coordinator: 'Sofía Gómez Díaz' },
        { id: 2, name: 'Licenciatura en Administración', modality: 'LAET', campus: 'Reynosa', semesters: 8, coordinator: 'Sofía Gómez Díaz' },
        { id: 3, name: 'Derecho', modality: 'LDE', campus: 'Reynosa', semesters: 10, coordinator: 'Sofía Gómez Díaz' },
        { id: 4, name: 'Ingeniería en Computación', modality: 'INCO-S', campus: 'Río Bravo', semesters: 9, coordinator: 'Sofía Gómez Díaz' },
        { id: 5, name: 'Licenciatura en Administración', modality: 'LAET-M', campus: 'Matamoros', semesters: 8, coordinator: 'Sofía Gómez Díaz' },
    ]);
};

export const createCareer = (data: {nombre: string}): Promise<Career> => apiFetch('/carreras', { method: 'POST', body: JSON.stringify(data) });
export const updateCareer = (id: number, data: {carrera: string, coordinador: string | null}): Promise<Career> => apiFetch(`/carreras/${id}`, { method: 'PUT', body: JSON.stringify(data) });
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
export const getUsers = (): Promise<User[]> => apiFetch('/usuario');

export const createUser = (data: any): Promise<User> => {
    let endpoint = '/usuario';
    let payload = { ...data };
    delete payload.contrasena_confirmation;

    switch (data.id_rol) {
        case Roles.Docente:
            endpoint = '/docentes';
            payload = {
                nombre: data.nombre,
                apellido_paterno: data.apellido_paterno,
                apellido_materno: data.apellido_materno,
                grado_academico: data.grado_academico,
                correo: data.correo,
                contrasena: data.contrasena
            };
            break;
        case Roles.Alumno:
            endpoint = '/alumnos';
            payload = {
                nombre: data.nombre,
                apellido_paterno: data.apellido_paterno,
                apellido_materno: data.apellido_materno,
                correo: data.correo,
                contrasena: data.contrasena,
                matricula: data.matricula,
                id_carrera: data.id_carrera
            };
            break;
        case Roles.Coordinador:
             endpoint = '/coordinadores';
             payload = {
                nombre: data.nombre,
                apellido_paterno: data.apellido_paterno,
                apellido_materno: data.apellido_materno,
                correo: data.correo,
                contrasena: data.contrasena
            };
            break;
        // Admin case falls through to default /usuario
    }
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
};

export const getUserById = (id: number): Promise<User> => apiFetch(`/usuario/${id}`);
export const updateUser = (id: number, data: any): Promise<User> => apiFetch(`/usuario/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: number): Promise<void> => apiFetch(`/usuario/${id}`, { method: 'DELETE' });

// Student Management
export const getAlumnos = (): Promise<Alumno[]> => apiFetch('/alumnos');

// Teacher Management
export const getDocentes = (id?: number): Promise<Docente | Docente[]> => {
    const endpoint = id ? `/docentes/${id}` : '/docentes';
    return apiFetch(endpoint);
}

// Coordinator Management
export const getCoordinadores = (): Promise<Coordinador[]> => apiFetch('/coordinadores');

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
    console.warn("getSupervisionRubrics is using mock data. Implement API endpoint.");
    return Promise.resolve([
        { id: 1, title: "Presentación de la clase", type: "checkbox", category: "Contable", criteria: [ { id: "1_1", text: "Inicia la clase puntualmente." }] },
        { id: 2, title: "Dominio del Contenido", type: "checkbox", category: "Contable", criteria: [ { id: "2_1", text: "Demuestra conocimiento profundo y actualizado del tema." }] },
        { id: 3, title: "Estrategias de Enseñanza", type: "checkbox", category: "No Contable", criteria: [ { id: "3_1", text: "Utiliza diversas técnicas didácticas." }] },
    ]);
};

    

    

    

    








