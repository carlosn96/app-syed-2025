"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { format, isToday, isTomorrow, differenceInDays, getDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Plus, 
  Pencil, 
  ClipboardCheck,
  Users,
  TrendingUp,
  Filter,
  Search,
  CalendarDays,
  GraduationCap,
  MapPin,
  BookOpen,
  Eye,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Building,
  UserCheck,
  Ban,
  Info
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

import { PageTitle } from "@/components/layout/page-title"

// ============================================
// TIPOS Y ESTRUCTURAS DE DATOS
// ============================================

// Días de la semana (0=Domingo, 1=Lunes, etc.)
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

const dayNames: Record<DayOfWeek, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado"
}

// Asignación de docente a materia con horario
interface TeacherAssignment {
  id: number
  teacherId: number
  teacherName: string
  teacherEmail: string
  subjectId: number
  subjectName: string
  careerId: number
  careerName: string
  groupName: string
  plantelId: number
  plantelName: string
  cicloEscolarId: number
  cicloEscolarName: string
  turno: "Matutino" | "Vespertino" | "Nocturno"
  // Horario: días de la semana en que se imparte la materia
  scheduleDays: DayOfWeek[]
  startTime: string
  endTime: string
  classroom: string
}

// Supervisión
interface Supervision {
  id: number
  assignmentId: number // Referencia a la asignación docente-materia
  teacherId: number
  teacherName: string
  teacherEmail: string
  subjectName: string
  careerId: number
  careerName: string
  groupName: string
  plantelId: number
  plantelName: string
  cicloEscolarId: number
  cicloEscolarName: string
  classroom: string
  date: Date
  startTime: string
  endTime: string
  status: "Programada" | "Completada" | "Cancelada"
  evaluationScore: number | null
  observations: string | null
  scheduleDays: DayOfWeek[] // Días válidos para reprogramar
}

// ============================================
// MOCK DATA - Ciclo Escolar y Planteles
// ============================================

const currentCicloEscolar = {
  id: 1,
  name: "2024-2",
  startDate: new Date(2024, 7, 1),
  endDate: new Date(2024, 11, 31)
}

const planteles = [
  { id: 1, name: "Campus Principal" },
  { id: 2, name: "Campus Norte" },
]

// ============================================
// MOCK DATA - Asignaciones de Docentes
// ============================================

const mockTeacherAssignments: TeacherAssignment[] = [
  // María González - Imparte 2 materias en ISC (misma carrera)
  {
    id: 1,
    teacherId: 1,
    teacherName: "María González Pérez",
    teacherEmail: "maria.gonzalez@universidad.edu",
    subjectId: 101,
    subjectName: "Programación Avanzada",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-601",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Matutino",
    scheduleDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    startTime: "09:00",
    endTime: "10:30",
    classroom: "Aula A-201"
  },
  {
    id: 2,
    teacherId: 1,
    teacherName: "María González Pérez",
    teacherEmail: "maria.gonzalez@universidad.edu",
    subjectId: 102,
    subjectName: "Estructuras de Datos",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-401",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Matutino",
    scheduleDays: [2, 4], // Martes, Jueves
    startTime: "11:00",
    endTime: "12:30",
    classroom: "Aula A-202"
  },
  // María González - También da clases en otra carrera (Ing. Industrial)
  {
    id: 3,
    teacherId: 1,
    teacherName: "María González Pérez",
    teacherEmail: "maria.gonzalez@universidad.edu",
    subjectId: 201,
    subjectName: "Programación para Ingeniería",
    careerId: 2,
    careerName: "Ingeniería Industrial",
    groupName: "IIN-301",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Vespertino",
    scheduleDays: [1, 3], // Lunes, Miércoles
    startTime: "15:00",
    endTime: "16:30",
    classroom: "Aula B-101"
  },
  // Roberto Silva - Una materia en Administración
  {
    id: 4,
    teacherId: 2,
    teacherName: "Roberto Silva Martínez",
    teacherEmail: "roberto.silva@universidad.edu",
    subjectId: 301,
    subjectName: "Contabilidad Financiera",
    careerId: 3,
    careerName: "Licenciatura en Administración",
    groupName: "LAD-401",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Matutino",
    scheduleDays: [2, 4], // Martes, Jueves
    startTime: "11:00",
    endTime: "12:30",
    classroom: "Aula B-105"
  },
  // Carlos Hernández - Dos materias diferentes en ISC
  {
    id: 5,
    teacherId: 3,
    teacherName: "Carlos Hernández López",
    teacherEmail: "carlos.hernandez@universidad.edu",
    subjectId: 103,
    subjectName: "Bases de Datos",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-501",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Matutino",
    scheduleDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    startTime: "10:00",
    endTime: "11:30",
    classroom: "Lab. Cómputo 3"
  },
  {
    id: 6,
    teacherId: 3,
    teacherName: "Carlos Hernández López",
    teacherEmail: "carlos.hernandez@universidad.edu",
    subjectId: 104,
    subjectName: "Redes de Computadoras",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-601",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Vespertino",
    scheduleDays: [2, 4], // Martes, Jueves
    startTime: "14:00",
    endTime: "15:30",
    classroom: "Lab. Redes"
  },
  // Ana Patricia - Ing. Industrial
  {
    id: 7,
    teacherId: 4,
    teacherName: "Ana Patricia Ramírez",
    teacherEmail: "ana.ramirez@universidad.edu",
    subjectId: 202,
    subjectName: "Control de Calidad",
    careerId: 2,
    careerName: "Ingeniería Industrial",
    groupName: "IIN-502",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Vespertino",
    scheduleDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    startTime: "14:00",
    endTime: "15:30",
    classroom: "Lab. de Calidad"
  },
  // Diana Flores - Marketing
  {
    id: 8,
    teacherId: 5,
    teacherName: "Diana Flores Jiménez",
    teacherEmail: "diana.flores@universidad.edu",
    subjectId: 401,
    subjectName: "Marketing Digital",
    careerId: 4,
    careerName: "Licenciatura en Marketing",
    groupName: "MKT-301",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    turno: "Matutino",
    scheduleDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    startTime: "09:00",
    endTime: "10:30",
    classroom: "Aula C-302"
  },
]

// ============================================
// MOCK DATA - Supervisiones (vinculadas a asignaciones)
// ============================================

const mockSupervisions: Supervision[] = [
  {
    id: 1,
    assignmentId: 1,
    teacherId: 1,
    teacherName: "María González Pérez",
    teacherEmail: "maria.gonzalez@universidad.edu",
    subjectName: "Programación Avanzada",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-601",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    classroom: "Aula A-201",
    date: new Date(2024, 11, 20), // Viernes
    startTime: "09:00",
    endTime: "10:30",
    status: "Programada",
    evaluationScore: null,
    observations: null,
    scheduleDays: [1, 3, 5] // Solo puede reprogramarse a L, Mi, V
  },
  {
    id: 2,
    assignmentId: 4,
    teacherId: 2,
    teacherName: "Roberto Silva Martínez",
    teacherEmail: "roberto.silva@universidad.edu",
    subjectName: "Contabilidad Financiera",
    careerId: 3,
    careerName: "Licenciatura en Administración",
    groupName: "LAD-401",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    classroom: "Aula B-105",
    date: new Date(2024, 11, 19), // Jueves
    startTime: "11:00",
    endTime: "12:30",
    status: "Programada",
    evaluationScore: null,
    observations: null,
    scheduleDays: [2, 4]
  },
  {
    id: 3,
    assignmentId: 7,
    teacherId: 4,
    teacherName: "Ana Patricia Ramírez",
    teacherEmail: "ana.ramirez@universidad.edu",
    subjectName: "Control de Calidad",
    careerId: 2,
    careerName: "Ingeniería Industrial",
    groupName: "IIN-502",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    classroom: "Lab. de Calidad",
    date: new Date(2024, 11, 18), // Miércoles
    startTime: "14:00",
    endTime: "15:30",
    status: "Completada",
    evaluationScore: 92,
    observations: "Excelente manejo de grupo, dominio del tema destacable.",
    scheduleDays: [1, 3, 5]
  },
  {
    id: 4,
    assignmentId: 5,
    teacherId: 3,
    teacherName: "Carlos Hernández López",
    teacherEmail: "carlos.hernandez@universidad.edu",
    subjectName: "Bases de Datos",
    careerId: 1,
    careerName: "Ingeniería en Sistemas",
    groupName: "ISC-501",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    classroom: "Lab. Cómputo 3",
    date: new Date(2024, 11, 23), // Lunes
    startTime: "10:00",
    endTime: "11:30",
    status: "Programada",
    evaluationScore: null,
    observations: null,
    scheduleDays: [1, 3, 5]
  },
  {
    id: 5,
    assignmentId: 8,
    teacherId: 5,
    teacherName: "Diana Flores Jiménez",
    teacherEmail: "diana.flores@universidad.edu",
    subjectName: "Marketing Digital",
    careerId: 4,
    careerName: "Licenciatura en Marketing",
    groupName: "MKT-301",
    plantelId: 1,
    plantelName: "Campus Principal",
    cicloEscolarId: 1,
    cicloEscolarName: "2024-2",
    classroom: "Aula C-302",
    date: new Date(2024, 11, 27), // Viernes
    startTime: "09:00",
    endTime: "10:30",
    status: "Programada",
    evaluationScore: null,
    observations: null,
    scheduleDays: [1, 3, 5]
  },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SupervisionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [careerFilter, setCareerFilter] = useState("all")
  const [plantelFilter, setPlantelFilter] = useState("all")
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("docentes")
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null)

  // ============================================
  // LÓGICA DE NEGOCIO: Docentes supervisados por carrera
  // ============================================
  
  // Obtener docentes que ya están supervisados o agendados por plantel + carrera en el ciclo actual
  // La clave incluye: plantelId-careerId-cicloEscolarId
  // Esto permite que un docente sea supervisado en diferentes planteles aunque sea la misma carrera
  const supervisedTeachersByPlantelCareer = useMemo(() => {
    const map = new Map<string, Set<number>>() // plantelId-careerId-cicloId -> Set<teacherId>
    
    mockSupervisions
      .filter(s => s.status === "Programada" || s.status === "Completada")
      .forEach(s => {
        const key = `${s.plantelId}-${s.careerId}-${s.cicloEscolarId}`
        if (!map.has(key)) {
          map.set(key, new Set())
        }
        map.get(key)!.add(s.teacherId)
      })
    
    return map
  }, [])

  // Verificar si un docente ya está supervisado/agendado para un plantel + carrera específicos
  const isTeacherSupervisedInPlantelCareer = (teacherId: number, plantelId: number, careerId: number, cicloEscolarId: number) => {
    const key = `${plantelId}-${careerId}-${cicloEscolarId}`
    return supervisedTeachersByPlantelCareer.get(key)?.has(teacherId) ?? false
  }

  // Obtener asignaciones disponibles para agendar (docentes NO supervisados en ese plantel + carrera)
  const availableAssignments = useMemo(() => {
    return mockTeacherAssignments.filter(a => 
      !isTeacherSupervisedInPlantelCareer(a.teacherId, a.plantelId, a.careerId, a.cicloEscolarId)
    )
  }, [supervisedTeachersByPlantelCareer])

  // Asignaciones donde el docente YA está supervisado (para mostrar en gris)
  const unavailableAssignments = useMemo(() => {
    return mockTeacherAssignments.filter(a => 
      isTeacherSupervisedInPlantelCareer(a.teacherId, a.plantelId, a.careerId, a.cicloEscolarId)
    )
  }, [supervisedTeachersByPlantelCareer])

  // ============================================
  // DATOS PROCESADOS
  // ============================================

  const supervisions = mockSupervisions

  // Mapa de supervisiones por fecha para el calendario
  const supervisionsByDate = useMemo(() => {
    const map = new Map<string, Supervision[]>()
    supervisions.forEach(s => {
      if (!s.date) return
      const dateKey = format(s.date, "yyyy-MM-dd")
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(s)
    })
    return map
  }, [supervisions])

  // Supervisiones del día seleccionado en el calendario
  const selectedDateSupervisions = useMemo(() => {
    if (!date) return []
    const dateKey = format(date, "yyyy-MM-dd")
    return supervisionsByDate.get(dateKey) || []
  }, [date, supervisionsByDate])

  // Próximas supervisiones programadas
  const upcomingSupervisions = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return supervisions
      .filter(s => s.date && s.date >= today && s.status === 'Programada')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }, [supervisions])

  // Carreras únicas para el filtro
  const uniqueCareers = useMemo(() => {
    const careers = new Set(supervisions.map(s => s.careerName))
    return Array.from(careers)
  }, [supervisions])

  // Planteles únicos para el filtro
  const uniquePlanteles = useMemo(() => {
    const planteles = new Set(supervisions.map(s => s.plantelName))
    return Array.from(planteles)
  }, [supervisions])

  // Filtrado para la tabla/lista
  const filteredSupervisions = useMemo(() => {
    return supervisions.filter(s => {
      const matchesSearch = s.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.careerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      const matchesCareer = careerFilter === "all" || s.careerName === careerFilter
      const matchesPlantel = plantelFilter === "all" || s.plantelName === plantelFilter
      return matchesSearch && matchesStatus && matchesCareer && matchesPlantel
    })
  }, [supervisions, searchTerm, statusFilter, careerFilter, plantelFilter])

  // Estadísticas detalladas
  const stats = useMemo(() => {
    const total = supervisions.length
    const programadas = supervisions.filter(s => s.status === "Programada").length
    const completadas = supervisions.filter(s => s.status === "Completada").length
    const canceladas = supervisions.filter(s => s.status === "Cancelada").length
    
    // Promedio de evaluaciones completadas
    const evaluadas = supervisions.filter(s => s.evaluationScore !== null)
    const promedioEvaluacion = evaluadas.length > 0 
      ? Math.round(evaluadas.reduce((acc, s) => acc + (s.evaluationScore || 0), 0) / evaluadas.length)
      : 0
    
    // Tasa de cumplimiento
    const tasaCumplimiento = total > 0 ? Math.round((completadas / (completadas + canceladas || 1)) * 100) : 0
    
    // Docentes únicos supervisados
    const docentesUnicos = new Set(supervisions.map(s => s.teacherId)).size

    // Docentes pendientes por supervisar
    const docentesPendientes = availableAssignments.length
    
    return { total, programadas, completadas, canceladas, promedioEvaluacion, tasaCumplimiento, docentesUnicos, docentesPendientes }
  }, [supervisions, availableAssignments])

  // Helper para mostrar etiqueta de proximidad
  const getDateProximityLabel = (dateVal: Date) => {
    if (isToday(dateVal)) return "Hoy"
    if (isTomorrow(dateVal)) return "Mañana"
    const days = differenceInDays(dateVal, new Date())
    if (days > 0 && days <= 7) return `En ${days} días`
    return null
  }

  // Helper para color de estado
  const getStatusVariant = (status: string): "outline" | "default" | "destructive" | "secondary" => {
    switch (status) {
      case "Programada": return "outline"
      case "Completada": return "default"
      case "Cancelada": return "destructive"
      default: return "secondary"
    }
  }

  // Obtener días válidos para una supervisión (según horario de la materia)
  const getValidDaysForSupervision = (supervision: Supervision): Date[] => {
    const validDates: Date[] = []
    const today = new Date()
    const endDate = currentCicloEscolar.endDate
    
    // Iterar desde hoy hasta fin del ciclo escolar
    const currentDate = new Date(today)
    while (currentDate <= endDate) {
      const dayOfWeek = getDay(currentDate) as DayOfWeek
      if (supervision.scheduleDays.includes(dayOfWeek)) {
        validDates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return validDates
  }

  // Verificar si una fecha es válida para reprogramar
  const isValidDateForReschedule = (dateToCheck: Date, supervision: Supervision): boolean => {
    const dayOfWeek = getDay(dateToCheck) as DayOfWeek
    return supervision.scheduleDays.includes(dayOfWeek)
  }

  // Abrir detalle de supervisión
  const openSupervisionDetail = (supervision: Supervision) => {
    setSelectedSupervision(supervision)
    setDetailModalOpen(true)
  }

  // Abrir modal de agendar con asignación seleccionada
  const openScheduleModal = (assignment: TeacherAssignment) => {
    setSelectedAssignment(assignment)
    setScheduleModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8 space-y-6">
        
        {/* Header con acción principal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <PageTitle>{"Agenda de Supervisiones"}</PageTitle>
            <p className="text-muted-foreground mt-1">
              Gestiona y programa las supervisiones docentes • Ciclo {currentCicloEscolar.name}
            </p>
          </div>
          
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Agendar Supervisión
          </Button>
        </div>

        {/* Stats Cards - Diseño limpio con colores del sistema */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Agendadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{stats.programadas}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{stats.completadas}</p>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border shadow-sm cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold font-display">{stats.docentesPendientes}</p>
                        <p className="text-xs text-muted-foreground">Por supervisar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Asignaciones docente-materia disponibles para agendar supervisión</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Indicadores de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasa de cumplimiento</span>
                <span className="text-sm font-bold text-primary">{stats.tasaCumplimiento}%</span>
              </div>
              <Progress value={stats.tasaCumplimiento} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats.completadas} completadas de {stats.completadas + stats.canceladas} finalizadas
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Promedio de evaluación</span>
                <span className="text-sm font-bold text-primary">{stats.promedioEvaluacion}/100</span>
              </div>
              <Progress value={stats.promedioEvaluacion} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Basado en {supervisions.filter(s => s.evaluationScore).length} evaluaciones completadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para organizar contenido */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="docentes" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Docentes</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="proximas" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Próximas</span>
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Docentes Disponibles para Supervisar */}
          <TabsContent value="docentes" className="space-y-4">
            {/* Información sobre la lógica de supervisión */}
            <Card className="border border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Reglas de supervisión por ciclo escolar</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Una vez supervisado en <strong>una materia</strong>, el docente se considera supervisado en <strong>toda la carrera del plantel</strong></li>
                      <li>• Si la misma carrera se oferta en <strong>varios planteles</strong>, cada plantel se supervisa de forma independiente</li>
                      <li>• El mismo docente puede ser supervisado en <strong>diferentes carreras</strong> o <strong>diferentes planteles</strong></li>
                      <li>• Las supervisiones solo pueden agendarse en los días del horario de la materia</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Docentes disponibles para supervisar */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-success" />
                    Disponibles para Supervisar
                  </CardTitle>
                  <CardDescription>
                    {availableAssignments.length} asignaciones docente-materia pendientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-3">
                      {availableAssignments.length > 0 ? (
                        availableAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="p-3 rounded-lg border bg-card hover:border-success/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{assignment.teacherName}</p>
                                <p className="text-xs text-muted-foreground">{assignment.subjectName}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {assignment.careerName}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Building className="h-3 w-3 mr-1" />
                                    {assignment.plantelName}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {assignment.groupName}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {assignment.startTime} - {assignment.endTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {assignment.scheduleDays.map(d => dayNames[d].slice(0, 2)).join(", ")}
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => openScheduleModal(assignment)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Agendar
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-10 w-10 text-success/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Todos los docentes han sido supervisados en este ciclo
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Docentes ya supervisados/agendados */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ban className="h-5 w-5 text-muted-foreground" />
                    Ya Supervisados / Agendados
                  </CardTitle>
                  <CardDescription>
                    {unavailableAssignments.length} asignaciones donde el docente ya está cubierto
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-3">
                      {unavailableAssignments.length > 0 ? (
                        unavailableAssignments.map((assignment) => {
                          // Encontrar la supervisión que cubre a este docente (mismo plantel + carrera)
                          const coveringSupervision = supervisions.find(
                            s => s.teacherId === assignment.teacherId && 
                                 s.plantelId === assignment.plantelId &&
                                 s.careerId === assignment.careerId &&
                                 (s.status === "Programada" || s.status === "Completada")
                          )
                          return (
                            <div
                              key={assignment.id}
                              className="p-3 rounded-lg border bg-muted/30 opacity-70"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-muted-foreground">{assignment.teacherName}</p>
                                  <p className="text-xs text-muted-foreground">{assignment.subjectName}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <Badge variant="outline" className="text-xs opacity-70">
                                      <GraduationCap className="h-3 w-3 mr-1" />
                                      {assignment.careerName}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs opacity-70">
                                      <Building className="h-3 w-3 mr-1" />
                                      {assignment.plantelName}
                                    </Badge>
                                  </div>
                                  {coveringSupervision && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3 text-success" />
                                      Cubierto por supervisión en "{coveringSupervision.subjectName}"
                                      {coveringSupervision.status === "Completada" && " (Completada)"}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  Cubierto
                                </Badge>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No hay docentes supervisados aún
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Calendario Interactivo */}
          <TabsContent value="calendario" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendario */}
              <Card className="lg:col-span-2 border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Calendario de Supervisiones
                  </CardTitle>
                  <CardDescription>
                    Selecciona una fecha para ver las supervisiones programadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md w-full"
                    classNames={{
                      months: "w-full",
                      month: "w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-base font-semibold",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-md transition-colors",
                      table: "w-full border-collapse",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-full font-medium text-sm",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                      day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      day_today: "bg-accent/20 text-accent-foreground font-semibold",
                    }}
                    modifiers={{
                      scheduled: Array.from(supervisionsByDate.keys()).map(d => new Date(d + 'T00:00:00'))
                    }}
                    modifiersClassNames={{
                      scheduled: 'bg-primary/10 font-bold ring-1 ring-primary/30 hover:bg-primary/20'
                    }}
                  />
                </CardContent>
              </Card>

              {/* Panel de supervisiones del día seleccionado */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {date ? format(date, "EEEE, d MMMM", { locale: es }) : "Selecciona una fecha"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateSupervisions.length} supervisión(es) programada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedDateSupervisions.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="p-4 space-y-3">
                        {selectedDateSupervisions.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => openSupervisionDetail(s)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{s.teacherName}</p>
                                <p className="text-xs text-muted-foreground truncate">{s.subjectName}</p>
                              </div>
                              <Badge variant={getStatusVariant(s.status)} className="text-xs shrink-0">
                                {s.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {s.startTime} - {s.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {s.classroom}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-8 text-center">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No hay supervisiones para esta fecha
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Agendar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Próximas Supervisiones */}
          <TabsContent value="proximas" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Próximas Supervisiones
                </CardTitle>
                <CardDescription>
                  Supervisiones programadas para los próximos días
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSupervisions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSupervisions.map((s) => {
                      const proximityLabel = getDateProximityLabel(s.date)
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => openSupervisionDetail(s)}
                        >
                          {/* Fecha visual */}
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/5 border shrink-0">
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              {format(s.date, 'MMM', { locale: es })}
                            </span>
                            <span className="text-2xl font-bold font-display text-primary">
                              {format(s.date, 'dd')}
                            </span>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{s.teacherName}</p>
                              {proximityLabel && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {proximityLabel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{s.subjectName}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {s.startTime} - {s.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {s.classroom}
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {s.groupName}
                              </span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              <ClipboardCheck className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay supervisiones programadas</p>
                    <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Primera Supervisión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Historial Completo */}
          <TabsContent value="historial" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Historial de Supervisiones
                    </CardTitle>
                    <CardDescription>
                      Busca y filtra todas las supervisiones realizadas
                    </CardDescription>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por docente, materia o carrera..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={plantelFilter} onValueChange={setPlantelFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Building className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Plantel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los planteles</SelectItem>
                      {uniquePlanteles.map(plantel => (
                        <SelectItem key={plantel} value={plantel}>{plantel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={careerFilter} onValueChange={setCareerFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las carreras</SelectItem>
                      {uniqueCareers.map(career => (
                        <SelectItem key={career} value={career}>{career}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Programada">Programadas</SelectItem>
                      <SelectItem value="Completada">Completadas</SelectItem>
                      <SelectItem value="Cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile View - Cards */}
                <div className="grid grid-cols-1 gap-4 lg:hidden">
                  {filteredSupervisions.map((supervision) => (
                    <Card 
                      key={supervision.id} 
                      className="border hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => openSupervisionDetail(supervision)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{supervision.teacherName}</CardTitle>
                            <CardDescription className="truncate">{supervision.subjectName}</CardDescription>
                          </div>
                          <Badge variant={getStatusVariant(supervision.status)}>
                            {supervision.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {supervision.plantelName}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {supervision.careerName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{supervision.date ? format(supervision.date, "PPP", { locale: es }) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono">{supervision.startTime} - {supervision.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{supervision.classroom}</span>
                        </div>
                        {supervision.evaluationScore && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="font-medium">Calificación: {supervision.evaluationScore}/100</span>
                          </div>
                        )}
                        {supervision.status === 'Programada' && (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button size="sm" className="flex-1">
                              <ClipboardCheck className="h-4 w-4 mr-2" />
                              Evaluar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold">Docente</TableHead>
                          <TableHead className="font-semibold">Materia</TableHead>
                          <TableHead className="font-semibold">Plantel</TableHead>
                          <TableHead className="font-semibold">Carrera</TableHead>
                          <TableHead className="font-semibold">Fecha</TableHead>
                          <TableHead className="font-semibold">Horario</TableHead>
                          <TableHead className="font-semibold">Estado</TableHead>
                          <TableHead className="font-semibold">Calif.</TableHead>
                          <TableHead className="font-semibold text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSupervisions.map((supervision) => (
                          <TableRow 
                            key={supervision.id} 
                            className="cursor-pointer"
                            onClick={() => openSupervisionDetail(supervision)}
                          >
                            <TableCell className="font-medium">{supervision.teacherName}</TableCell>
                            <TableCell className="text-muted-foreground">{supervision.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {supervision.plantelName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {supervision.careerName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {supervision.date ? format(supervision.date, "dd/MM/yyyy", { locale: es }) : 'N/A'}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {supervision.startTime} - {supervision.endTime}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(supervision.status)}>
                                {supervision.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {supervision.evaluationScore ? (
                                <span className="font-medium">{supervision.evaluationScore}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openSupervisionDetail(supervision) }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {supervision.status === 'Programada' && (
                                  <>
                                    <Button size="sm" variant="ghost">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <ClipboardCheck className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {filteredSupervisions.length === 0 && (
                  <div className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No se encontraron supervisiones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalle de Supervisión */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalle de Supervisión</DialogTitle>
              <DialogDescription>
                Información completa de la supervisión seleccionada
              </DialogDescription>
            </DialogHeader>
            
            {selectedSupervision && (
              <div className="space-y-6">
                {/* Estado y fecha */}
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(selectedSupervision.status)} className="text-sm">
                    {selectedSupervision.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedSupervision.date ? format(selectedSupervision.date, "PPPP", { locale: es }) : 'N/A'}
                  </span>
                </div>

                {/* Información del docente */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedSupervision.teacherName}</p>
                      <p className="text-sm text-muted-foreground">{selectedSupervision.teacherEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles de la clase */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> Materia
                    </p>
                    <p className="font-medium">{selectedSupervision.subjectName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> Carrera
                    </p>
                    <p className="font-medium">{selectedSupervision.careerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> Grupo
                    </p>
                    <p className="font-medium">{selectedSupervision.groupName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Aula
                    </p>
                    <p className="font-medium">{selectedSupervision.classroom}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Horario
                    </p>
                    <p className="font-medium font-mono">{selectedSupervision.startTime} - {selectedSupervision.endTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Building className="h-4 w-4" /> Plantel
                    </p>
                    <p className="font-medium">{selectedSupervision.plantelName}</p>
                  </div>
                </div>

                {/* Días válidos para reprogramación */}
                {selectedSupervision.status === 'Programada' && (
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Info className="h-3 w-3" /> Días válidos para reprogramar (según horario de la materia)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSupervision.scheduleDays.map(day => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {dayNames[day]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resultado de evaluación */}
                {selectedSupervision.evaluationScore !== null && (
                  <div className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Resultado de Evaluación</span>
                      <span className="text-2xl font-bold font-display text-primary">
                        {selectedSupervision.evaluationScore}/100
                      </span>
                    </div>
                    <Progress value={selectedSupervision.evaluationScore} className="h-2" />
                    {selectedSupervision.observations && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Observaciones:</strong> {selectedSupervision.observations}
                      </p>
                    )}
                  </div>
                )}

                {/* Observaciones de cancelación */}
                {selectedSupervision.status === 'Cancelada' && selectedSupervision.observations && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span><strong>Motivo de cancelación:</strong> {selectedSupervision.observations}</span>
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-3 pt-2">
                  {selectedSupervision.status === 'Programada' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        <Pencil className="h-4 w-4 mr-2" />
                        Reprogramar
                      </Button>
                      <Button className="flex-1">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Iniciar Evaluación
                      </Button>
                    </>
                  )}
                  {selectedSupervision.status === 'Completada' && (
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Evaluación Completa
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal para Agendar Supervisión */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Supervisión</DialogTitle>
              <DialogDescription>
                Selecciona un docente disponible para supervisar en el ciclo {currentCicloEscolar.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Info */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Al supervisar a un docente en una materia, quedará marcado como supervisado para 
                    <strong> toda la carrera</strong> en este ciclo escolar. Solo se muestran docentes 
                    que aún no han sido supervisados en su respectiva carrera.
                  </span>
                </p>
              </div>

              {/* Lista de asignaciones disponibles */}
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-3">
                  {availableAssignments.length > 0 ? (
                    availableAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => openScheduleModal(assignment)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{assignment.teacherName}</p>
                            <p className="text-sm text-muted-foreground">{assignment.subjectName}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {assignment.careerName}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {assignment.groupName}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {assignment.turno}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {assignment.startTime} - {assignment.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {assignment.scheduleDays.map(d => dayNames[d].slice(0, 2)).join(", ")}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {assignment.classroom}
                              </span>
                            </div>
                          </div>
                          <Button size="sm">
                            Seleccionar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-success/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Todos los docentes han sido supervisados en este ciclo
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para seleccionar fecha de supervisión */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Seleccionar Fecha</DialogTitle>
              <DialogDescription>
                Elige una fecha válida según el horario de la materia
              </DialogDescription>
            </DialogHeader>
            
            {selectedAssignment && (
              <div className="space-y-4">
                {/* Resumen de la asignación */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedAssignment.teacherName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.subjectName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{selectedAssignment.careerName}</span>
                    <span>•</span>
                    <span>{selectedAssignment.groupName}</span>
                  </div>
                </div>

                {/* Días válidos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Días de clase disponibles</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssignment.scheduleDays.map(day => (
                      <Badge key={day} variant="outline">
                        {dayNames[day]}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Horario: {selectedAssignment.startTime} - {selectedAssignment.endTime} • {selectedAssignment.classroom}
                  </p>
                </div>

                {/* Calendario con días válidos destacados */}
                <div className="border rounded-lg p-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md w-full"
                    disabled={(dateToCheck) => {
                      const dayOfWeek = getDay(dateToCheck) as DayOfWeek
                      return !selectedAssignment.scheduleDays.includes(dayOfWeek) || 
                             dateToCheck < new Date() ||
                             dateToCheck > currentCicloEscolar.endDate
                    }}
                    classNames={{
                      months: "w-full",
                      month: "w-full",
                      day_disabled: "text-muted-foreground/30",
                    }}
                  />
                </div>

                {date && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>
                        Fecha seleccionada: <strong>{format(date, "PPPP", { locale: es })}</strong>
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={!date}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Supervisión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}