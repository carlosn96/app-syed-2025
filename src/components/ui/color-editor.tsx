"use client"

import React, { useState } from 'react'
import { ColorConfig, ColorPalette } from '@/components/ui/color-config'

type PaletteShape = typeof ColorConfig.light

const defaultConfig = ColorConfig

function isObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

function renderColorPreview(value: any) {
  const bg = String(value)
  return (
    <div className="w-12 h-8 rounded-md border" style={{ background: bg }} />
  )
}

export default function ColorEditor({
  initial = defaultConfig,
}: {
  initial?: { light: ColorPalette; dark: ColorPalette }
}) {
  const [config, setConfig] = useState(() => ({ ...initial }))

  const updateToken = (mode: 'light' | 'dark', keyPath: string[], value: any) => {
    setConfig((prev) => {
      const copy: any = { ...prev }
      let target = copy[mode]
      for (let i = 0; i < keyPath.length - 1; i++) {
        const k = keyPath[i]
        target[k] = { ...(target[k] ?? {}) }
        target = target[k]
      }
      target[keyPath[keyPath.length - 1]] = value
      return copy
    })
  }

  const downloadJSON = () => {
    const data = JSON.stringify(config, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colors-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetDefaults = () => setConfig({ ...defaultConfig })

  // Define groups and the keys (key paths) they expose. Only tokens related to that component.
  const groups: Record<string, Array<string | string[]>> = {
    'Fondo / General': ['background', 'foreground', 'border', 'input', 'ring'],
    'Cards / Popovers': ['card', 'cardForeground', 'popover', 'popoverForeground'],
    'Botones / Acciones': [
      ['primary', 'DEFAULT'],
      ['primary', 'foreground'],
      ['secondary', 'DEFAULT'],
      ['secondary', 'foreground'],
      'info',
      'infoForeground',
      'success',
      ['muted', 'DEFAULT'],
      ['muted', 'foreground'],
      ['accent', 'DEFAULT'],
      ['accent', 'foreground'],
      'warning',
      'warningForeground',
      ['destructive', 'DEFAULT'],
      ['destructive', 'foreground'],
    ],
    'Toasts / Notificaciones': [
      'toastDestructiveWave',
      'toastDestructiveIconBg',
      'toastDestructiveIcon',
      'toastSuccessWave',
      'toastSuccessIconBg',
      'toastSuccessIcon',
    ],
    'Sidebar': [
      'sidebarBackground',
      'sidebarForeground',
      'sidebarPrimary',
      'sidebarPrimaryForeground',
      'sidebarAccent',
      'sidebarAccentForeground',
      'sidebarBorder',
      'sidebarRing',
    ],
    'Gráficas': [['chart', '1'], ['chart', '2'], ['chart', '3'], ['chart', '4'], ['chart', '5']],
    'Componentes': [
      'floatingButtonBg',
      'sidebarCircleBg',
      'loginButtonBg',
      'loginButtonHover',
      'loginBgGradientStart',
      'loginBgGradientEnd',
      'glassCardBg',
      'glassCardBorder',
    ],
  }

  const renderField = (mode: 'light' | 'dark', keyPath: string[] | string) => {
    const path = Array.isArray(keyPath) ? keyPath : [keyPath]
    const value = path.reduce((acc: any, k: string) => (acc && acc[k] !== undefined ? acc[k] : undefined), config[mode] as any)

    const displayValue = value ?? ''

    return (
      <div className="flex items-center justify-between space-x-4" key={path.join('.')}>
        <div className="flex items-center space-x-3">
          {renderColorPreview(displayValue)}
          <div>
            <div className="text-sm font-medium">{path.join(' › ')}</div>
            <div className="text-xs text-muted-foreground break-words">{String(displayValue)}</div>
          </div>
        </div>
        <div className="w-48">
          <input
            className="w-full rounded-md border px-2 py-1 text-sm bg-white/5"
            value={String(displayValue)}
            onChange={(e) => updateToken(mode, path, e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Editor de colores (estático)</h3>
          <p className="text-sm text-muted-foreground">Modifica tokens agrupados por componente. Los cambios son locales y pueden descargarse como JSON.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn" onClick={downloadJSON}>Descargar JSON</button>
          <button className="btn" onClick={resetDefaults}>Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groups).map(([groupName, keys]) => (
          <div key={groupName} className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">{groupName}</h4>
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground mb-2">Light</div>
              <div className="space-y-2">
                {keys.map((k) => renderField('light', Array.isArray(k) ? k : k))}
              </div>
              <div className="h-4" />
              <div className="text-xs text-muted-foreground mb-2">Dark</div>
              <div className="space-y-2">
                {keys.map((k) => renderField('dark', Array.isArray(k) ? k : k))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
