
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
} from "@/components/ui/sidebar";
import { PageNavigationProvider } from "@/context/page-navigation-context";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen login-background">
      <PageNavigationProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Image
                src="/UNELOGO.png"
                alt="UNE Logo"
                width={112}
                height={40}
                className="w-28 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              />
            </SidebarHeader>
            <SidebarContent>
                <MainNav />
            </SidebarContent>
            <SidebarFooter>
                <UserNav />
            </SidebarFooter>
          </Sidebar>

          <main>
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </div>
          </main>
          
          <SidebarTrigger />
        </SidebarProvider>
      </PageNavigationProvider>
    </div>
  );
}
