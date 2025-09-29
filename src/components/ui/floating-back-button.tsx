
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

export function FloatingBackButton() {
  const router = useRouter();

  return (
    <div 
      className="group fixed bottom-8 right-8 z-50 cursor-pointer"
      onClick={() => router.back()}
    >
      <button 
        className="flex items-center justify-center bg-[#112172] rounded-full h-14 pl-4 pr-4 md:pr-4 group-hover:pr-6 shadow-lg w-auto transition-all duration-300 ease-in-out"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6 text-white transition-transform duration-300" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-md font-semibold pl-2">
            Regresar
          </span>
        </div>
      </button>
    </div>
  )
}

    