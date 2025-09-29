
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

export function FloatingBackButton() {
  const router = useRouter();

  return (
    <div 
      className="group fixed bottom-8 left-8 z-50 cursor-pointer"
      onClick={() => router.back()}
    >
      <button 
        className="flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full h-14 w-14 shadow-lg transition-all duration-300 ease-in-out hover:bg-black/50 hover:scale-110"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </button>
    </div>
  )
}

    