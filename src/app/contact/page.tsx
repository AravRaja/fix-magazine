import type { Metadata } from 'next'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <PageTransition section="/contact">
      <div className="max-w-xl mx-auto pt-8">
        <h1
          className="font-display text-4xl font-bold mb-8"
          style={{ color: 'var(--text-primary)' }}
        >
          Contact
        </h1>

        <div className="flex flex-col gap-6 font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Email us at{' '}
            <a
              href="mailto:contact@thefixmagazine.com"
              style={{ color: '#ebff00', background: '#000', padding: '0 3px' }}
              className="hover:opacity-70 transition-opacity"
            >
              contact@thefixmagazine.com
            </a>{' '}
            if you have any reason&hellip;
          </p>

          <p>
            We can give you affordable advertising in <em>The Fix</em>. Please direct all
            enquiries to{' '}
            <a
              href="mailto:contact@thefixmagazine.com"
              style={{ color: '#ebff00', background: '#000', padding: '0 3px' }}
              className="hover:opacity-70 transition-opacity"
            >
              contact@thefixmagazine.com
            </a>
          </p>

          <p>
            If you want to contribute then reach us at{' '}
            <a
              href="mailto:contact@thefixmagazine.com"
              style={{ color: '#ebff00', background: '#000', padding: '0 3px' }}
              className="hover:opacity-70 transition-opacity"
            >
              contact@thefixmagazine.com
            </a>
          </p>

          <p style={{ color: 'var(--text-muted)' }} className="font-mono text-sm italic">
            Can you see a theme developing here?
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
