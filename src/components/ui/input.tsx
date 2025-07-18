import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  useAnimatedBorder?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, useAnimatedBorder = false, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // If animated border is used, we remove the default focus ring to avoid visual clutter.
          useAnimatedBorder && "focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (useAnimatedBorder) {
      return (
        <div className="relative">
          <div className="animated-border-input absolute inset-0 rounded-md border border-input bg-transparent transition-shadow duration-300"/>
          <div className="relative">
            {inputElement}
          </div>
        </div>
      );
    }

    return inputElement;
  }
)
Input.displayName = "Input"

export { Input }
