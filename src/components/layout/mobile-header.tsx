
"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePageNavigation } from "@/context/page-navigation-context";
import { usePathname } from "next/navigation";
import { allLinks } from "./main-nav";
import { cn } from "@/lib/utils";

export function MobileHeader() {
    const { isMobile } = useSidebar();
    const pathname = usePathname();
    
    const { title } = usePageNavigation();

    const getPageTitle = () => {
        if(title) return title;
        const currentLink = allLinks.find(link => pathname.startsWith(link.href) && link.href !== '/dashboard');
        return currentLink ? currentLink.label : 'Panel de Control';
    }
    
    if (!isMobile) return null;

    return (
        <header className={cn(
            "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4",
            "md:hidden"
        )}>
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
        </header>
    )
}
