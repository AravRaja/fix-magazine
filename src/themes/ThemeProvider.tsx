'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { palettes, defaultPalette, getPaletteByName, type Palette } from './palettes'

interface ThemeContextValue {
  palette: Palette
  setPaletteName: (name: string) => void
  palettes: Palette[]
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: defaultPalette,
  setPaletteName: () => {},
  palettes,
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyPalette(palette: Palette) {
  const root = document.documentElement
  root.setAttribute('data-palette', palette.name.toLowerCase())
  const tokens: Record<string, string> = {
    '--bg': palette.bg,
    '--surface': palette.surface,
    '--surface-alt': palette.surfaceAlt,
    '--border': palette.border,
    '--text-primary': palette.textPrimary,
    '--text-secondary': palette.textSecondary,
    '--text-muted': palette.textMuted,
    '--accent': palette.accent,
    '--accent-hover': palette.accentHover,
    '--accent-alt': palette.accentAlt,
    '--highlight': palette.highlight,
    '--overlay': palette.overlay,
    '--warm': palette.warm,
    '--cool': palette.cool,
    '--paper': palette.paper,
    '--special': palette.special,
  }
  for (const [k, v] of Object.entries(tokens)) {
    root.style.setProperty(k, v)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Palette>(defaultPalette)

  useEffect(() => {
    const saved = localStorage.getItem('fix-palette')
    const initial = saved ? getPaletteByName(saved) : defaultPalette
    setPalette(initial)
    applyPalette(initial)
  }, [])

  function setPaletteName(name: string) {
    const p = getPaletteByName(name)
    setPalette(p)
    applyPalette(p)
    localStorage.setItem('fix-palette', p.name)
  }

  return (
    <ThemeContext.Provider value={{ palette, setPaletteName, palettes }}>
      {children}
    </ThemeContext.Provider>
  )
}
