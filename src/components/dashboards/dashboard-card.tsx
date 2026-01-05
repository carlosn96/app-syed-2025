
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: boolean;
}

export function DashboardCard({ title, value, icon: Icon, description, href, trend, gradient = false }: DashboardCardProps) {
  const cardContent = (
    <Card className={cn(
      "rounded-xl relative overflow-hidden transition-all duration-300",
      href && "cursor-pointer hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1",
      gradient && "bg-gradient-to-br from-primary/10 via-background to-background border-primary/30"
    )}>
      {/* Efecto de brillo sutil en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          gradient ? "bg-primary/20" : "bg-muted",
          href && "group-hover:scale-110"
        )}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
            )}>
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="group block">{cardContent}</Link>;
  }

  return <div className="group">{cardContent}</div>;
}

export function CardSkeleton() {
    return (
        <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4 rounded-sm" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </CardContent>
        </Card>
    )
}
