
"use client"

import React from "react";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { Logo } from "@/components/layout/logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  MobileSidebarTrigger,
  MobileSidebarCloseButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PageNavigationProvider } from "@/context/page-navigation-context";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile, toggleSidebar, openMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar className="fixed inset-y-0 left-0 z-20 flex flex-col overflow-hidden">
        <SidebarHeader>
          <div
            className={cn(
              "flex w-full",
              isCollapsed ? "justify-center" : "justify-start px-6"
            )}
          >
            <div className={cn(isCollapsed ? "w-10 flex justify-center" : "")}>
              <button
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="flex items-center"
              >
                <Logo variant={isCollapsed ? "collapsed" : "expanded"} />
              </button>
            </div>
          </div>
        </SidebarHeader>

        {/* Contenido scrolleable con los elementos del menú */}
        <SidebarContent className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <MainNav />
        </SidebarContent>

        <SidebarFooter>
          <div
            className={cn(
              "flex w-full",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <div className={cn(isCollapsed ? "w-10 flex justify-center" : "w-full")}>
              <UserNav />
            </div>
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

      {isMobile && !openMobile && (
        <MobileSidebarTrigger />
      )}

      {isMobile && openMobile && (
        <MobileSidebarCloseButton />
      )}
    </>
  );
}

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
    <div className="min-h-screen atmospheric-background">
      <PageNavigationProvider>
        <SidebarProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </SidebarProvider>
      </PageNavigationProvider>
      <Toaster />
    </div>
  );
}
