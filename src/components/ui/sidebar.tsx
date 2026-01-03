"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, X } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(defaultOpen)
    const [openMobile, setOpenMobile] = React.useState(false)

    // Inicializar estado desde localStorage
    React.useEffect(() => {
      if (typeof window === 'undefined') return
      
      try {
        const storedState = localStorage.getItem("ui.sidebarCollapsed")
        if (storedState) {
          setOpen(storedState === "expanded")
        } else if (window.innerWidth <= 1024) {
          setOpen(false)
        }
      } catch (error) {
        console.error("Error reading sidebar state from localStorage:", error)
      }
    }, [])

    // Manejador de toggle del sidebar
    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev)
      } else {
        setOpen((currentOpen) => {
          const newState = !currentOpen
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem("ui.sidebarCollapsed", newState ? "expanded" : "collapsed")
            }
          } catch (error) {
            console.error("Error saving sidebar state to localStorage:", error)
          }
          return newState
        })
      }
    }, [isMobile])

    // Atajo de teclado para toggle
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, isMobile, openMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            data-layout="sidebar"
            data-state={state}
            className={cn("min-h-screen", className)}
            style={style}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      "data-testid": dataTestId,
      "aria-label": ariaLabel = "Sidebar",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar()
    
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side="left"
            className={cn(
              "w-[280px] p-0",
              "bg-sidebar text-sidebar-foreground",
              "border-r border-sidebar-border"
            )}
            aria-label={ariaLabel}
          >
            {children}
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        data-state={state}
        aria-label={ariaLabel}
        className={cn(
          "peer z-10 hidden md:flex flex-col",
          "bg-sidebar text-sidebar-foreground",
          "border-r border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          "h-screen sticky top-0",
          state === "expanded" ? "w-[280px]" : "w-[80px]",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile, state } = useSidebar()

  if (isMobile) {
    return null
  }

  return (
    <Button
      ref={ref}
      size="icon"
      variant="ghost"
      className={cn(
        "absolute -right-3 top-20 z-50",
        "h-8 w-8 rounded-full",
        "bg-sidebar-accent text-sidebar-accent-foreground",
        "border-2 border-sidebar-border",
        "shadow-md hover:shadow-lg hover:scale-110",
        "transition-all duration-300",
        "opacity-0 peer-hover:opacity-100 hover:opacity-100",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      aria-label={state === "expanded" ? "Colapsar menú" : "Expandir menú"}
      {...props}
    >
      <PanelLeft 
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          state === "collapsed" && "rotate-180"
        )} 
      />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const MobileSidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()
  const [isHovered, setIsHovered] = React.useState(false)
  
  if (!isMobile) {
    return null
  }

  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Abrir menú"
      className={cn(
        "group fixed top-4 right-4 z-50",
        "h-14 w-14 rounded-2xl",
        "bg-gradient-to-br from-primary to-primary/80",
        "shadow-lg hover:shadow-2xl",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "flex items-center justify-center",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Efecto de brillo animado */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "transition-transform duration-1000",
          isHovered ? "translate-x-full" : "-translate-x-full"
        )}
      />
      
      {/* Iconos de hamburguesa animados */}
      <div className="relative flex flex-col gap-1.5 w-5">
        <span 
          className={cn(
            "h-0.5 w-full bg-primary-foreground rounded-full",
            "transition-all duration-300 origin-center",
            "group-hover:w-full"
          )}
        />
        <span 
          className={cn(
            "h-0.5 w-4/5 bg-primary-foreground rounded-full",
            "transition-all duration-300 origin-center",
            "group-hover:w-full"
          )}
        />
        <span 
          className={cn(
            "h-0.5 w-3/5 bg-primary-foreground rounded-full",
            "transition-all duration-300 origin-center",
            "group-hover:w-full"
          )}
        />
      </div>

      {/* Partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 right-1 w-1 h-1 bg-primary-foreground/40 rounded-full animate-pulse" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-primary-foreground/30 rounded-full animate-pulse delay-75" />
      </div>
    </button>
  )
})
MobileSidebarTrigger.displayName = "MobileSidebarTrigger"

const MobileSidebarCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()
  
  if (!isMobile) {
    return null
  }

  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      aria-label="Cerrar menú"
      className={cn(
        "group absolute left-3 top-3 z-30",
        "h-10 w-10 rounded-xl",
        "bg-sidebar-accent/80 backdrop-blur-sm text-sidebar-accent-foreground",
        "border border-sidebar-border",
        "shadow-md hover:shadow-lg",
        "transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "flex items-center justify-center",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
      
      {/* Efecto de fondo en hover */}
      <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  )
})
MobileSidebarCloseButton.displayName = "MobileSidebarCloseButton"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex items-center",
        "h-16 sm:h-20",
        "border-b border-sidebar-border",
        "transition-all duration-300",
        state === "expanded" 
          ? "justify-start px-6" 
          : "justify-center px-4",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex flex-col items-center",
        "border-t border-sidebar-border",
        "mt-auto",
        "transition-all duration-300",
        state === "expanded" ? "p-4" : "p-2",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn(
        "mx-2 my-1 w-auto",
        "bg-sidebar-border",
        className
      )}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn(
        "flex w-full flex-col gap-1",
        "transition-all duration-300",
        state === "expanded" ? "px-3 py-2" : "px-2 py-2",
        className
      )}
      {...props}
    />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-3 rounded-lg text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm",
      },
      size: {
        default: "h-10 text-sm px-3",
        sm: "h-9 text-xs px-2",
        lg: "h-12 text-base px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    // Solo mostrar tooltip en modo colapsado y desktop
    const shouldShowTooltip = state === "collapsed" && !isMobile

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={8}
          className={cn(
            "bg-popover text-popover-foreground",
            "border border-border",
            "shadow-md",
            !shouldShowTooltip && "hidden"
          )}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  MobileSidebarTrigger,
  MobileSidebarCloseButton,
}