
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
  SidebarBody,
  SidebarTrigger,
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
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </div>
        </main>
    )
}

function SidebarLayout() {
  return (
    <Sidebar>
        <SidebarBody>
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
                <div className="flex-1 overflow-y-auto">
                    <MainNav />
                </div>
            </SidebarContent>
            <SidebarFooter>
                <UserNav />
            </SidebarFooter>
        </SidebarBody>
    </Sidebar>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen login-background">
      <PageNavigationProvider>
        <SidebarProvider>
            <SidebarLayout />
            <AppMain>{children}</AppMain>
            <SidebarTrigger />
        </SidebarProvider>
      </PageNavigationProvider>
    </div>
  );
}
