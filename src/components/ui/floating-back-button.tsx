
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface FloatingBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function FloatingBackButton({ ...props }: FloatingBackButtonProps) {
  const router = useRouter()

  return (
    <div 
      className="group fixed top-20 left-8 z-50 cursor-pointer"
      onClick={() => router.back()}
    >
      <button 
        {...props}
        className="flex items-center justify-center bg-[#112172] rounded-full h-12 shadow-lg transition-all duration-300 ease-in-out w-12 group-hover:w-36"
      >
        <ArrowLeft className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-sm font-semibold pl-2">
            Regresar
          </span>
        </div>
      </button>
    </div>
  )
}
