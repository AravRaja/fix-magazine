'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { SECTION_ACCENT_TOKEN } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  section: string
}

export function PageTransition({ children, section }: PageTransitionProps) {
  // Apply section accent CSS variable
  useEffect(() => {
    const token = SECTION_ACCENT_TOKEN[section] ?? 'var(--accent)'
    document.documentElement.style.setProperty('--section-accent', token)
    return () => {
      document.documentElement.style.setProperty('--section-accent', 'var(--accent)')
    }
  }, [section])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
