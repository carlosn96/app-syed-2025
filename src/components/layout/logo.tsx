"use client"

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "expanded" | "collapsed" | "full";
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({
  variant = "expanded",
  className,
  width = 112,
  height = 40,
  priority = true,
}: LogoProps) {
  const sizeClasses = {
    expanded: "w-28",
    collapsed: "w-10",
    full: "w-40",
  };

  return (
    <Image
      src="/une-blanco.webp"
      alt="UNE Logo"
      width={width}
      height={height}
      className={cn(sizeClasses[variant], className)}
      priority={priority}
    />
  );
}
