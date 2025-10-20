
"use client"

import { useState, useEffect } from "react";
import { BookOpenCheck, Building, Users, UserCog, GraduationCap, School } from "lucide-react";
import { User, CareerSummary, Plantel } from "@/lib/modelos";
import { getUsers, getCareers, getPlanteles } from "@/services/api";
import { DashboardCard, CardSkeleton } from "./dashboard-card";

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersData, careersData, plantelesData] = await Promise.all([
          getUsers(),
          getCareers(),
          getPlanteles(),
        ]);
        setUsers(usersData);
        setCareers(careersData);
        setPlanteles(plantelesData);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const counts = {
    students: users.filter(u => u.rol === 'alumno').length,
    teachers: users.filter(u => u.rol === 'docente').length,
    coordinators: users.filter(u => u.rol === 'coordinador').length,
    careers: careers.length,
    planteles: planteles.length,
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Panel de Administrador
      </h1>
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
