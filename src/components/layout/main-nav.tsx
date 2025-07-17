"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheck,
  Building,
  CalendarDays,
  ClipboardEdit,
  LayoutDashboard,
  Library,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
  { href: "/users", label: "Users", icon: Users, roles: ['administrator', 'coordinator'] },
  { href: "/campuses", label: "Campuses", icon: Building, roles: ['administrator', 'coordinator'] },
  { href: "/programs", label: "Programs", icon: BookOpenCheck, roles: ['administrator', 'coordinator'] },
  { href: "/subjects", label: "Subjects", icon: Library, roles: ['administrator', 'coordinator', 'teacher'] },
  { href: "/supervision", label: "Supervision", icon: CalendarDays, roles: ['administrator', 'coordinator', 'teacher'] },
  { href: "/feedback", label: "Feedback", icon: Star, roles: ['administrator', 'coordinator', 'teacher', 'student'] },
  { href: "/evaluation", label: "Evaluation", icon: ClipboardEdit, roles: ['administrator', 'coordinator', 'student'] },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const links = allLinks.filter(link => user && link.roles.includes(user.role));

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
