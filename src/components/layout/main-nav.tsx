
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheck,
  Building,
  CalendarClock,
  LayoutDashboard,
  ShieldCheck,
  Users,
  ClipboardCheck,
  ClipboardList,
  HeartHandshake,
  BookUser,
  GraduationCap,
  School,
  UserCog
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

export const allLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, roles: ['administrador', 'coordinador', 'docente', 'alumno'], exact: true },
  { href: "/alumnos", label: "Alumnos", icon: GraduationCap, roles: ['administrador', 'coordinador'], exact: true },
  { href: "/docentes", label: "Docentes", icon: School, roles: ['administrador', 'coordinador'], exact: true },
  { href: "/coordinadores", label: "Coordinadores", icon: UserCog, roles: ['administrador'], exact: true },
  { href: "/planteles", label: "Planteles", icon: Building, roles: ['administrador'], exact: true },
  { href: "/carreras", label: "Carreras", icon: BookOpenCheck, roles: ['administrador', 'coordinador'], exact: true },
  { href: "/groups", label: "Grupos", icon: Users, roles: ['administrador', 'coordinador'], exact: true },
  { href: "/schedules", label: "Horarios", icon: CalendarClock, roles: ['coordinador', 'docente', 'alumno'], exact: true },
  { href: "/supervisions", label: "Agenda", icon: ClipboardList, roles: ['coordinador'], exact: true },
  { href: "/supervisions-management", label: "Supervisiones", icon: ShieldCheck, roles: ['administrador', 'coordinador'], exact: true },
  { href: "/supervision-rubrics", label: "Gestión de Rúbricas", icon: ClipboardCheck, roles: ['administrador'], exact: true },
  { href: "/evaluations", label: "Evaluaciones", icon: BookUser, roles: ['coordinador', 'alumno'], exact: false },
  { href: "/users/teachers", label: "Registro", icon: HeartHandshake, roles: ['docente'], exact: false },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { setOpenMobile, state } = useSidebar();
  const isCollapsed = state === 'collapsed'; 

  const links = allLinks.filter(link => {
    if (!user || !link.roles.includes(user.rol)) {
      return false;
    }
    // Specific rule for students: only show schedules/evaluations if they are in a group
    if (user.rol === 'alumno' && (link.href.startsWith('/schedules') || link.href.startsWith('/evaluations'))) {
      return !!user.grupo;
    }
    return true;
  });

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        
        let finalHref = link.href;
        if (link.label === "Registro" && user?.rol === 'docente' && user.id_docente) {
            finalHref = `/users/teachers/${user.id_docente}`;
        }
        
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={link.label}
              onClick={() => setOpenMobile(false)}
            >
              <Link href={finalHref} className="gap-3">
                <Icon className="size-5 shrink-0" />
                <span className={cn("transition-all duration-200", isCollapsed && "opacity-0 w-0")}>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
