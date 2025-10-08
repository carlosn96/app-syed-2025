
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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { state, isMobile, toggleSidebar } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <>
            <Sidebar className="fixed inset-y-0 left-0 z-20">
                <SidebarHeader>
                    <div className="flex items-center justify-between w-full">
                        <div onClick={toggleSidebar} className="cursor-pointer flex-grow flex items-center justify-center">
                            <Image
                                src="/UNELOGO.png"
                                alt="UNE Logo"
                                width={112}
                                height={40}
                                className={cn("w-28 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-opacity duration-300", isCollapsed && "opacity-0 w-0")}
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
