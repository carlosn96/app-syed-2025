
"use client"

import { Plus } from "lucide-react"

interface FloatingButtonProps {
  text: string;
  onClick?: () => void;
}

export function FloatingButton({ text, onClick }: FloatingButtonProps) {
  return (
    <div 
      className="group fixed top-20 right-8 z-50 cursor-pointer"
      onClick={onClick}
    >
      <button className="flex items-center justify-center bg-[#112172] rounded-full h-14 pl-4 pr-4 md:pr-4 group-hover:pr-6 shadow-lg w-auto transition-all duration-300 ease-in-out">
        <Plus className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-90" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-sm font-semibold pl-2">
            {text}
          </span>
        </div>
      </button>
    </div>
  )
}
