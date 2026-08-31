import { useEffect, useState, type ReactNode } from 'react'
import { FaGithub, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import { publicApi, settingString, settingsMap, type PublicFieldNote, type PublicProfile, type SocialLink } from '../../lib/publicApi'
import './Footer.css'

function Icon({ name }: { name: 'github' | 'linkedin' | 'mail' | 'file' | 'arrow' }) {
  const paths = {
    github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.7a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.77c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    linkedin: <><path d="M6.5 8.2V18M6.5 5.5v.1M10.5 18v-5.4c0-2.2 3.9-2.4 3.9.2V18M10.5 8.2v1.5" /><rect x="3" y="3" width="18" height="18" rx="2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></>,
    file: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6" /></>,
    arrow: <path d="M6 18 18 6M9 6h9v9" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}


const fallbackProfile: PublicProfile = { name: 'Harsimranjit', role: 'ML / AI Engineer', location: 'Toronto', email: 'hello@example.com', social_links: [
  { label: 'GitHub', url: 'https://github.com/' }, { label: 'LinkedIn', url: 'https://www.linkedin.com/' }, { label: 'Twitter', url: 'https://twitter.com/' },
] }
const fallbackNote: PublicFieldNote = { slug: 'tokenizer-native-backend', title: 'Why the tokenizer needed a native backend', excerpt: 'Python defined the behaviour correctly. It just could not train fast enough to be the whole story.', published_at: '2026-08-11', project: 'Whetstone', read_time: '4 min' }
const fallbackNavigation = [{ label: 'Overview', href: '/' }, { label: 'Work', href: '/work' }, { label: 'Field Notes', href: '/field-notes' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]

function socialIcon(label: string): ReactNode {
  const normalized = label.toLowerCase()
  if (normalized.includes('github')) return <FaGithub />
  if (normalized.includes('linkedin')) return <FaLinkedinIn />
  if (normalized.includes('twitter') || normalized.includes('x')) return <FaTwitter />
  return <Icon name="arrow" />
}

function parseNavigation(value: unknown) {
  if (typeof value === 'string') { try { value = JSON.parse(value) } catch { return fallbackNavigation } }
  if (!Array.isArray(value)) return fallbackNavigation
  const items = value.filter((item): item is { label: string; href: string } => Boolean(item && typeof item.label === 'string' && typeof item.href === 'string'))
  return items.length ? items : fallbackNavigation
}

export default function Footer() {
  const [profile, setProfile] = useState(fallbackProfile)
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [note, setNote] = useState(fallbackNote)

  useEffect(() => {
    let active = true
    Promise.allSettled([publicApi.profile(), publicApi.settings(), publicApi.fieldNotes()]).then(([profileResult, settingsResult, notesResult]) => {
      if (!active) return
      if (profileResult.status === 'fulfilled') setProfile({ ...fallbackProfile, ...profileResult.value })
      if (settingsResult.status === 'fulfilled') setSettings(settingsMap(settingsResult.value))
      if (notesResult.status === 'fulfilled') {
        const byNewest = [...notesResult.value].sort((a, b) => Date.parse(b.published_at ?? b.created_at ?? '') - Date.parse(a.published_at ?? a.created_at ?? ''))
        const latest = byNewest.find((item) => item.featured === true) ?? byNewest[0]
        if (latest) setNote({ ...fallbackNote, ...latest })
      }
    })
    return () => { active = false }
  }, [])

  const navigation = parseNavigation(settings.footer_navigation ?? settings.navigation ?? settings.nav_items)
  const noteDate = note.published_at ?? note.created_at
  const parsedDate = noteDate ? new Date(noteDate) : null
  const formattedDate = parsedDate && !Number.isNaN(parsedDate.valueOf()) ? new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(parsedDate) : '11 Aug'
  const socialLinks: SocialLink[] = profile.social_links?.length ? profile.social_links : fallbackProfile.social_links!
  const resumeHref = profile.resume_url || `mailto:${profile.email}?subject=${encodeURIComponent('Résumé request')}`

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__identity" aria-label="Identity and external links">
            <div className="site-footer__identity-copy">
              <div className="site-footer__identity-heading">
                <span className="site-footer__brand-mark" aria-hidden="true">{settingString(settings, ['footer_monogram', 'nav_monogram'], `${profile.name?.charAt(0).toLowerCase() || 'h'}.`)}</span>
                <div><p className="site-footer__name">{profile.name}<span>.</span></p><p className="site-footer__role">{profile.role}</p></div>
              </div>
            </div>
            <nav className="site-footer__social" aria-label="External links">
              {socialLinks.map((link) => <a href={link.url} aria-label={link.label} key={`${link.label}-${link.url}`}>{socialIcon(link.label)}<span>{link.label}</span></a>)}
              <a className="site-footer__resume" href={resumeHref}><Icon name="file" /><span>{profile.resume_url ? 'View résumé' : 'Request résumé'}</span></a>
            </nav>
          </section>

          <section className="site-footer__navigation" aria-labelledby="footer-navigation-title">
            <p id="footer-navigation-title" className="site-footer__label">Navigation</p>
            <nav aria-label="Footer navigation">
              {navigation.map((item, index) => <a href={item.href} key={item.href}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</a>)}
            </nav>
          </section>

          <section className="site-footer__notes" aria-labelledby="footer-notes-title">
            <div className="site-footer__notes-head">
              <p id="footer-notes-title" className="site-footer__label">Field Note</p>
              <a href="/field-notes">Archive <Icon name="arrow" /></a>
            </div>
            <a className="site-footer__field-card" href={`/field-notes/${note.slug || fallbackNote.slug}`}>
              <span>{formattedDate} · {String(note.project ?? note.note_type ?? 'Field note')}</span>
              <strong>{note.title}</strong>
              <p>{String(note.excerpt ?? note.summary ?? fallbackNote.excerpt)}</p>
              <small>{String(note.read_time ?? '4 min')} read <Icon name="arrow" /></small>
            </a>
            <a className="site-footer__contact-signal" href="/contact"><i aria-hidden="true" /> {settingString(settings, ['footer_contact_signal'], 'Channel open · Start a conversation')} <Icon name="arrow" /></a>
          </section>
        </div>

        <div className="site-footer__base">
          <span>{profile.location || 'Toronto'} · {new Date().getFullYear()}</span>
          <span>{settingString(settings, ['footer_tagline'], 'Built beneath the surface')}</span>
          <a href="/">Return to surface ↑</a>
        </div>
      </div>
    </footer>
  )
}
