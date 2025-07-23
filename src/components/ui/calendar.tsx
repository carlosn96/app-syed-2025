
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayProps } from "react-day-picker"
import { es } from 'date-fns/locale';

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  
  return (
    <>
    <style>{`
      .rdp-day_event-prox { 
        position: relative;
      }
      .rdp-day_event-prox::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: hsl(var(--destructive) / 0.8);
        z-index: 0;
      }
      .rdp-day_event-comp { 
        position: relative;
      }
      .rdp-day_event-comp::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: hsl(var(--chart-4));
        z-index: 0;
      }
      .rdp-day_event-prog { 
        position: relative;
      }
      .rdp-day_event-prog::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: hsl(var(--chart-5));
        z-index: 0;
      }
      .rdp-day_selected::before {
        display: none;
      }
      .rdp-button {
         position: relative;
         z-index: 1;
      }
    `}</style>
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 h-full flex flex-col w-full", className)}
      classNames={{
        months: "flex flex-col flex-grow",
        month: "space-y-4 flex flex-col flex-grow",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 flex-grow flex flex-col",
        tbody: "flex-grow flex flex-col justify-between",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2 flex-grow",
        cell: "w-full h-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
        day_today: "bg-accent text-accent-foreground rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
    </>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
