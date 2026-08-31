import { useEffect, useMemo, useState } from 'react'
import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import { apiRequest } from '../lib/adminApi'
import './FieldNotesPage.css'

interface FieldNote {
  slug: string
  title: string
  excerpt: string
  body: string
  note_type: string
  tags: string[]
  project_slug: string | null
  reading_minutes: number
  published_at: string | null
  published: boolean
  featured: boolean
  content_blocks: unknown[]
  seo: unknown
}

const FALLBACK_NOTES: FieldNote[] = [
  { slug: 'tokenizer-native-backend', title: 'Why the tokenizer needed a native backend', excerpt: 'Python defined the behaviour correctly. It just could not train fast enough to be the whole story.', body: '', note_type: 'Observation', tags: [], project_slug: 'whetstone', reading_minutes: 4, published_at: '2026-08-11', published: true, featured: true, content_blocks: [], seo: {} },
  { slug: 'run-7f3a2c', title: 'Run 7f3a2c and the six weeks a README bought me', excerpt: 'Documentation described the conditions correctly for about six weeks. Then someone was me, and I forgot.', body: '', note_type: 'Observation', tags: [], project_slug: 'whetstone', reading_minutes: 3, published_at: '2026-08-02', published: true, featured: false, content_blocks: [], seo: {} },
  { slug: 'artifact-refuse-to-sign', title: 'Making the artifact refuse to sign', excerpt: 'The gate was easy to build and uncomfortable to turn on. Turning it on was the point.', body: '', note_type: 'Observation', tags: [], project_slug: 'whetstone', reading_minutes: 2, published_at: '2026-07-24', published: true, featured: false, content_blocks: [], seo: {} },
  { slug: 'frame-not-worth-reading', title: 'The frame that was not worth reading', excerpt: 'Every additional signal has a cost. The interesting problem is deciding when to stop acquiring evidence.', body: '', note_type: 'Observation', tags: [], project_slug: 'moderation', reading_minutes: 5, published_at: '2026-07-15', published: true, featured: false, content_blocks: [], seo: {} },
  { slug: 'verdict-declined-to-read', title: 'A verdict that cites what it declined to read', excerpt: 'Provenance is not just what a decision used. It is also what it chose not to.', body: '', note_type: 'Observation', tags: [], project_slug: 'moderation', reading_minutes: 3, published_at: '2026-07-03', published: true, featured: false, content_blocks: [], seo: {} },
  { slug: 'ranking-candidates', title: 'Ranking candidates that never should have qualified', excerpt: 'The scorer was fine. The candidate generator was quietly letting through the wrong population.', body: '', note_type: 'Observation', tags: [], project_slug: 'recommendation', reading_minutes: 4, published_at: '2026-06-19', published: true, featured: false, content_blocks: [], seo: {} },
  { slug: 'failed-attempt', title: 'On writing the failed attempt down', excerpt: 'A rejected approach is evidence of reasoning, not an admission. It belongs on the page.', body: '', note_type: 'Observation', tags: ['general'], project_slug: null, reading_minutes: 2, published_at: '2026-06-02', published: true, featured: false, content_blocks: [], seo: {} },
]

function formatDate(value: string | null) {
  if (!value) return 'UNDATED'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date).toUpperCase()
}

function noteFilters(note: FieldNote) {
  return [note.project_slug, ...note.tags].filter((value): value is string => Boolean(value))
}

export default function FieldNotesPage() {
  const [filter, setFilter] = useState('ALL')
  const [notes, setNotes] = useState(FALLBACK_NOTES)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    apiRequest<FieldNote[]>('/field-notes', { signal: controller.signal })
      .then((records) => {
        if (!Array.isArray(records)) throw new Error('Field notes response was not a list')
        setNotes(records)
        setStatus('ready')
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setStatus('error')
      })
    return () => controller.abort()
  }, [])

  const filters = useMemo(() => {
    const values = new Map<string, string>()
    notes.flatMap(noteFilters).forEach((value) => values.set(value.toLocaleLowerCase(), value))
    return ['ALL', ...Array.from(values.values()).sort((a, b) => a.localeCompare(b))]
  }, [notes])

  const visibleNotes = filter === 'ALL'
    ? notes
    : notes.filter((note) => noteFilters(note).some((value) => value.toLocaleLowerCase() === filter.toLocaleLowerCase()))

  useEffect(() => {
    if (!filters.includes(filter)) setFilter('ALL')
  }, [filter, filters])

  return (
    <main className="fn-page">
      <Navbar submergedAt={0} />
      <OceanBackground screens={1} startDepth="shallow" endDepth="deep" showSurfaceWaves className="fn-ocean">
      <section className="fn-root">
        <header className="fn-header">
          <a href="/" className="fn-link fn-back">← Observatory</a>
          <span className="fn-kicker">Field notes</span>
          <h1>Short technical notes, written as they happen.</h1>
          {status !== 'ready' && <p className="fn-count" role="status">{status === 'loading' ? 'Loading latest notes…' : 'Latest notes unavailable · showing archived notes'}</p>}

          <nav className="fn-tags" aria-label="Filter field notes">
            {filters.map((tag) => (
              <button type="button" className={tag === filter ? 'is-active' : ''} aria-pressed={tag === filter} onClick={() => setFilter(tag)} key={tag}>
                {tag.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        <div className="fn-list" aria-live="polite">
          {visibleNotes.map((note) => (
            <a key={note.slug} href={`/field-notes/${encodeURIComponent(note.slug)}`} className="fn-row">
              <span className="fn-date">{formatDate(note.published_at)}</span>
              <span className="fn-tag-label">{(note.project_slug || note.tags[0] || note.note_type || 'General').toUpperCase()}</span>
              <span className="fn-copy"><strong>{note.title}</strong><span>{note.excerpt}</span></span>
              <span className="fn-read">{note.reading_minutes} MIN <i aria-hidden="true">↗</i></span>
            </a>
          ))}
          {visibleNotes.length === 0 && <p className="fn-count">No notes match this filter.</p>}
        </div>

        <footer className="fn-end">
          <span>Log ends · More written as it happens</span>
          <a href="/work" className="fn-link">See the projects →</a>
        </footer>
      </section>
      <Footer />
      </OceanBackground>
    </main>
  )
}
