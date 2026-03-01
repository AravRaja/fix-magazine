'use client'

import { useSoundEffect } from '@/hooks/useSoundEffect'

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function SoundButton({ children, onClick, ...props }: SoundButtonProps) {
  const { playClick } = useSoundEffect()

  return (
    <button
      {...props}
      onClick={(e) => {
        playClick()
        onClick?.(e)
      }}
    >
      {children}
    </button>
  )
}
