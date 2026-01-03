"use client"

import React from 'react'
import ColorEditor from '@/components/ui/color-editor'
import { ColorConfig } from '@/components/ui/color-config'

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configuración de colores (estática)</h1>
      <p className="mb-6 text-sm text-muted-foreground">Agrupado por componente: fondo, botones, toasts, cards, acciones, sidebar y gráficas. Modifica tokens (estático) y descarga JSON si lo deseas.</p>

      <ColorEditor initial={ColorConfig} />
    </div>
  )
}
