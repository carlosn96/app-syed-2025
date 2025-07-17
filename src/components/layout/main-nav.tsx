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

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/campuses", label: "Campuses", icon: Building },
  { href: "/programs", label: "Programs", icon: BookOpenCheck },
  { href: "/subjects", label: "Subjects", icon: Library },
  { href: "/supervision", label: "Supervision", icon: CalendarDays },
  { href: "/feedback", label: "Feedback", icon: Star },
  { href: "/evaluation", label: "Evaluation", icon: ClipboardEdit },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={link.label}
            >
              <a >
                <link.icon />
                <span>{link.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
