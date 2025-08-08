
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheck,
  Building,
  CalendarClock,
  LayoutDashboard,
  ShieldCheck,
  Star,
  Users,
  ClipboardCheck,
  ClipboardList,
  HeartHandshake,
  BookUser,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"

export const allLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, roles: ['administrator', 'coordinator', 'teacher', 'student'], exact: true },
  { href: "/users", label: "Usuarios", icon: Users, roles: ['administrator', 'coordinator'], exact: false },
  { href: "/planteles", label: "Planteles", icon: Building, roles: ['administrator'], exact: true },
  { href: "/carreras", label: "Carreras", icon: BookOpenCheck, roles: ['administrator', 'coordinator'], exact: true },
  { href: "/groups", label: "Grupos", icon: Users, roles: ['administrator', 'coordinator'], exact: true },
  { href: "/schedules", label: "Horarios", icon: CalendarClock, roles: ['administrator', 'coordinator', 'teacher', 'student'], exact: true },
  { href: "/supervisions", label: "Agenda", icon: ClipboardList, roles: ['administrator', 'coordinator'], exact: true },
  { href: "/supervisions-management", label: "Supervisiones", icon: ShieldCheck, roles: ['administrator', 'coordinator'], exact: true },
  { href: "/supervision-rubrics", label: "Gestión de Rúbricas", icon: ClipboardCheck, roles: ['administrator'], exact: true },
  { href: "/evaluations", label: "Evaluaciones", icon: BookUser, roles: ['administrator', 'coordinator', 'student'], exact: false },
  { href: "/palpa", label: "Palpa", icon: HeartHandshake, roles: ['teacher'], exact: true },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { setOpenMobile } = useSidebar();

  const links = allLinks.filter(link => user && link.roles.includes(user.rol));

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={link.label}
              onClick={() => setOpenMobile(false)}
            >
              <Link href={link.href}>
                <Icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
