
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
} from "@/components/ui/sidebar";
import { PageNavigationProvider } from "@/context/page-navigation-context";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="login-background min-h-screen">
      <PageNavigationProvider>
        <SidebarProvider>
          <Sidebar side="left" collapsible="icon">
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
          <main className="flex-1 flex flex-col">
            <MobileHeader />
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-white/15 to-[#e11b1a]/15 relative">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </PageNavigationProvider>
    </div>
  );
}
