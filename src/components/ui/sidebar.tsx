
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, PanelRight, X } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

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

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((open) => !open)
      } else {
        setOpen((open) => !open)
      }
    }, [isMobile, setOpen])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === "b" &&
          (event.metaKey || event.ctrlKey)
        ) {
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
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            data-layout="sidebar"
            data-state={state}
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              !isMobile && (open ? "grid-cols-[280px_1fr]" : "grid-cols-[80px_1fr]"),
              className
            )}
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
  const { isMobile, state } = useSidebar()
  return (
    <div
      ref={ref}
      data-sidebar="content"
      data-state={state}
      className={cn(
        "transition-opacity duration-300",
        state === "collapsed" && "opacity-0",
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
    const isCollapsed = state === 'collapsed';

    const renderContent = () => (
      <>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && (child.type as React.FC).displayName === 'SidebarHeader' && isCollapsed) {
            return React.cloneElement(child, {
              className: cn(child.props.className, 'flex items-center justify-center'),
            } as React.HTMLAttributes<HTMLDivElement>);
          }
          if (React.isValidElement(child) && (child.type as React.FC).displayName === 'SidebarContent' && isCollapsed) {
            return <div className="hidden" />;
          }
           if (React.isValidElement(child) && (child.type as React.FC).displayName === 'SidebarFooter' && isCollapsed) {
            return (
              <div className="flex items-center justify-center p-4">{child}</div>
            );
          }
          return child;
        })}
      </>
    );

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            side="left"
            className="w-[280px] p-0 text-sidebar-foreground sidebar-glass"
          >
            {children}
          </SheetContent>
        </Sheet>
      )
    }

    return (
       <div
        ref={ref}
        data-sidebar="sidebar"
        data-state={state}
        className={cn(
          "peer z-10 hidden md:flex flex-col text-sidebar-foreground sidebar-glass",
          className
        )}
        {...props}
      >
        {renderContent()}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  if (!isMobile) {
    return null
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "fixed top-4 left-4 z-50 h-12 w-12 rounded-full bg-black/30 text-white backdrop-blur-sm",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      aria-label="Abrir menú"
      {...props}
    >
      <PanelLeft className="size-5" />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isMobile, state } = useSidebar()
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex h-24 items-center p-4", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="footer"
            className={cn("flex flex-col p-4", className)}
            {...props}
        />
    )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full flex-col gap-2 p-4", className)}
    {...props}
  />
))
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
  "peer/menu-button flex w-full items-center rounded-md p-3 text-left outline-none ring-sidebar-ring transition-all duration-300 focus-visible:ring-2 active:opacity-80 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground",
      },
      size: {
        default: "h-11 text-sm",
        sm: "h-9 text-xs",
        lg: "h-12 text-base",
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
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={12}
          className="bg-background/80 backdrop-blur-sm border-border"
          hidden={state !== "collapsed" || isMobile}
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
}
