
"use client"

import { Plus } from "lucide-react"
import { ButtonHTMLAttributes } from "react";

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export function FloatingButton({ text, ...props }: FloatingButtonProps) {
  return (
    <div 
      className="group fixed bottom-8 right-8 z-50 cursor-pointer"
    >
      <button 
        {...props}
        className="flex items-center justify-center bg-[var(--floating-button-bg)] rounded-full h-14 pl-4 pr-4 md:pr-4 group-hover:pr-6 shadow-md border border-slate-200 w-auto transition-all duration-300 ease-in-out hover:shadow-lg"
      >
        <Plus className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-90" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-md font-semibold pl-2">
            {text}
          </span>
        </div>
      </button>
    </div>
  )
}
