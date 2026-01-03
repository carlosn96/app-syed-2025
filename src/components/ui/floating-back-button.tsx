
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'
import { Button } from "./button";

export function FloatingBackButton() {
  const router = useRouter();

  return (
    <div 
      className="group fixed bottom-8 right-8 z-50 cursor-pointer"
      onClick={() => router.back()}
    >
      <Button 
        variant="default"
        className="rounded-full h-14 pl-4 pr-4 md:pl-4 group-hover:pl-6 shadow-md border border-slate-200 w-auto transition-all duration-300 ease-in-out flex-row-reverse hover:shadow-lg"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6 text-white transition-transform duration-300" />
        <div className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
          <span className="whitespace-nowrap text-white text-md font-semibold pr-2">
            Regresar
          </span>
        </div>
      </Button>
    </div>
  )
}
