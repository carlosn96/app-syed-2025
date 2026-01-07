
import type { DocenteMateria, Plantel, User, Alumno, Docente, Coordinador, Career, CareerSummary, Subject, Group, Schedule, EvaluationPeriod, Teacher, Supervision, Evaluation, SupervisionRubric, AssignedCareer, SupervisionCriterion, StudyPlanRecord, EvaluationRubric, ApiRubric, ApiRubricWithCriteria, ApiNonCountableRubricWithCriteria, ApiCriterion, ApiNonCountableCriterion, Modality, EvaluationCriterion, Horario, Periodo, CicloEscolar } from '@/lib/modelos';
import { cp } from 'fs';

export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
};


const apiFetch = async (endpoint: string, options: RequestInit = {}, tokenOverride?: string) => {
    const token = tokenOverride || getAuthToken(); // This function is now synchronous
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    //console.log(`API Request to ${endpoint} with options:`, options);
    //console.log(`API Response Status from ${endpoint}:`, response);
    if (!response.ok) {
        let errorMessage = `Error de servidor: ${response.status} ${response.statusText}`;
        try {
            const errorResult = await response.json();
            console.log(`API Error Response from ${endpoint}:`, errorResult);
            errorMessage =
                (errorResult.datos?.errors
                    ? Object.values(errorResult.datos.errors).flat().join(' ')
                    : errorResult.mensaje) || 'Ocurrió un error inesperado';
        } catch (e) {
            // The response was not a valid JSON, so we stick with the status text.
        }
        //console.error(`API Error on ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
    }

    const result = await response.json();
    //console.log(`API Response from ${endpoint}:`, result);

    if (result.exito || response.ok) { // Some endpoints might not have 'exito'
        return result; // Return 'datos' if it exists, otherwise the whole result.
    } else {
        const errorMessage = result.mensaje || (result.datos?.errors ? Object.values(result.datos.errors).flat().join(' ') : 'Ocurrió un error desconocido.');
        throw new Error(errorMessage);
    }
};

export type UsersCount = {
    students: number;
    teachers: number;
    coordinators: number;
};

export const getAdminNumeralia = async (): Promise<{
    totalUsers: UsersCount;
    totalCareers: number;
    totalPlanteles: number;
}> => {
    const data = await apiFetch('/admin-numeralia');
    return data.datos;
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

export const getPlantelesForCoordinador = async (): Promise<Plantel[]> => {
    const data = await apiFetch('/coordinador-planteles');
    return data.datos.map((item: any) => ({
        id: item.id_plantel,
        name: item.nombre,
        location: item.ubicacion,
    }));
};

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

export const getCareerByID = async (careerId: number): Promise<CareerSummary | null> => {
    const response = await apiFetch(`/carreras/${careerId}`);
    
    // Validar que la respuesta tenga datos
    if (!response || !response.datos) {
        return null;
    }

    // Asegurar que datos sea un array
    const records: any[] = Array.isArray(response.datos) 
        ? response.datos 
        : [response.datos];

    // Si no hay registros, retornar null
    if (records.length === 0) {
        return null;
    }

    let careerSummary: CareerSummary | null = null;

    records.forEach(record => {
        // Inicializar careerSummary en la primera iteración
        if (!careerSummary) {
            careerSummary = {
                id: record.id_carrera,
                name: record.carrera,
                coordinator: record.coordinador || null,
                totalMaterias: record.total_materias || 0,
                totalPlanteles: record.total_planteles || 0,
                totalModalidades: record.total_modalidades || 0,
                modalities: [],
            };
        }

        // Asegurar que modalities existe
        if (!careerSummary.modalities) {
            careerSummary.modalities = [];
        }

        // Agregar modalidad si existe y no está duplicada
        if (record.id_modalidad) {
            const exists = careerSummary.modalities.some(
                m => m.id === record.id_modalidad
            );

            if (!exists) {
                careerSummary.modalities.push({
                    id: record.id_modalidad,
                    name: record.carrera,
                    modality: record.modalidad || '',
                    campus: record.plantel || '',
                    semesters: record.semestres || 0,
                    coordinator: record.coordinador || null,
                });
            }
        }
    });

    return careerSummary;
};

export const getCarrerasForCoordinador = async (id?: number): Promise<CareerSummary | CareerSummary[]> => {
    const endpoint = id ? `/coordinador-carreras/${id}` : '/coordinador-carreras';
    const response = await apiFetch(endpoint);
    
    // Si se solicita una carrera específica por ID
    if (id && !Array.isArray(response.datos)) {
        const c = response.datos;
        return {
            id: c.id_carrera,
            name: c.carrera,
            coordinator: c.nombre_coordinador || null,
            totalMaterias: c.total_materias,
            totalPlanteles: c.total_planteles,
            totalModalidades: c.total_modalidades,
        };
    }
    
    // Si es un array de carreras
    return response.datos.map((c: any) => ({
        id: c.id_carrera,
        name: c.carrera,
        coordinator: c.nombre_coordinador,
        totalMaterias: c.total_materias,
        totalPlanteles: c.total_planteles,
        totalModalidades: c.total_modalidades,
    }));
}

export const getCareersWithoutCoordinator = async (): Promise<CareerSummary[]> => {
    const response = await apiFetch('/carreras-sin-coordinador');
    return response.datos.map((c: any) => ({
        id: c.id_carrera,
        name: c.carrera,
        coordinator: null,
        totalMaterias: c.total_materias || 0,
        totalPlanteles: c.total_planteles || 0,
        totalModalidades: c.total_modalidades || 0,
    }));
};

export const createCareer = (data: { nombre: string }): Promise<any> => {
    return apiFetch('/carreras', { method: 'POST', body: JSON.stringify({ nombre: data.nombre }) });
};


export const createStudyPlan = (data: { id_carrera: number, id_modalidad: number, materias: { id_materia: number, id_cat_nivel: number }[] }): Promise<any> => {
    return apiFetch('/plan-estudio', { method: 'POST', body: JSON.stringify(data) });
};

export const updateStudyPlan = (planId: number, data: { id_carrera: number, id_modalidad: number, materias: { id_materia: number, id_cat_nivel: number }[] }): Promise<any> => {
    return apiFetch(`/plan-estudio/${planId}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteStudyPlan = (planId: number): Promise<void> => {
    return apiFetch(`/plan-estudio/${planId}`, { method: 'DELETE' });
};


export const updateCareer = async (id: number, data: { nombre: string }): Promise<Career> => {
    return apiFetch(`/carreras/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteCareer = (id: number): Promise<void> => {
    return apiFetch(`/carreras/${id}`, { method: 'DELETE' });
};

function mapearPlanEstudio(plan: any): StudyPlanRecord[] {
    return plan.map((item: any): StudyPlanRecord => ({
        id: item.id,
        id_carrera: item.id_carrera,
        id_modalidad: item.id_modalidad,
        nombre_modalidad: item.nombre_modalidad,
        materias: Array.isArray(item.materias)
            ? item.materias.map((m: any) => ({
                id_materia: m.id_materia,
                nombre_materia: m.nombre_materia,
                id_cat_nivel: m.id_cat_nivel,
                nivel: m.nivel,
            }))
            : []
    }));
}

export const getStudyPlanCoordinatorByCareerId = async (
    careerId: number
): Promise<StudyPlanRecord[]> => {
    const response = await apiFetch(`/coordinador-plan-estudio/${careerId}`);
    if (!response.datos || !Array.isArray(response.datos)) {
        return [];
    }
    return mapearPlanEstudio(response.datos);
};

export const getStudyPlanByCareerId = async (
    careerId: number
): Promise<StudyPlanRecord[]> => {
    
    const response = await apiFetch(`/plan-estudio/${careerId}`);
    
    if (!response.datos || !Array.isArray(response.datos) && response.datos.length === 0) {
        return [];
    }

    return mapearPlanEstudio(response.datos);
};


export const getStudyPlanByModality = async (modalityId: number): Promise<StudyPlanRecord[]> => {
    const response = await apiFetch(`/plan-estudio/modalidad/${modalityId}`);
    if (response.datos && Array.isArray(response.datos)) {
        return response.datos;
    }
    return [];
};

export const getStudyPlanByCareerAndModality = async (
    careerId: number,
    modalityId: number
): Promise<StudyPlanRecord[]> => {
    const response = await apiFetch(`/coordinador-plan-estudio/${careerId}/modalidad/${modalityId}`);
    if (!response.datos || !Array.isArray(response.datos)) {
        return [];
    }
    return mapearPlanEstudio(response.datos);
};

export const getSubjects = async (): Promise<Subject[]> => {
    const response = await apiFetch('/materias');
    if (response.datos && Array.isArray(response.datos)) {
        return response.datos.map((item: any) => ({
            id: item.id_materia,
            name: item.materia,
            offeredLevels: item.niveles_ofertados,
            careerCount: item.carreras_que_la_usan,
        }));
    }
    return [];
};

export const getSubjectsByModality = async (modalityId: number, tokenOverride?: string): Promise<Subject[]> => {
    const response = await apiFetch(`/materias/modalidad/${modalityId}`, {}, tokenOverride);
    if (response.datos && Array.isArray(response.datos)) {
        return response.datos.map((item: any) => ({
            id: item.id_materia,
            name: item.materia,
            offeredLevels: item.niveles_ofertados,
            careerCount: item.carreras_que_la_usan,
        }));
    }
    return [];
};



export const createSubject = (data: { nombre: string }): Promise<Subject> => {
    return apiFetch('/materias', { method: 'POST', body: JSON.stringify(data) });
};

export const updateSubject = (id: number, data: { nombre: string }): Promise<Subject> => {
    return apiFetch(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteSubject = (id: number): Promise<void> => {
    return apiFetch(`/materias/${id}`, { method: 'DELETE' });
};

export const getMateriasForCoordinador = async (): Promise<Subject[]> => {
    const response = await apiFetch('/coordinador-materias');
    if (response.datos && Array.isArray(response.datos)) {
        return response.datos.map((item: any) => ({
            id: item.id_materia,
            name: item.materia,
            offeredLevels: item.niveles_ofertados,
            careerCount: item.carreras_que_la_usan,
        }));
    }
    return [];
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

export const getUserById = async (id: number): Promise<User> => {
    const result = await apiFetch(`/usuario/${id}`);
    const user = result.datos;
    if (!user) {
        throw new Error("User not found in API response");
    }
    return {
        ...user,
        rol: user.rol.toLowerCase(),
    };
};

export const updateUser = (id: number, data: any, options?: { basePath?: string }): Promise<User> => {
    const endpoint = options?.basePath ? `${options.basePath}/${id}` : `/usuario/${id}`;
    return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteUser = (id: number, options?: { basePath?: string }): Promise<void> => {
    const endpoint = options?.basePath ? `${options.basePath}/${id}` : `/usuario/${id}`;
    return apiFetch(endpoint, { method: 'DELETE' });
};

// Student Management
export const getAlumnos = async (): Promise<Alumno[]> => {
    const response = await apiFetch('/alumnos');
    return response.datos;
};

export const getAlumnosForCoordinador = async (): Promise<Alumno[]> => {
    const response = await apiFetch('/coordinador-alumnos');
    return response.datos;
}

export const getAlumnosByGroup = async (groupId: number): Promise<Alumno[]> => {
    const response = await apiFetch(`/coordinador-grupos/${groupId}/alumnos`);
    return response.datos ?? [];
}

export const assignAlumnosToGroup = async (data: { id_grupo: number, ids_alumnos: number[] }): Promise<void> => {
    await apiFetch('/coordinador-grupos/asignar-alumnos-grupo', { method: 'POST', body: JSON.stringify(data) });
}

export const removeAlumnoFromGroup = async (groupId: number, alumnoId: number): Promise<void> => {
    const response = await apiFetch(`/coordinador-grupos/${groupId}/alumnos/${alumnoId}`, { 
        method: 'DELETE'
    });
    
    // Validar que la respuesta indique éxito
    if (!response || !response.exito) {
        throw new Error('La respuesta de la API no indica éxito en la desmatriculación');
    }
}

// Teacher Management
const fetchDocentes = async (basePath: string, id?: number): Promise<Docente | Docente[]> => {
    const endpoint = id ? `${basePath}/${id}` : basePath;
    const result = await apiFetch(endpoint);
    if (Array.isArray(result.datos)) {
        return result.datos;
    }
    // If a single object is returned (for GET by ID), return it directly
    if (id && result.datos) {
        return result.datos;
    }
    // If for some reason it's not an array and no id was passed, return empty array
    return [];
}

export const getDocentes = async (id?: number): Promise<Docente | Docente[]> => 
    fetchDocentes('/docentes', id);



export const getDocentesForCoordinador = async (): Promise<Docente[]> => {
    const result = await apiFetch('/coordinador-docentes');
    return Array.isArray(result.datos) ? result.datos : [];
};

export const getDocenteForCoordinadorById = async (id: number): Promise<Docente> => {
    const result = await apiFetch(`/coordinador-docentes/${id}`);
    return result.datos;
}

export const getDocentesForCoordinadorByDetails = async (careerId: number, cicloEscolarId: number, plantelId: number, turnoId: number): Promise<Docente[]> => {
    const result = await apiFetch(`/coordinador-docentes/carrera/${careerId}/plantel/${plantelId}/turno/${turnoId}/ciclo/${cicloEscolarId}`);
    return result.datos;
}

// Coordinator Management
export const getCoordinadores = async (): Promise<Coordinador[]> => {
    const result = await apiFetch('/coordinadores');
    return result.datos;
};

export const getCoordinadorById = async (id: number): Promise<Coordinador> => {
    const result = await apiFetch(`/coordinadores/${id}`);
    console.log(result);
    const user = result.datos;
    if (!user) {
        throw new Error("Coordinador not found in API response");
    }
    return {
        id_coordinador: user.id_coordinador,
        usuario_id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        rol: user.rol.toLowerCase(),
        fecha_registro: user.fecha_registro,
        ultimo_acceso: user.ultimo_acceso,
    };
};

export const getCarrerasPorCoordinador = async (coordinadorId: number): Promise<AssignedCareer[]> => {
    const response = await apiFetch(`/carrerasPorCoordinador/${coordinadorId}`);
    console.log(response);
    return response.datos.map((item: any) => ({
        id_carrera: item.id_carrera,
        carrera: item.carrera,
    }));
};

export const assignCarreraToCoordinador = (data: { id_coordinador: number, id_carrera: number }): Promise<void> =>
    apiFetch('/asignarCarreraCoordinador', { method: 'POST', body: JSON.stringify(data) });

export const removeCarreraFromCoordinador = (data: { id_coordinador: number, id_carrera: number }): Promise<void> =>
    apiFetch('/eliminarCarreraCoordinador', { method: 'DELETE', body: JSON.stringify(data) });

export const getGroupsAdmin = async (): Promise<Group[]> => {
    const response = await apiFetch('/grupos');
    return response.datos.map((g: any) => ({
        id_grupo: g.id_grupo,
        acronimo: g.acronimo || g.grupo,
        codigo_inscripcion: g.codigo_inscripcion,
        id_plan_estudio: g.id_plan_estudio,
        id_nivel: g.id_nivel,
        nivel: g.nivel,
        id_carrera: g.id_carrera,
        carrera: g.carrera,
        id_modalidad: g.id_modalidad,
        modalidad: g.modalidad,
        id_turno: g.id_turno,
        turno: g.turno,
        id_plantel: g.id_plantel,
        plantel: g.plantel || g.nombre,
    }));
};

// Group Management
export const getGroups = async (): Promise<Group[]> => {
    const response = await apiFetch('/coordinador-grupos');
    return response.datos.map((g: any) => ({
        id_grupo: g.id_grupo,
        acronimo: g.acronimo,
        codigo_inscripcion: g.codigo_inscripcion,
        id_plan_estudio: g.id_plan_estudio,
        id_nivel: g.id_nivel,
        nivel: g.nivel,
        id_carrera: g.id_carrera,
        carrera: g.carrera,
        id_modalidad: g.id_modalidad,
        modalidad: g.modalidad,
        id_turno: g.id_turno,
        turno: g.turno,
        id_plantel: g.id_plantel,
        plantel: g.plantel,
    }));
};

export const getGroupById = async (id: number): Promise<Group> => {
    const response = await apiFetch(`/coordinador-grupos/${id}`);
    const g = response.datos;
    return {
        id_grupo: g.id_grupo,
        acronimo: g.acronimo,
        codigo_inscripcion: g.codigo_inscripcion,
        id_plan_estudio: g.id_plan_estudio,
        id_nivel: g.id_nivel,
        nivel: g.nivel || '', // Si no viene en la respuesta, dejar vacío
        id_carrera: g.id_carrera,
        carrera: g.carrera || '', // Si no viene en la respuesta, dejar vacío
        id_modalidad: g.id_modalidad,
        modalidad: g.modalidad || '', // Si no viene en la respuesta, dejar vacío
        id_turno: g.id_turno,
        turno: g.turno || '', // Si no viene en la respuesta, dejar vacío
        id_plantel: g.id_plantel,
        plantel: g.plantel || '', // Si no viene en la respuesta, dejar vacío
    };
};


export const createGroup = (data: any): Promise<Group> => {
    return apiFetch('/coordinador-grupos', { method: 'POST', body: JSON.stringify(data) });
};
export const updateGroup = (id: number, data: any): Promise<Group> => {
    return apiFetch(`/coordinador-grupos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteGroup = (id: number): Promise<void> => {
    return apiFetch(`/coordinador-grupos/${id}`, { method: 'DELETE' });
};

export const getGroupsByFilters = async (
    careerId: number,
    plantelId: number,
    turnoId: number
): Promise<Group[]> => {
    const response = await apiFetch(
        `/coordinador-grupos/carrera/${careerId}/plantel/${plantelId}/turno/${turnoId}/`
    );
    if (!response.datos || !Array.isArray(response.datos)) {
        return [];
    }
    return response.datos.map((g: any) => ({
        id_grupo: g.id_grupo,
        acronimo: g.acronimo,
        codigo_inscripcion: g.codigo_inscripcion,
        id_plan_estudio: g.id_plan_estudio,
        id_nivel: g.id_nivel,
        nivel: g.nivel,
        id_carrera: g.id_carrera,
        carrera: g.carrera,
        id_modalidad: g.id_modalidad,
        modalidad: g.modalidad,
        id_turno: g.id_turno,
        turno: g.turno,
        id_plantel: g.id_plantel,
        plantel: g.plantel,
    }));
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

export const assignDocenteToMateria = (data: DocenteMateria): Promise<void> => {
    return apiFetch('/coordinador-asignar-docente', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });
};

export const getMateriasAsignadas = async (grupoId: number, cicloEscolarId: number): Promise<DocenteMateria[]> => {
    const response = await apiFetch(`/coordinador-materias-asignadas/${grupoId}/${cicloEscolarId}`);
    console.log(response);
    if (!response.datos || !Array.isArray(response.datos)) {
        return [];
    }
    return response.datos/*.map((item: any) => ({
        id_docente: item.id_docente,
        id_materia: item.id_materia,
        id_grupo: item.id_grupo,
        id_ciclo_escolar: item.id_ciclo_escolar,
        horarios: Array.isArray(item.horarios) ? item.horarios.map((h: any) => ({
            id_dia: h.id_dia,
            dia: h.dia,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin
        })) : []
    }));*/
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
    apiFetch('/eliminarCarreraPlantel', { method: 'DELETE', body: JSON.stringify(data) });

// Get Planteles where a specific career is offered
export const getPlantelesForCareer = async (careerId: number): Promise<Plantel[]> => {
    const data = await apiFetch(`/plantelesPorCarrera/${careerId}`);
    return data.datos.map((item: any) => ({
        id: item.id_plantel,
        name: item.nombre,
        location: item.ubicacion,
    }));
};

// Turnos (shifts)
export const getTurnos = async (): Promise<{ id: number; nombre: string }[]> => {
    const response = await apiFetch('/catalogos/turnos');
    return response.datos;
};

// Turnos (shifts)
export const getTurnosCoordinador = async (): Promise<{ id: number; nombre: string }[]> => {
    const response = await apiFetch('/coordinador-catalogos/turnos');
    return response.datos;
};

// Niveles (levels/semesters)
export const getNiveles = async (): Promise<{ id: number; nombre: string }[]> => {
    const response = await apiFetch('/catalogos/niveles');
    return response.datos;
};

// Niveles (levels/semesters)
export const getNivelesCoordinador = async (): Promise<{ id: number; nombre: string }[]> => {
    const response = await apiFetch('/coordinador-catalogos/niveles');
    return response.datos;
};

// Niveles (levels/semesters)
export const getDiasCoordinador = async (): Promise<{ id: number; nombre: string }[]> => {
    const response = await apiFetch('/coordinador-catalogos/dias');
    return response.datos;
};

// Ciclos escolares para coordinador
export const getCiclosEscolaresCoordinador = async (): Promise<{
    id_ciclo: number;
    anio: number;
    id_cat_periodo: number;
    periodo_nombre: string;
}[]> => {
    const response = await apiFetch('/coordinador-ciclos-escolares');
    return response.datos;
};



export const getModalities = async (): Promise<Modality[]> => {
    const result = await apiFetch('/modalidades');
    if (result && Array.isArray(result.datos)) {
        return result.datos;
    }
    return [];
};

export const getModalidadesCoordinador = async (): Promise<Modality[]> => {
    const result = await apiFetch('/coordinador-modalidades');
    if (result && Array.isArray(result.datos)) {
        return result.datos;
    }
    return [];
};

export const assignModalityToCareer = (data: { id_carrera: number, id_modalidad: number }): Promise<void> => {
    return apiFetch('/carrera-modalidad', { method: 'POST', body: JSON.stringify(data) });
};

export const resetPassword = (
    userId: number,
    data: { contrasena_nueva: string }
): Promise<void> => {
    return apiFetch(`/usuario/${userId}/cambiar-contrasena`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

// Gestión de Periodos
export const getPeriodos = async (): Promise<Periodo[]> => {
    const response = await apiFetch('/catalogos/periodos');
    return response.datos;
};

export const createPeriodo = async (data: { nombre: string }): Promise<Periodo> => {
    const response = await apiFetch('/catalogos/periodos', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response.datos;
};

export const updatePeriodo = async (id: number, data: { nombre: string }): Promise<Periodo> => {
    const response = await apiFetch(`/catalogos/periodos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.datos;
};

export const deletePeriodo = async (id: number): Promise<void> => {
    await apiFetch(`/catalogos/periodos/${id}`, { method: 'DELETE' });
};

// Gestión de Ciclos Escolares
export const getCiclosEscolares = async (): Promise<CicloEscolar[]> => {
    const response = await apiFetch('/ciclos-escolares');
    return response.datos;
};

export const getCicloEscolarById = async (id: number): Promise<CicloEscolar> => {
    const response = await apiFetch(`/ciclos-escolares/${id}`);
    return response.datos;
};

export const createCicloEscolar = async (data: { anio: number; id_cat_periodo: number }): Promise<CicloEscolar> => {
    const response = await apiFetch('/ciclos-escolares', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response.datos;
};

export const updateCicloEscolar = async (id: number, data: { anio: number; id_cat_periodo: number }): Promise<CicloEscolar> => {
    const response = await apiFetch(`/ciclos-escolares/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.datos;
};

export const deleteCicloEscolar = async (id: number): Promise<void> => {
    await apiFetch(`/ciclos-escolares/${id}`, { method: 'DELETE' });
};


export const crearDocente = async(data: any): Promise<void> => {
    return apiFetch('/docentes', { method: 'POST', body: JSON.stringify(data) });
};