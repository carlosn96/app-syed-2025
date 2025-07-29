
"use client"

import { Plus } from "lucide-react"

interface FloatingButtonProps {
  text: string;
  onClick?: () => void;
}

export function FloatingButton({ text, onClick }: FloatingButtonProps) {
  return (
    <div 
      className="fixed top-20 right-8 z-50"
      onClick={onClick}
    >
      <button className="group floating-button-container flex items-center justify-center bg-[#202d5d] rounded-full h-14 w-14 shadow-lg hover:w-48 transition-all duration-300 ease-in-out cursor-pointer">
        <Plus className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-45" />
        <span className="floating-button-text text-white text-sm font-semibold whitespace-nowrap overflow-hidden">
          {text}
        </span>
      </button>
    </div>
  )
}
