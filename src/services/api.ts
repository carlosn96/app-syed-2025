

import type { Plantel, User, Alumno, Docente, Coordinador, Career, CareerSummary, Subject, Group, Schedule, EvaluationPeriod, Teacher, Supervision, Evaluation, SupervisionRubric, AssignedCareer, SupervisionCriterion, StudyPlanRecord, EvaluationRubric, ApiRubric, ApiRubricWithCriteria, ApiNonCountableRubricWithCriteria, ApiCriterion, ApiNonCountableCriterion, Modality, EvaluationCriterion } from '@/lib/modelos';

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

  //console.log(`API Fetch: ${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`);

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
    const response = await apiFetch('/carreras');
    const records: any[] = response.datos;

    const careersMap = new Map<number, CareerSummary>();

    records.forEach(record => {
        const id = record.id_carrera;
        if (!careersMap.has(id)) {
            careersMap.set(id, {
                id: id,
                name: record.carrera,
                coordinator: record.coordinador,
                totalMaterias: record.total_materias,
                totalPlanteles: record.total_planteles,
                totalModalidades: record.total_modalidades,
                modalities: [],
            });
        }

        const career = careersMap.get(id)!;
        if (record.id_modalidad && !career.modalities?.some(m => m.id === record.id_modalidad)) {
            career.modalities?.push({
                id: record.id_modalidad,
                name: record.carrera,
                modality: record.modalidad,
                campus: record.plantel,
                semesters: record.semestres,
                coordinator: record.coordinador,
            });
        }
    });
    
    return Array.from(careersMap.values());
};

export const createCareer = (data: { nombre: string }): Promise<any> => {
    return apiFetch('/carreras', { method: 'POST', body: JSON.stringify({ nombre: data.nombre }) });
};


export const createStudyPlan = (data: {name: string, modality: string, semesters: number, campus: string, coordinator: string}): Promise<Career> => {
    console.warn("createStudyPlan is using mock implementation until API is ready.");
    return Promise.resolve({ ...data, id: Date.now() });
};


export const updateCareer = async (id: number, data: { nombre: string }): Promise<Career> => {
    return apiFetch(`/carreras/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteCareer = (id: number): Promise<void> => {
    return apiFetch(`/carreras/${id}`, { method: 'DELETE' });
};

export const getSubjects = async (careerId?: number): Promise<Subject[]> => {
    const endpoint = careerId ? `/plan-estudio/${careerId}` : '/plan-estudio';
    const response = await apiFetch(endpoint);
    // The new structure is an array of modalities for a given career
    const records: any[] = response.datos;

    if (!Array.isArray(records)) {
        console.error("API response for subjects is not an array:", records);
        return [];
    }

    const allSubjects: Subject[] = [];

    // This data structure has modalities at the top level
    records.forEach(modality => {
        const modalityName = modality.modalidad; // Assuming the name is available
        const careerName = modality.carrera;
        (modality.materias || []).forEach((materia: any) => {
             allSubjects.push({
                id: materia.id_materia,
                name: "Nombre de materia no disponible en este endpoint", // Placeholder
                career: careerName,
                semester: materia.id_cat_nivel, // Assuming this is the semester
                modality: modalityName,
             })
        });
    });

    // To get subject names, we might need to fetch all subjects and map them.
    // This is inefficient. Ideally, the /plan-estudio/{id} endpoint would provide names.
    // For now, let's make a second call to get all subjects to map names.
    const allSubjectsWithName = await getAllSubjectsWithNames();
    
    return allSubjects.map(s => {
        const found = allSubjectsWithName.find(sub => sub.id === s.id);
        return {
            ...s,
            name: found?.name || s.name,
        }
    });
};

// Helper function to get all subjects just to map names
const getAllSubjectsWithNames = async (): Promise<Subject[]> => {
    const response = await apiFetch('/materias'); // Assuming a /materias endpoint
    if (response.datos && Array.isArray(response.datos)) {
        return response.datos.map((item: any) => ({
            id: item.id_materia,
            name: item.nombre,
            career: "N/A", // This info is not in the /materias endpoint
            semester: item.id_cat_nivel, // Or however semester is represented
            modality: "N/A",
        }));
    }
    return [];
}


export const getSubjectsByModality = async (modalityId: number): Promise<Subject[]> => {
    console.warn(`getSubjectsByModality is using mock data for modalityId: ${modalityId}. Implement API endpoint.`);
    // TODO: Replace with actual API call, e.g., `/plan-estudio/${modalityId}`
    return Promise.resolve([]);
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
        rol: user.rol.toLowerCase(), 
    }));
};

export const createUser = (data: any, options?: { basePath?: string }): Promise<User> => {
    const endpoint = options?.basePath || '/usuario';
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
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

export const getCoordinadorById = async (id: number): Promise<User> => {
    const result = await apiFetch(`/coordinadores/${id}`);
    const coord = result.datos.coordinador;
    if (!coord) {
      throw new Error("Coordinador not found in API response");
    }
    // Adapt the response to the User interface
    return {
        id: coord.id,
        nombre: coord.nombre,
        apellido_paterno: coord.apellido_paterno,
        apellido_materno: coord.apellido_materno,
        correo: coord.correo,
        id_rol: 3, // Assuming 3 is the role ID for coordinators
        rol: 'coordinador',
        fecha_registro: coord.fecha_registro,
        ultimo_acceso: coord.ultimo_acceso,
        rol_nombre: coord.rol,
    };
};

export const getCarrerasPorCoordinador = async (coordinadorId: number): Promise<AssignedCareer[]> => {
    const data = await apiFetch(`/carrerasPorCoordinador/${coordinadorId}`);
    return data.datos.map((item: any) => ({
        id_carrera: item.id_carrera,
        carrera: item.carrera,
    }));
};

export const assignCarreraToCoordinador = (data: { id_coordinador: number, id_carrera: number }): Promise<void> => 
    apiFetch('/asignarCarreraCoordinador', { method: 'POST', body: JSON.stringify(data) });
    
export const removeCarreraFromCoordinador = (data: { id_coordinador: number, id_carrera: number }): Promise<void> =>
    apiFetch('/eliminarCarreraCoordinador', { method: 'POST', body: JSON.stringify(data) });


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
export const getSupervisionRubrics = async (): Promise<{ contable: SupervisionRubric[], noContable: SupervisionRubric[] }> => {
    const [countableData, nonCountableData] = await Promise.all([
        apiFetch('/supervision/contable'),
        apiFetch('/supervision/no-contable'),
    ]);

    const mapRubrics = (data: any, category: 'Contable' | 'No Contable'): SupervisionRubric[] => {
        const rubrosList = data?.datos?.rubros;

        if (!rubrosList || !Array.isArray(rubrosList)) {
            console.error(`API response for supervision rubrics (${category}) is not in the expected format.`, data);
            return [];
        }

        return rubrosList.map((rubro: any) => {
            const idKey = category === 'Contable' ? 'id_rubro' : 'id_nc_rubro';
            const criterionIdKey = category === 'Contable' ? 'id_criterio' : 'id_nc_criterio';
            const criterionTextKey = 'criterio';

            return {
                id: rubro[idKey],
                title: rubro.nombre,
                type: 'checkbox',
                category: category,
                criteria: (rubro.criterios || []).map((c: any) => ({
                    id: c[criterionIdKey],
                    text: c[criterionTextKey],
                })),
            };
        });
    };

    return {
        contable: mapRubrics(countableData, 'Contable'),
        noContable: mapRubrics(nonCountableData, 'No Contable'),
    };
};

export const getEvaluationRubrics = async (): Promise<EvaluationRubric[]> => {
    const rubricsRes = await apiFetch('/evaluacion-docente/rubros');
    const criteriaRes = await apiFetch('/evaluacion-docente/criterios');

    const apiRubrics: { id: number; nombre: string }[] = rubricsRes.datos || [];
    const apiCriteria: { id_criterio: number; descripcion: string; id_rubro: number }[] = criteriaRes.datos || [];
    
    if (!Array.isArray(apiRubrics) || !Array.isArray(apiCriteria)) {
        console.error("Invalid data structure for evaluation rubrics/criteria");
        return [];
    }
  
    return apiRubrics.map(rubric => ({
        id: rubric.id,
        name: rubric.nombre,
        criteria: apiCriteria
            .filter(criterion => criterion.id_rubro === rubric.id)
            .map(criterion => ({
                id: criterion.id_criterio,
                description: criterion.descripcion,
                rubricId: rubric.id
            }))
    }));
};

export const createRubric = (data: { nombre: string; categoria: 'Contable' | 'No Contable' }): Promise<SupervisionRubric> => {
    const endpoint = data.categoria === 'Contable' ? '/supervision/rubros/contable' : '/supervision/rubros/no-contable';
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify({ p_nombre: data.nombre }) });
};

export const updateRubric = (id: number, category: 'Contable' | 'No Contable', data: { p_nombre: string }): Promise<SupervisionRubric> => {
    const endpoint = category === 'Contable' ? `/supervision/rubros/contable/${id}` : `/supervision/rubros/no-contable/${id}`;
    return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) });
};

export const createCriterion = (rubricId: number, category: 'Contable' | 'No Contable', criterionText: string): Promise<SupervisionCriterion> => {
    const endpoint = category === 'Contable' ? '/supervision/contable' : '/supervision/no-contable';
    const body = category === 'Contable'
        ? { p_criterio: criterionText, p_id_rubro: rubricId }
        : { p_descripcion: criterionText, p_id_nc_rubro: rubricId };
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
};
  
export const updateCriterion = (id: number, category: 'Contable' | 'No Contable', criterionText: string): Promise<SupervisionCriterion> => {
    const endpoint = category === 'Contable' ? `/supervision/contable/${id}` : `/supervision/no-contable/${id}`;
    const body = { p_criterio: criterionText };
    return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
};
  
export const deleteCriterion = (id: number, category: 'Contable' | 'No Contable'): Promise<void> => {
    const endpoint = category === 'Contable' ? `/supervision/contable/${id}` : `/supervision/no-contable/${id}`;
    return apiFetch(endpoint, { method: 'DELETE' });
};

export const createEvaluationRubric = (data: { nombre: string }): Promise<EvaluationRubric> => {
    return apiFetch('/rubros', { method: 'POST', body: JSON.stringify(data) });
};

export const updateEvaluationRubric = (id: number, data: { nombre: string }): Promise<EvaluationRubric> => {
    return apiFetch(`/rubros/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteEvaluationRubric = (id: number): Promise<void> => {
    return apiFetch(`/rubros/${id}`, { method: 'DELETE' });
};

export const createEvaluationCriterion = (data: { descripcion: string, id_rubro: number }): Promise<EvaluationCriterion> => {
    return apiFetch('/criterios-evaluacion', { method: 'POST', body: JSON.stringify(data) });
};

export const updateEvaluationCriterion = (id: number, data: { descripcion: string }): Promise<EvaluationCriterion> => {
    return apiFetch(`/criterios-evaluacion/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteEvaluationCriterion = (id: number): Promise<void> => {
    return apiFetch(`/criterios-evaluacion/${id}`, { method: 'DELETE' });
};


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

export const getModalities = async (): Promise<Modality[]> => {
    const result = await apiFetch('/modalidades');
    if (result && Array.isArray(result.datos)) {
        console.log("API response for modalities:", result.datos);
      return result.datos;
    }
    console.error("API response for modalities is not in the expected format.", result);
    return [];
};

export const assignModalityToCareer = (data: { id_carrera: number, id_modalidad: number }): Promise<void> => {
    return apiFetch('/carrera-modalidad', { method: 'POST', body: JSON.stringify(data) });
};

    
