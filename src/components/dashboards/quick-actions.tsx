"use client"

import { LucideIcon, Calendar, Users, BookOpen, BarChart3, ClipboardList, Settings } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

const COORDINATOR_ACTIONS: QuickAction[] = [
  {
    title: 'Nueva Supervisión',
    description: 'Programar visita docente',
    icon: Calendar,
    href: '/supervision',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20'
  },
  {
    title: 'Gestionar Docentes',
    description: 'Ver y editar docentes',
    icon: Users,
    href: '/coordinador-docentes',
    color: 'text-accent',
    bgColor: 'bg-accent/10 hover:bg-accent/20'
  },
  {
    title: 'Gestionar Alumnos',
    description: 'Administrar estudiantes',
    icon: BookOpen,
    href: '/coordinador-alumnos',
    color: 'text-success',
    bgColor: 'bg-success/10 hover:bg-success/20'
  },
  {
    title: 'Reportes',
    description: 'Ver estadísticas',
    icon: BarChart3,
    href: '/evaluations',
    color: 'text-warning',
    bgColor: 'bg-warning/10 hover:bg-warning/20'
  },
  {
    title: 'Horarios',
    description: 'Revisar horarios',
    icon: Settings,
    href: '/coordinador-horario',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted hover:bg-muted/80'
  }
];

interface QuickActionsProps {
  isLoading?: boolean;
}

export function QuickActions({ isLoading = false }: QuickActionsProps) {
  if (isLoading) {
    return (
      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50">
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          Acciones Rápidas
        </CardTitle>
        <CardDescription>Accede directamente a las funciones más utilizadas</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COORDINATOR_ACTIONS.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className={cn(
                "group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                action.bgColor,
                "animate-in fade-in-50 slide-in-from-bottom-5"
              )}
              style={{
                animationDelay: `${index * 75}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <div className={cn(
                "p-3 rounded-full mb-3 transition-transform duration-300 group-hover:rotate-12",
                action.bgColor
              )}>
                <action.icon className={cn("h-6 w-6", action.color)} />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground text-center">{action.description}</p>
              
              {/* Indicador de actividad en hover */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
