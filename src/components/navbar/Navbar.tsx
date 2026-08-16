import { useEffect, useRef, type CSSProperties } from 'react'

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
.portable-ocean-nav nav { display: flex; align-items: center; gap: clamp(18px,3vw,38px); padding-right: 18px; }
.portable-ocean-nav nav a { position: relative; color: #45566b; font: 500 10px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; transition: color .25s ease; }
.portable-ocean-nav.is-submerged nav a { color: rgba(220,246,245,.72); }
.portable-ocean-nav nav a::after { content: ''; position: absolute; left: 0; right: 100%; bottom: -7px; height: 1px; background: currentColor; transition: right .25s ease; }
.portable-ocean-nav nav a:hover::after, .portable-ocean-nav nav a:focus-visible::after { right: 0; }
.portable-ocean-nav nav a:hover { color: #0a292d; }
.portable-ocean-nav.is-submerged nav a:hover { color: #bffffa; }
.portable-ocean-nav a:focus-visible { outline: 2px solid #6fd6d6; outline-offset: 7px; border-radius: 3px; }
@media (max-width: 800px) {
  .portable-ocean-nav { top: 16px; width: calc(100% - 24px) !important; height: 58px; transform: translateX(-50%); }
  .portable-ocean-nav__name { display: none; }
  .portable-ocean-nav nav { gap: clamp(12px,3vw,22px); padding-right: 8px; }
  .portable-ocean-nav nav a { font-size: 8px; }
}
@media (max-width: 500px) {
  .portable-ocean-nav nav { gap: 13px; }
  .portable-ocean-nav nav a { letter-spacing: .07em; }
  .portable-ocean-nav nav a:first-child { display: none; }
}
@media (prefers-reduced-motion: reduce) { .portable-ocean-nav { transition: none; } }
`

export default function Navbar({
  brand = 'harsimranjit',
  monogram = 'h.',
  homeHref = '/',
  items = defaultItems,
  shrinkDistance = 700,
  expandedWidth = 900,
  compactWidth = 820,
  submergedAt,
}: NavbarProps) {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = reduceMotion ? 1 : 0
    let target = current
    let frame = 0
    let lastTime = performance.now()

    const updateTarget = () => {
      target = Math.min(1, Math.max(0, window.scrollY / Math.max(1, shrinkDistance)))
      const threshold = submergedAt ?? window.innerHeight * .85
      header.classList.toggle('is-submerged', window.scrollY >= threshold)
    }

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, .1)
      lastTime = time
      current += (target - current) * (1 - Math.exp(-8 * delta))
      if (Math.abs(target - current) < .0005) current = target
      header.style.setProperty('--nav-progress', current.toFixed(4))
      frame = requestAnimationFrame(animate)
    }

    updateTarget()
    header.style.setProperty('--nav-progress', String(current))
    if (!reduceMotion) frame = requestAnimationFrame(animate)
    window.addEventListener('scroll', updateTarget, { passive: true })
    window.addEventListener('resize', updateTarget, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateTarget)
      window.removeEventListener('resize', updateTarget)
    }
  }, [shrinkDistance, submergedAt])

  const dimensions = {
    '--nav-expanded': `${Math.max(expandedWidth, compactWidth)}px`,
    '--nav-compact': `${Math.min(expandedWidth, compactWidth)}px`,
  } as CSSProperties

  return (
    <>
      <style>{styles}</style>
      <header ref={headerRef} className="portable-ocean-nav" style={dimensions}>
        <a className="portable-ocean-nav__brand" href={homeHref} aria-label={`${brand} — Home`}>
          <span className="portable-ocean-nav__mark">{monogram}</span>
          <span className="portable-ocean-nav__name">{brand}<span>.</span></span>
        </a>
        <nav aria-label="Main navigation">
          {items.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
      </header>
    </>
  )
}
