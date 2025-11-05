
"use client"

import React from "react";
import Image from "next/image";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { PageNavigationProvider } from "@/context/page-navigation-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

{/*function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { state, isMobile, toggleSidebar } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <>
            <Sidebar className="fixed inset-y-0 left-0 z-20">
                <SidebarHeader>
                    <div className="flex items-center justify-between w-full">
                        <div onClick={toggleSidebar} className={cn("cursor-pointer flex-grow flex items-center justify-center transition-all duration-300", isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
                            <Image
                                src="/UNELOGO.png"
                                alt="UNE Logo"
                                width={112}
                                height={40}
                                className={"w-28 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"}
                            />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-white/80 hover:text-white"
                          onClick={toggleSidebar}
                          aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                          aria-pressed={isCollapsed}
                        >
                            {isCollapsed ? <PanelRight /> : <PanelLeft />}
                        </Button>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <MainNav />
                </SidebarContent>
                <SidebarFooter className={cn("transition-all duration-300", isCollapsed ? "items-center" : "items-center")}>
                   <div className={cn("w-full transition-all duration-300", isCollapsed ? "flex justify-center" : "flex justify-center")}>
                       <UserNav />
                   </div>
                </SidebarFooter>
            </Sidebar>

            <main
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    !isMobile && (state === 'expanded' ? "pl-[280px]" : "pl-[80px]")
                )}
            >
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            <SidebarTrigger />
        </>
    );
}*/}

//Modificaciones del Sidebar
const NeonLogo: React.FC<{ size?: number; glow?: "white" | "violet" | "cyan"; className?: string }> = ({ size = 24, glow = "white",className }) => {
    const colorMap = {
        white: "rgba(255,255,255,0.85)",
        violet: "rgba(168,85,247,0.85)",
        cyan: "rgba(34,211,238,0.85)",
    } as const;
    
    const shadowMap = {
        white: "0 0 12px rgba(255,255,255,0.95)",
        violet: "0 0 12px rgba(168,85,247,0.95)",
        cyan: "0 0 12px rgba(34,211,238,0.95)",
    } as const;
    
    const glowColor = colorMap[glow];
    const glowShadow = shadowMap[glow];
    
    return (
      <div className={cn("relative grid place-items-center", className)}>
        {/* Glow radial detrás */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-md opacity-90 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${glowColor} 0%, transparent 60%)`, 
          }}
        />
        {/* Logo con drop-shadow (neón) */}
        <Image
          src="/UNELOGO.png"
          alt="UNE Logo"
          width={size}
          height={size}
          className="relative w-6 h-6"
          style={{ filter: `brightness(1.08) drop-shadow(${glowShadow})` }}
          priority
        />
      </div>
    );
  };




function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { state, isMobile, toggleSidebar } = useSidebar();
    const isCollapsed = state === "collapsed";
  
    return (
      <>
        <Sidebar className="fixed inset-y-0 left-0 z-20 flex flex-col overflow-x-hidden">
          <SidebarHeader className="px-3">
            {/* LOGO = TOGGLE (desktop y móvil) */}
            <button
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
              aria-pressed={!isCollapsed}
              className="flex w-full items-center justify-between"
            >
              <div
                className={cn(
                  "transition-all duration-300 mx-auto",
                  isCollapsed ? "w-10 opacity-100" : "w-28 opacity-100"
                )}
              >
                <Image
                  src="/UNELOGO.png"
                  alt="UNE Logo"
                  width={112}
                  height={40}
                  className={cn(
                    "drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]",
                    isCollapsed ? "w-10" : "w-28"
                  )}
                  priority
                />
              </div>
            </button>
          </SidebarHeader>
  
          {/* Que el contenido haga scroll y no empuje el footer */}
          <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain
                                    [-ms-overflow-style:none][scrollbar-width:none][&::-webkit-scrollbar]:hidden">
            <MainNav />
          </SidebarContent>
  
          {/* Footer SIEMPRE visible (logout / UserNav) */}
          <SidebarFooter
            className={cn(
              "shrink-0 sticky bottom-0 z-10 px-3 py-3",
              "bg-background/60 backdrop-blur",
              "transition-all duration-300"
            )}
          >
            <div
              className={cn("w-full", "flex justify-center")}
            >
              <UserNav />
            </div>
          </SidebarFooter>
        </Sidebar>
  
        {/* Main: sin padding lateral en móvil (overlay), con padding en desktop */}
        <main
          className={cn(
            "transition-all duration-300 ease-in-out",
            !isMobile && (state === "expanded" ? "pl-[280px]" : "pl-[80px]")
          )}
        >
          <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
  
        {/* Trigger flotante:
           - NO se muestra cuando está colapsado (para eliminar el ícono “abrir”)
           - SÍ se muestra en móvil cuando está expandido (sirve de X) */}
        {/* MÓVIL EXPANDIDO: “X” para CERRAR el menú */}
        {isMobile && !isCollapsed && (
            <button
                onClick={toggleSidebar}
                aria-label="Cerrar menú"
                className="fixed right-3 top-3 z-30 h-10 w-10 rounded-full bg-sidebar/90 text-sidebar-foreground backdrop-blur-sm shadow-xl ring-1 ring-white/30 grid place-items-center"
            >
                    <NeonLogo glow="white"
                    />
            </button>
        )}
        </>
    );
}
//Terminan las Modificaciones


const LoadingSpinner = () => (
    <div className="flex h-screen w-full items-center justify-center login-background">
        <div className="animate-pulse flex h-16 w-16 items-center justify-center rounded-full bg-primary/50">
            <div className="h-8 w-8 rounded-full bg-primary/80"></div>
        </div>
    </div>
);


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen login-background">
      <PageNavigationProvider>
        <SidebarProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </SidebarProvider>
      </PageNavigationProvider>
    </div>
  );
}
