
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheck,
  Building,
  CalendarClock,
  LayoutDashboard,
  Library,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"

const allLinks = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
  { href: "/users", label: "Usuarios", icon: Users, roles: ['administrator', 'coordinator'] },
  { href: "/planteles", label: "Planteles", icon: Building, roles: ['administrator', 'coordinator'] },
  { href: "/carreras", label: "Carreras", icon: BookOpenCheck, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
  { href: "/subjects", label: "Materias", icon: Library, roles: ['administrator', 'coordinator', 'teacher'] },
  { href: "/groups", label: "Grupos", icon: Users, roles: ['administrator', 'coordinator'] },
  { href: "/schedules", label: "Horarios", icon: CalendarClock, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
  { href: "/supervision", label: "Supervisión", icon: ShieldCheck, roles: ['administrator', 'coordinator'] },
  { href: "/feedback", label: "Retroalimentación", icon: Star, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const links = allLinks.filter(link => user && link.roles.includes(user.rol));

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={link.label}
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
