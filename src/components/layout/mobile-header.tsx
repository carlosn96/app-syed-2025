
"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MobileHeader() {
    const { isMobile } = useSidebar();
    
    if (!isMobile) return null;

    return (
        <header className={cn(
            "sticky top-0 z-40",
            "md:hidden"
        )}>
            <SidebarTrigger />
        </header>
    )
}
