
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
import { MobileHeader } from "@/components/layout/mobile-header";
import { cn } from "@/lib/utils";


function AppMain({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    return (
        <main
            className={cn(
                "transition-[margin-left] duration-200",
                "lg:ml-[var(--sidebar-width)]",
                 "md:data-[state=expanded]:ml-[var(--sidebar-width)]",
                 "md:data-[state=collapsed]:ml-[var(--sidebar-width-icon)]"
            )}
            data-state={state}
            >
            <MobileHeader />
             <div className="w-full p-4 md:p-6 xl:p-8">
                {children}
            </div>
        </main>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="login-background min-h-screen">
      <PageNavigationProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader className="p-4 hidden md:flex items-center justify-between">
              <div className="flex items-center justify-center w-full">
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
