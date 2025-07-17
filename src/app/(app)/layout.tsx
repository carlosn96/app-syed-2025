import React from "react";
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
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-10 w-10 text-primary-foreground bg-primary/20 hover:bg-primary/30 rounded-full">
              <GraduationCap className="h-6 w-6" />
            </Button>
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Gestion Educativa
              </h2>
            </div>
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
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="hidden md:block">
            {/* Can add breadcrumbs here */}
          </div>
          <div className="ml-auto">
             <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
