
"use client"

import React from "react";
import Image from "next/image";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { PageNavigationProvider } from "@/context/page-navigation-context";
import { cn } from "@/lib/utils";


function AppMain({ children }: { children: React.ReactNode }) {
    const { state, isMobile, isTablet } = useSidebar();
    const isCollapsed = state === 'collapsed' || isTablet;

    return (
        <main
            className={cn(
                "transition-all duration-300 ease-in-out",
                 !isMobile && (isCollapsed ? "pl-[80px]" : "pl-[280px]")
            )}
        >
            <div className="w-full p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </main>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen login-background">
      <PageNavigationProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-center w-full p-4">
                <Image
                  src="/UNELOGO.png"
                  alt="UNE Logo"
                  width={112}
                  height={40}
                  className="w-28 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
            <SidebarFooter>
              <UserNav />
            </SidebarFooter>
          </Sidebar>
          <AppMain>{children}</AppMain>
        </SidebarProvider>
      </PageNavigationProvider>
    </div>
  );
}
