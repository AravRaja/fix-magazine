export interface Palette {
  name: string

  // === CORE (always in use) ===
  bg: string           // Main page background
  surface: string      // Card / panel background
  surfaceAlt: string   // Elevated surface (nav, dropdowns)
  border: string       // Dividers, card outlines
  textPrimary: string  // Headings, strong text
  textSecondary: string // Body copy
  textMuted: string    // Captions, metadata, timestamps
  accent: string       // Primary brand colour — CTAs, active nav, rating fill

  // === EXTENDED (reserve / contextual) ===
  accentHover: string  // Accent on hover/active state
  accentAlt: string    // Secondary accent — category tags, highlights
  highlight: string    // Focus rings, selection bg
  overlay: string      // Dark overlay on hero images
  warm: string         // Warm reserve — Music pages, vinyl warmth
  cool: string         // Cool reserve — Film/Theatre, cinematic tones
  paper: string        // Off-white/cream — blockquotes, pull-quotes
  special: string      // Wildcard — page-specific splashes of colour
}

// Sharp — white/black/#ebff00 editorial identity
const sharp: Palette = {
  name: 'Sharp',
  bg: '#ffffff',
  surface: '#f4f4f4',
  surfaceAlt: '#ebebeb',
  border: '#000000',
  textPrimary: '#000000',
  textSecondary: '#1a1a1a',
  textMuted: '#555555',
  accent: '#ebff00',
  accentHover: '#d4e600',
  accentAlt: '#ebff00',
  highlight: 'rgba(235,255,0,0.25)',
  overlay: 'rgba(0,0,0,0.55)',
  warm: '#ebff00',
  cool: '#000000',
  paper: '#fafafa',
  special: '#ebff00',
}

export const palettes: Palette[] = [sharp]

export const defaultPalette = sharp

export function getPaletteByName(name: string): Palette {
  return palettes.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? defaultPalette
}
