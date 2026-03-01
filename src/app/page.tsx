import { getAllArticles } from '@/lib/articles'
import { CardFan3DWrapper } from '@/components/CardFan3DWrapper'
import { ArticleBrowser } from '@/components/ArticleBrowser'
import { PageTransition } from '@/components/PageTransition'

export default function HomePage() {
  const articles = getAllArticles()

  return (
    <PageTransition section="/">
      {/* ── Full-bleed yellow hero ─────────────────────────────────────────── */}
      {/* Breaks out of layout.tsx px-4 via negative margin + extra width     */}
      <section
        className="flex flex-col md:flex-row md:items-center"
        style={{
          width: 'calc(100% + 32px)',
          marginLeft: '-16px',
          height: 'calc(100vh - 56px)',
          background: '#ebff00',
          overflow: 'hidden',
        }}
      >
        {/* "The" — top on mobile, left on desktop */}
        <span
          className="text-center md:text-left"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(64px, 13vw, 260px)',
            color: '#000',
            lineHeight: 1,
            padding: 'clamp(8px, 1.5vw, 24px) clamp(6px, 1vw, 20px)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          The
        </span>

        {/* 3D carousel fills the space between */}
        <div
          className="flex-1 min-h-0"
          style={{ height: '100%' }}
        >
          <CardFan3DWrapper articles={articles} />
        </div>

        {/* "Fix." — bottom on mobile, right on desktop */}
        <span
          className="text-center md:text-right"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(64px, 13vw, 260px)',
            color: '#000',
            lineHeight: 1,
            padding: 'clamp(8px, 1.5vw, 24px) clamp(6px, 1vw, 20px)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          Fix.
        </span>
      </section>

      {/* ── Article browser ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto pt-12 pb-16">
        <h2
          className="font-display text-2xl font-bold mb-8"
          style={{ color: 'var(--text-primary)' }}
        >
          Recent
        </h2>
        <ArticleBrowser articles={articles} />
      </section>
    </PageTransition>
  )
}
