
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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { state, isMobile } = useSidebar();
    const { toggleSidebar } = useSidebar();

    return (
        <>
            <Sidebar className="fixed inset-y-0 left-0 z-20">
                <SidebarHeader>
                    <div onClick={toggleSidebar} className="cursor-pointer">
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
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
