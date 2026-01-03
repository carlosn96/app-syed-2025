import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "font-display text-3xl font-bold tracking-tight text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
)
PageTitle.displayName = "PageTitle"

export { PageTitle }
