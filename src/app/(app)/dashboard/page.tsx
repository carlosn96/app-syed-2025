
"use client"

import { useAuth } from "@/context/auth-context"
import { PageTitle } from "@/components/layout/page-title"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { CoordinatorDashboard } from "@/components/dashboards/coordinator-dashboard";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
        <div className="flex flex-col gap-8">
            <Skeleton className="h-9 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
        </div>
    )
  }

  switch(user.rol) {
    case 'administrador':
      return <AdminDashboard />;
    case 'coordinador':
      return <CoordinatorDashboard />;
    case 'docente':
        return <TeacherDashboard user={user} />;
    case 'alumno':
        return <StudentDashboard user={user} />;
    default:
      return (
        <div>
          <PageTitle>Panel de Control</PageTitle>
          <p className="text-muted-foreground">Rol de usuario no reconocido.</p>
        </div>
      )
  }
}
