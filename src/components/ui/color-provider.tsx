"use client"

import React, { useEffect } from 'react'
import { ColorConfig } from '@/components/ui/color-config'

type Theme = 'light' | 'dark'

function camelToKebab(s: string) {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function normalizeValue(v: unknown) {
  if (typeof v !== 'string') return String(v)
  const s = v.trim()
  if (s.startsWith('hsl(')) {
    // remove hsl(...) wrapper and commas
    let inner = s.slice(4, -1).trim()
    inner = inner.replace(/,/g, ' ')
    return inner
  }
  return s
}

function applyPalette(palette: Record<string, any>, prefix = '') {
  Object.entries(palette).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      applyPalette(v as Record<string, any>, `${prefix}${k}-`)
      return
    }
    const cssName = `--${prefix}${camelToKebab(k)}`
    const value = normalizeValue(v)
    try {
      document.documentElement.style.setProperty(cssName, value)
    } catch (e) {
      // ignore
    }
  })
}

export default function ColorProvider({
  theme = 'light',
  config = ColorConfig,
  children,
}: {
  theme?: Theme
  config?: typeof ColorConfig
  children?: React.ReactNode
}) {
  useEffect(() => {
    const palette = config?.[theme]
    if (!palette) return
    applyPalette(palette)
  }, [theme, config])

  return <>{children}</>
}

export { applyPalette }
