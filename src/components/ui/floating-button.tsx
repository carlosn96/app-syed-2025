
"use client"

import { Plus } from "lucide-react"

interface FloatingButtonProps {
  text: string;
  onClick?: () => void;
}

export function FloatingButton({ text, onClick }: FloatingButtonProps) {
  return (
    <div 
      className="group fixed top-20 right-8 z-50"
      onClick={onClick}
    >
      <button className="flex items-center justify-center bg-[#202d5d] rounded-full h-14 pl-4 pr-4 md:pr-4 hover:pr-6 shadow-lg w-auto transition-all duration-300 ease-in-out cursor-pointer">
        <Plus className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-45" />
        <span className="max-w-0 group-hover:max-w-full overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-white text-sm font-semibold group-hover:pl-2">
          {text}
        </span>
      </button>
    </div>
  )
}
