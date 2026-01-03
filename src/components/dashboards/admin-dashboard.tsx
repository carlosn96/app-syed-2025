
"use client"

import { useState, useEffect } from "react";
import { BookOpenCheck, Building, Users, UserCog, GraduationCap, School } from "lucide-react";
import { User, CareerSummary, Plantel } from "@/lib/modelos";
import { PageTitle } from "@/components/layout/page-title";
//import { getUsers, getCareers, getPlanteles } from "@/services/api";
import { getAdminNumeralia, UsersCount } from "@/services/api";
import { DashboardCard, CardSkeleton } from "./dashboard-card";

export function AdminDashboard() {
  const [users, setUsers] = useState<UsersCount>({
    students: 0,
    teachers: 0,
    coordinators: 0
  });

  const [careers, setCareers] = useState<number>(0);
  const [planteles, setPlanteles] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { totalUsers, totalCareers, totalPlanteles } = await getAdminNumeralia();
        setUsers(totalUsers);
        setCareers(totalCareers);
        setPlanteles(totalPlanteles);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const counts = {
    students: users.students,
    teachers: users.teachers,
    coordinators: users.coordinators,
    careers: careers,
    planteles: planteles,
  };

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Panel de Administrador</PageTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard title="Alumnos" value={counts.students} icon={GraduationCap} />
            <DashboardCard title="Docentes" value={counts.teachers} icon={School} />
            <DashboardCard title="Coordinadores" value={counts.coordinators} icon={UserCog} />
            <DashboardCard title="Carreras" value={counts.careers} icon={BookOpenCheck} />
            <DashboardCard title="Planteles" value={counts.planteles} icon={Building} />
          </>
        )}
      </div>
      {/* TODO: Add more admin-specific charts and tables here */}
    </div>
  );
}
