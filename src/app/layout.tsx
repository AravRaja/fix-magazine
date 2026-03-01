import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/themes/ThemeProvider'
import { NavBar } from '@/components/NavBar'

export const metadata: Metadata = {
  title: {
    default: 'The Fix Magazine',
    template: '%s | The Fix Magazine',
  },
  description: 'Bristol arts and culture reviews — music, theatre, film, and visual art.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NavBar />
          <main className="px-4 min-h-screen">
            {children}
          </main>
          <footer
            className="border-t mt-16 py-8 text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              © The Fix Magazine — Bristol arts &amp; culture
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
