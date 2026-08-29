import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export type NavigationItem = { label: string; href: string }

export interface NavbarProps {
  brand?: string
  monogram?: string
  homeHref?: string
  items?: NavigationItem[]
  /** Scroll distance in pixels over which the navbar shrinks. */
  shrinkDistance?: number
  /** Desktop width before scrolling. */
  expandedWidth?: number
  /** Desktop width after scrolling. */
  compactWidth?: number
  /** Scroll position where the navbar switches to its underwater colors. */
  submergedAt?: number
}

const defaultItems: NavigationItem[] = [
  { label: 'Work', href: '/work' },
  // { label: 'Observability', href: '/observability' },
  { label: 'Field Notes', href: '/field-notes' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const styles = `
.portable-ocean-nav {
  --nav-progress: 0;
  --nav-expanded: 900px;
  --nav-compact: 820px;
  position: fixed;
  z-index: 100;
  top: 24px;
  left: 50%;
  width: min(calc(var(--nav-expanded) - (var(--nav-expanded) - var(--nav-compact)) * var(--nav-progress)), calc(100% - 40px));
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px 7px 8px;
  color: #12202e;
  border: 1px solid rgba(25,70,72,.09);
  border-radius: 999px;
  background: rgba(255,255,255,.78);
  box-shadow: 0 18px 50px rgba(20,80,82,.1), inset 0 1px rgba(255,255,255,.9);
  backdrop-filter: blur(20px) saturate(130%);
  transform: translate3d(-50%, calc(var(--nav-progress) * -3px), 0);
  transition: color .45s ease, background-color .45s ease, border-color .45s ease, box-shadow .45s ease;
  will-change: width, transform;
}
.portable-ocean-nav.is-submerged {
  color: rgba(232,252,252,.9);
  border-color: rgba(127,224,222,.16);
  background: rgba(3,32,48,.82);
  box-shadow: 0 18px 55px rgba(0,18,29,.26), inset 0 1px rgba(225,255,253,.05);
}
.portable-ocean-nav__brand { display: flex; align-items: center; gap: 12px; color: inherit; font: 600 13px Inter, system-ui, sans-serif; letter-spacing: -.02em; text-decoration: none; }
.portable-ocean-nav__mark { display: grid; place-items: center; flex: 0 0 46px; width: 46px; height: 46px; color: #f6f8fa; border-radius: 50%; background: #071a2e; font-size: 15px; font-weight: 700; transition: color .45s ease, background-color .45s ease; }
.portable-ocean-nav.is-submerged .portable-ocean-nav__mark { color: #082b38; background: rgba(159,247,241,.9); }
.portable-ocean-nav__name span { color: #0b3c5d; }
.portable-ocean-nav.is-submerged .portable-ocean-nav__name span { color: #9ff7f1; }
.portable-ocean-nav__menu-button { display: none; }
.portable-ocean-nav nav { display: flex; align-items: center; gap: clamp(18px,3vw,38px); padding-right: 18px; }
.portable-ocean-nav nav a { position: relative; display: inline-flex; min-height: 44px; align-items: center; color: #45566b; font: 500 10px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; transition: color .25s ease; }
.portable-ocean-nav.is-submerged nav a { color: rgba(220,246,245,.72); }
.portable-ocean-nav nav a::after { content: ''; position: absolute; left: 0; right: 100%; bottom: -7px; height: 1px; background: currentColor; transition: right .25s ease; }
.portable-ocean-nav nav a:hover::after, .portable-ocean-nav nav a:focus-visible::after { right: 0; }
.portable-ocean-nav nav a:hover { color: #0a292d; }
.portable-ocean-nav.is-submerged nav a:hover { color: #bffffa; }
.portable-ocean-nav a:focus-visible { outline: 2px solid #6fd6d6; outline-offset: 7px; border-radius: 3px; }
@media (max-width: 800px) {
  .portable-ocean-nav { top: 16px; width: calc(100% - 24px) !important; height: 58px; transform: translateX(-50%); }
  .portable-ocean-nav__name { display: none; }
  .portable-ocean-nav nav { gap: clamp(9px,2.5vw,18px); padding-right: 8px; }
  .portable-ocean-nav nav a { font-size: 8px; }
}
@media (max-width: 620px) {
  .portable-ocean-nav { padding-right: 8px; }
  .portable-ocean-nav__mark { width: 42px; height: 42px; flex-basis: 42px; }
  .portable-ocean-nav__menu-button { display: inline-flex; min-width: 68px; min-height: 42px; align-items: center; justify-content: center; gap: 8px; padding: 0 12px; color: inherit; border: 1px solid currentColor; border-color: rgba(127,224,222,.2); border-radius: 999px; background: transparent; font: 500 8px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; }
  .portable-ocean-nav__menu-button i { position: relative; width: 13px; height: 1px; background: currentColor; transition: background-color .2s ease; }
  .portable-ocean-nav__menu-button i::before, .portable-ocean-nav__menu-button i::after { content: ''; position: absolute; left: 0; width: 13px; height: 1px; background: currentColor; transition: transform .2s ease, top .2s ease; }
  .portable-ocean-nav__menu-button i::before { top: -4px; }
  .portable-ocean-nav__menu-button i::after { top: 4px; }
  .portable-ocean-nav.is-menu-open .portable-ocean-nav__menu-button i { background: transparent; }
  .portable-ocean-nav.is-menu-open .portable-ocean-nav__menu-button i::before { top: 0; transform: rotate(45deg); }
  .portable-ocean-nav.is-menu-open .portable-ocean-nav__menu-button i::after { top: 0; transform: rotate(-45deg); }
  .portable-ocean-nav nav { position: absolute; top: calc(100% + 10px); right: 0; left: 0; display: grid; gap: 0; padding: 10px; overflow: hidden; border: 1px solid rgba(127,224,222,.16); border-radius: 22px; background: rgba(3,24,35,.96); box-shadow: 0 22px 55px rgba(0,10,16,.38); backdrop-filter: blur(20px); opacity: 0; visibility: hidden; transform: translateY(-8px) scale(.98); transform-origin: top; transition: opacity .2s ease, visibility .2s ease, transform .2s ease; }
  .portable-ocean-nav.is-menu-open nav { opacity: 1; visibility: visible; transform: none; }
  .portable-ocean-nav nav a { min-height: 48px; padding: 0 14px; color: rgba(220,246,245,.76); border-bottom: 1px solid rgba(127,224,222,.08); font-size: 9px; letter-spacing: .1em; }
  .portable-ocean-nav nav a:last-child { border-bottom: 0; }
  .portable-ocean-nav nav a::after { display: none; }
}
@media (max-width: 380px) {
  .portable-ocean-nav { width: calc(100% - 12px) !important; }
}
@media (prefers-reduced-motion: reduce) { .portable-ocean-nav { transition: none; } }
`

export default function Navbar({
  brand = 'Harsimranjit',
  monogram = 'h.',
  homeHref = '/',
  items = defaultItems,
  expandedWidth = 900,
  compactWidth = 820,
  submergedAt,
}: NavbarProps) {
  const headerRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const updateTheme = () => {
      const threshold = submergedAt ?? window.innerHeight * .85
      header.classList.toggle('is-submerged', window.scrollY >= threshold)
    }

    updateTheme()
    window.addEventListener('scroll', updateTheme, { passive: true })
    window.addEventListener('resize', updateTheme, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateTheme)
      window.removeEventListener('resize', updateTheme)
    }
  }, [submergedAt])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const closeOnDesktop = () => {
      if (window.innerWidth > 620) setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnDesktop)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnDesktop)
    }
  }, [])

  const dimensions = {
    '--nav-expanded': `${Math.max(expandedWidth, compactWidth)}px`,
    '--nav-compact': `${Math.min(expandedWidth, compactWidth)}px`,
  } as CSSProperties

  return (
    <>
      <style>{styles}</style>
      <motion.header
        ref={headerRef}
        className={`portable-ocean-nav${menuOpen ? ' is-menu-open' : ''}`}
        style={dimensions}
        initial={reducedMotion ? false : { opacity: 0, x: '-50%', y: -18, scale: 0.98 }}
        animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.a
          className="portable-ocean-nav__brand"
          href={homeHref}
          aria-label={`${brand} — Home`}
          initial={reducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
        >
          <span className="portable-ocean-nav__mark">{monogram}</span>
          <span className="portable-ocean-nav__name">{brand}<span>.</span></span>
        </motion.a>
        <button
          className="portable-ocean-nav__menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="portable-ocean-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span><i aria-hidden="true" />
        </button>
        <nav id="portable-ocean-nav-menu" aria-label="Main navigation">
          {items.map((item, index) => (
            <motion.a
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
              initial={reducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 + index * 0.07 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>
      </motion.header>
    </>
  )
}
