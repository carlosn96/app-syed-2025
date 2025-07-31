
import React from "react";
import Image from "next/image";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="login-background min-h-screen">
      <SidebarProvider>
        <Sidebar side="left" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              <Image 
                src="/UNELOGO.png" 
                alt="UNE Logo" 
                width={112} 
                height={40} 
                className="w-28 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              />
            </div>
             <div className="md:hidden">
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
              <UserNav />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-white/15 to-[#e11b1a]/15 relative">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

    