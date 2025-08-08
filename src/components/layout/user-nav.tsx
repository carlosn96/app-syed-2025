
"use client"

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
import { useRouter } from "next/navigation"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"

export function UserNav() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  if (!user) {
    return null;
  }
  
  const userName = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`.trim();
  const nameInitial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors duration-200 hover:bg-sidebar-accent",
            state === 'collapsed' && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${nameInitial}`} alt={userName} data-ai-hint="person avatar" />
            <AvatarFallback>{nameInitial}</AvatarFallback>
          </Avatar>
           <div
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-200",
              state === 'collapsed' ? "w-0" : "w-auto"
            )}
          >
            <p className="truncate text-sm font-medium leading-none capitalize text-sidebar-foreground">{userName}</p>
            <p className="truncate text-xs leading-none text-muted-foreground">
              {user.rol}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none capitalize">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.correo}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Perfil
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Configuración
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar Sesión
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
