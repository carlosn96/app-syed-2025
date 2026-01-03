"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useSidebar } from "@/components/ui/sidebar"
import {
  User,
  Settings,
  Palette,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function UserNav() {
  const { user, logout } = useAuth()
  const { state, isMobile } = useSidebar()
  const router = useRouter()

  if (!user) return null

  const isCollapsed = state === "collapsed" && !isMobile

  const userName = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.trim()
  const userEmail = user.correo
  const initials =
    `${user.nombre?.[0] ?? ""}${user.apellido_paterno?.[0] ?? ""}`.toUpperCase()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center rounded-full transition-all",
            "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
            isCollapsed
              ? "h-10 w-10 justify-center p-0"
              : "h-auto px-2 py-1.5 gap-2"
          )}
        >
          <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
           
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-xl border bg-background shadow-lg p-1"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">{userName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/configuracion" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/apariencia" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apariencia
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
