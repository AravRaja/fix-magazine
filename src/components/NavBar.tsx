'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const SECTION_LINKS = [
  { href: '/music',      label: 'Music' },
  { href: '/theatre',    label: 'Theatre' },
  { href: '/film',       label: 'Film' },
  { href: '/visual-art', label: 'Visual Art' },
]

const HAMBURGER_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function NavBar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen]   = useState(false)
  const [menuOpen,   setMenuOpen]     = useState(false)
  const [pastHero,   setPastHero]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Home page: yellow until hero scrolls away; all other pages: always white
  useEffect(() => {
    setPastHero(false)
    if (pathname !== '/') return
    function onScroll() {
      setPastHero(window.scrollY >= window.innerHeight - 56)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const headerBg = pathname === '/' && !pastHero ? '#ebff00' : '#ffffff'

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  function toggleSearch() {
    setSearchOpen(o => !o)
    setMenuOpen(false)
    if (!searchOpen) setTimeout(() => inputRef.current?.focus(), 0)
  }

  function toggleMenu() {
    setMenuOpen(o => !o)
    setSearchOpen(false)
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) {
      setSearchOpen(false)
      // Hard navigation — bypasses any Next.js routing edge cases
      window.location.href = `/search?q=${encodeURIComponent(q)}`
    }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: headerBg,
        fontFamily: '"IBM Plex Mono", monospace',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* ── Main bar ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Wordmark — hidden on mobile (hero title serves as branding) */}
        <Link
          href="/"
          className="hidden md:block font-display text-xl font-bold tracking-tight transition-opacity hover:opacity-75 shrink-0"
          style={{ color: '#000' }}
        >
          The Fix<span>.</span>
        </Link>

        {/* Centre: section nav (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {SECTION_LINKS.map(link => (
            <NavLink key={link.href} href={link.href} label={link.label} active={isActive(link.href)} />
          ))}
        </nav>

        {/* Right: search + hamburger */}
        <div className="flex items-center gap-1">
          {/* Search icon — toggles full-width bar */}
          <button
            onClick={toggleSearch}
            className="p-1.5 transition-opacity hover:opacity-60"
            style={{ color: searchOpen ? '#fff' : '#000', background: searchOpen ? '#000' : 'transparent' }}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            <SearchIcon />
          </button>

          {/* Hamburger — Home / About / Contact */}
          <button
            onClick={toggleMenu}
            className="p-1.5 transition-opacity hover:opacity-60"
            style={{ color: menuOpen ? '#fff' : '#000', background: menuOpen ? '#000' : 'transparent' }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* ── Full-width search bar (below main bar) ────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #000' }}
          >
            <form
              onSubmit={handleSearch}
              className="max-w-6xl mx-auto px-4 py-3 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search all articles…"
                className="flex-1 font-mono text-sm px-3 py-2 outline-none"
                style={{ border: '1px solid #000', background: '#fff', color: '#000' }}
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              />
              <button
                type="submit"
                className="font-mono text-sm px-5 py-2 transition-opacity hover:opacity-70 shrink-0"
                style={{ background: '#000', color: '#ebff00' }}
              >
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hamburger dropdown (Home / About / Contact) ───────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="ham-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="border-t"
            style={{ borderColor: '#000', backgroundColor: headerBg }}
          >
            {/* Mobile: also show section links */}
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1 md:flex-row md:gap-4">
              <div className="flex flex-col gap-1 md:hidden">
                {SECTION_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-mono text-sm py-1 transition-opacity hover:opacity-60"
                    style={{ color: '#000' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-1 md:flex-row md:gap-6">
                {HAMBURGER_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-mono text-sm py-1 transition-opacity hover:opacity-60"
                    style={{ color: '#000', fontWeight: isActive(link.href) ? 700 : 400 }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-1.5 font-mono text-sm transition-opacity hover:opacity-70"
      style={{ color: '#000' }}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 left-2 right-2 h-0.5"
          style={{ backgroundColor: '#000' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="4" x2="14" y2="4" strokeLinecap="round" />
      <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
      <line x1="2" y1="12" x2="14" y2="12" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="3" x2="13" y2="13" strokeLinecap="round" />
      <line x1="13" y1="3" x2="3" y2="13" strokeLinecap="round" />
    </svg>
  )
}
