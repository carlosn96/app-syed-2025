

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
  UserCog,
  BookCopy,
  ChevronDown,
  ChevronRight,
  Folders
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

// Enlaces por rol
const adminLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, exact: true },
  { href: "/alumnos", label: "Alumnos", icon: GraduationCap, exact: true },
  { href: "/docentes", label: "Docentes", icon: School, exact: true },
  { href: "/coordinadores", label: "Coordinadores", icon: UserCog, exact: true },
  { href: "/planteles", label: "Planteles", icon: Building, exact: true },
  { href: "/carreras", label: "Carreras", icon: BookOpenCheck, exact: true },
  { href: "/materias", label: "Materias", icon: BookCopy, exact: true },
  { href: "/catalogos", label: "Catálogos", icon: Folders, exact: true },
  { href: "/supervision-rubrics", label: "Gestión de Rúbricas", icon: ClipboardCheck, exact: true },
]

const coordinadorLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, exact: true },
  { href: "/supervision", label: "Agenda de Supervisiones", icon: ClipboardList, exact: true },
  { href: "/coordinador-alumnos", label: "Alumnos", icon: GraduationCap, exact: true },
  {
    href: "/coordinador-docentes",
    label: "Docentes",
    icon: School,
    exact: false,
    submenu: [
      { href: "/coordinador-docentes", label: "Listado general", exact: true },
      { href: "/coordinador-docentes/asignacion-docentes", label: "Asignación de docentes", exact: true },
      { href: "/coordinador-docentes/por-ciclo", label: "Docentes por ciclo", exact: true }
    ]
  },
  { href: "/groups", label: "Grupos", icon: Users, exact: true },
  { href: "/coordinador-horario", label: "Horarios", icon: CalendarClock, exact: true },
  { href: "/evaluations", label: "Evaluaciones", icon: BookUser, exact: false },
]

const docenteLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, exact: true },
  { href: "/schedules", label: "Horarios", icon: CalendarClock, exact: true },
  { href: "/users/teachers", label: "Registro", icon: HeartHandshake, exact: false },
]

const alumnoLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, exact: true },
  { href: "/schedules", label: "Horarios", icon: CalendarClock, exact: true },
  { href: "/evaluations", label: "Evaluaciones", icon: BookUser, exact: false },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { setOpenMobile, state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Seleccionar enlaces según el rol
  let links: any = [];
  if (user) {
    switch (user.rol) {
      case 'administrador':
        links = adminLinks;
        break;
      case 'coordinador':
        links = coordinadorLinks;
        break;
      case 'docente':
        links = docenteLinks;
        break;
      case 'alumno':
        // Solo mostrar horarios y evaluaciones si el alumno está en un grupo
        links = alumnoLinks.filter(link => {
          if (link.href.startsWith('/schedules') || link.href.startsWith('/evaluations')) {
            return !!user.grupo;
          }
          return true;
        });
        break;
      default:
        links = [];
    }
  }

  return (
    <SidebarMenu>
      {links.map((link: any) => {
        const Icon = link.icon
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)

        let finalHref = link.href;
        if (link.label === "Registro" && user?.rol === 'docente' && user.id_docente) {
          finalHref = `/users/teachers/${user.id_docente}`;
        }

        // Si tiene submenú
        if (link.submenu) {
          const isOpen = openSubmenu === link.href;
          const hasActiveSubmenu = link.submenu.some((sub: any) =>
            sub.exact ? pathname === sub.href : pathname.startsWith(sub.href)
          );

          return (
            <div key={link.href}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive || hasActiveSubmenu}
                  tooltip={isCollapsed ? link.label : undefined}
                  onClick={() => {
                    if (isCollapsed) {
                      setOpenMobile(false);
                    } else {
                      setOpenSubmenu(isOpen ? null : link.href);
                    }
                  }}
                  className="gap-3"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className={cn("flex-1 transition-all duration-200", isCollapsed && "opacity-0 w-0")}>
                    {link.label}
                  </span>
                  {!isCollapsed && (
                    isOpen ?
                      <ChevronDown className="size-4 shrink-0 transition-transform" /> :
                      <ChevronRight className="size-4 shrink-0 transition-transform" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Submenú */}
              {isOpen && !isCollapsed && (
                <div className="ml-6 mr-2 mt-1 space-y-1">
                  {link.submenu.map((subItem: any) => {
                    const isSubActive = subItem.exact ? pathname === subItem.href : pathname.startsWith(subItem.href);
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isSubActive}
                          onClick={() => setOpenMobile(false)}
                          size="sm"
                          className={cn(
                            "rounded-md",
                            isSubActive && "bg-sidebar-accent/10 hover:bg-sidebar-accent/40"
                          )}
                        >
                          <Link href={subItem.href} className="gap-2 pl-3 pr-3">
                            <div className="size-1.5 rounded-full bg-current shrink-0" />
                            <span className="text-sm text-sidebar-foreground transition-all duration-200">{subItem.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </div>
          );
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
