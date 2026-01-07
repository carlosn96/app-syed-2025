
import { getDocentes, getSupervisions, getEvaluations, getSubjects, getSchedules, getGroupsAdmin, getDocenteForCoordinadorById, getMateriasForCoordinador, getGroups } from '@/services/api';
import { format } from "date-fns";
import type { Docente, Supervision, Evaluation, Subject, Group, Schedule, User } from '@/lib/modelos';
import { Roles } from "@/lib/modelos";

interface GroupEvaluationData {
    groupName: string;
    careerName: string;
    latestAverageRating: number;
    performanceData: { date: string; Calificación: number }[];
}

export interface TeacherProfileData {
    teacher: Docente;
    teacherFullName: string;
    teacherSupervisions: Supervision[];
    teacherEvaluations: Evaluation[];
    teacherSubjects: Subject[];
    supervisionPerformanceData: { date: string; Calificación: number }[];
    averageSupervisionScore: number;
    averageEvaluationScore: number;
    groupPerformance: GroupEvaluationData[];
}

export async function getTeacherProfileData(teacherId: number, user: User): Promise<TeacherProfileData | null> {
    const isCoordinador  = user?.id_rol === Roles.Coordinador;
    try {
        const fn = isCoordinador  ? getDocenteForCoordinadorById : getDocentes;
        const teacherUserResult = await fn(teacherId);
        if (!teacherUserResult || Array.isArray(teacherUserResult)) {
            return null;
        }
        const currentTeacher: Docente = teacherUserResult;

        const [
            allSupervisions,
            allEvaluations,
            allSubjects,
            allSchedules,
            allGroups,
        ] = await Promise.all([
            getSupervisions(),
            getEvaluations(),
            isCoordinador ? getMateriasForCoordinador() : getSubjects(),
            getSchedules(),
            isCoordinador ? getGroups() : getGroupsAdmin(),
        ]);

        const teacherFullName = currentTeacher.nombre_completo;

        const teacherSupervisions = allSupervisions.filter(s => s.teacher === teacherFullName);
        const teacherEvaluations = allEvaluations.filter(e => e.teacherName === teacherFullName);

        const teacherSchedules = (allSchedules as Schedule[]).filter(s => s.teacherId === currentTeacher.id_usuario);
        const subjectIds = [...new Set(teacherSchedules.map(s => s.subjectId))];
        const teacherSubjects = (allSubjects as Subject[]).filter(s => subjectIds.includes(s.id));

        const completedSupervisions = teacherSupervisions.filter(s => s.status === 'Completada' && s.score !== undefined);

        const supervisionPerformanceData = completedSupervisions
            .sort((a, b) => (new Date(a.date!).getTime() || 0) - (new Date(b.date!).getTime() || 0))
            .map(s => ({
                date: s.date ? format(new Date(s.date), "dd/MM/yy") : 'N/A',
                Calificación: s.score!,
            }));

        const averageSupervisionScore = completedSupervisions.length > 0
            ? Math.round(completedSupervisions.reduce((acc, s) => acc + s.score!, 0) / completedSupervisions.length)
            : 0;

        const averageEvaluationScore = teacherEvaluations.length > 0
            ? Math.round(teacherEvaluations.reduce((acc, e) => acc + e.overallRating, 0) / teacherEvaluations.length)
            : 0;

        const evaluationsByGroup = teacherEvaluations.reduce((acc, evaluation) => {
            const groupName = evaluation.groupName || 'Grupo Desconocido';
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(evaluation);
            return acc;
        }, {} as Record<string, Evaluation[]>);

        const groupPerformance: GroupEvaluationData[] = Object.entries(evaluationsByGroup).map(([groupName, groupEvaluations]) => {
            const groupDetails = (allGroups as Group[]).find(g => g.acronimo === groupName);

            const evaluationsByBatch = groupEvaluations.reduce((acc, ev) => {
                const batchId = ev.evaluationBatchId || new Date(ev.date).toISOString().split('T')[0];
                if (!acc[batchId]) {
                    acc[batchId] = { date: new Date(ev.date), ratings: [] };
                }
                acc[batchId].ratings.push(ev.overallRating);
                return acc;
            }, {} as Record<string, { date: Date, ratings: number[] }>);

            const performanceData = Object.values(evaluationsByBatch)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(batch => ({
                    date: format(batch.date, "dd/MM/yy"),
                    Calificación: Math.round(batch.ratings.reduce((sum, r) => sum + r, 0) / batch.ratings.length),
                }));

            const latestAverageRating = performanceData.length > 0 ? performanceData[performanceData.length - 1].Calificación : 0;

            return {
                groupName,
                careerName: groupDetails?.carrera || 'Carrera Desconocida',
                latestAverageRating,
                performanceData
            };
        });

        return {
            teacher: currentTeacher,
            teacherFullName,
            teacherSupervisions,
            teacherEvaluations,
            teacherSubjects: teacherSubjects as Subject[],
            supervisionPerformanceData,
            averageSupervisionScore,
            averageEvaluationScore,
            groupPerformance,
        };

    } catch (err) {
        console.error("Error fetching teacher profile data:", err);
        return null;
    }
}
