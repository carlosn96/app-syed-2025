
"use client"

import { Plus } from "lucide-react"
import { ButtonHTMLAttributes } from "react";

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export function FloatingButton({ text, ...props }: FloatingButtonProps) {
  return (
    <div 
      className="group fixed top-20 right-8 z-50 cursor-pointer"
    >
      <button 
        {...props}
        className="flex items-center justify-center bg-[#112172] rounded-full h-12 pl-3 pr-3 md:pr-3 group-hover:pr-4 shadow-lg w-auto transition-all duration-300 ease-in-out"
      >
        <Plus className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-sm font-semibold pl-2">
            {text}
          </span>
        </div>
      </button>
    </div>
  )
}
