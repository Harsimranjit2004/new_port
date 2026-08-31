import { Fragment, type ReactNode, useEffect, useState } from 'react'
import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { apiRequest } from '../lib/adminApi'
import './FieldNotesDetailPage.css'

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

const FALLBACK_NOTE: FieldNote = {
  slug: 'tokenizer-native-backend',
  title: 'Why the tokenizer needed a native backend',
  excerpt: 'Python defined the tokenizer correctly. It just could not train fast enough to be the whole story.',
  body: 'The Python implementation was never wrong. It trained a byte-level BPE tokenizer, selected merges under a deterministic tie-break, and produced a vocabulary that matched every test we wrote for it. The problem showed up somewhere else: on a 4.2M-document corpus, training that vocabulary took long enough that iterating on filtering decisions upstream became expensive in a way that changed how carefully anyone was willing to experiment.\n\nThat is a bad trade to make silently. If retraining a tokenizer costs an afternoon, people quietly stop retraining it, and the corpus and the vocabulary drift apart in a way nothing catches until evaluation gets strange in some direction nobody can immediately name.',
  note_type: 'Observation', tags: [], project_slug: 'whetstone', reading_minutes: 4,
  published_at: '2026-08-11', published: true, featured: true, content_blocks: [], seo: {},
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join('\n')
  return ''
}

function renderBlock(block: unknown, index: number): ReactNode {
  if (typeof block === 'string') return <p key={index}>{block}</p>
  if (!isRecord(block)) return null

  const type = textValue(block.type || block.kind).toLocaleLowerCase()
  const content = textValue(block.content ?? block.text ?? block.body ?? block.value)
  const title = textValue(block.title ?? block.caption ?? block.label)

  if (type === 'heading' || type === 'header') return <h2 key={index}>{content || title}</h2>
  if (type === 'quote' || type === 'blockquote') return <blockquote key={index}>{content}</blockquote>
  if (type === 'code' || type === 'code_block') return <figure key={index}>{title && <figcaption>{title}</figcaption>}<pre><code>{content}</code></pre></figure>
  if (type === 'list' || type === 'unordered_list' || type === 'ordered_list') {
    const items = Array.isArray(block.items) ? block.items.map(textValue).filter(Boolean) : content.split('\n').filter(Boolean)
    const List = type === 'ordered_list' || block.ordered === true ? 'ol' : 'ul'
    return <List key={index}>{items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</List>
  }
  if (content || title) return <p key={index}>{content || title}</p>
  return null
}

function formatDate(value: string | null) {
  if (!value) return { label: 'Undated', dateTime: undefined }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { label: value, dateTime: value }
  return {
    label: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date),
    dateTime: date.toISOString(),
  }
}

function pathnameSlug() {
  const parts = window.location.pathname.replace(/\/+$/, '').split('/')
  const rawSlug = parts[parts.length - 1] || ''
  try { return decodeURIComponent(rawSlug) } catch { return rawSlug }
}

export default function FieldNotesDetailPage() {
  const [note, setNote] = useState(FALLBACK_NOTE)
  const [notes, setNotes] = useState<FieldNote[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const slug = pathnameSlug()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      apiRequest<FieldNote>(`/field-notes/${encodeURIComponent(slug)}`, { signal: controller.signal }),
      apiRequest<FieldNote[]>('/field-notes', { signal: controller.signal }),
    ]).then(([record, records]) => {
      setNote(record)
      setNotes(Array.isArray(records) ? records : [])
      setStatus('ready')
    }).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      setStatus('error')
    })
    return () => controller.abort()
  }, [slug])

  const currentIndex = notes.findIndex((item) => item.slug === note.slug)
  const previous = currentIndex >= 0 ? notes[currentIndex - 1] : undefined
  const next = currentIndex >= 0 ? notes[currentIndex + 1] : undefined
  const published = formatDate(note.published_at)
  const paragraphs = note.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)

  return (
    <main className="fnd-page">
      <Navbar submergedAt={0} />
      <article className="fnd-root">
        <a href="/field-notes" className="fnd-link fnd-back">← Field Notes</a>
        {status !== 'ready' && <p className="fnd-status" role="status">{status === 'loading' ? 'Loading note…' : 'Note unavailable · showing archived copy'}</p>}

        <header className="fnd-header">
          <div className="fnd-meta">
            <span>{note.project_slug || note.tags[0] || note.note_type || 'Field note'}</span>
            <time dateTime={published.dateTime}>{published.label}</time>
            <span>{note.reading_minutes} min read</span>
          </div>
          <h1>{note.title}</h1>
          {note.excerpt && <p>{note.excerpt}</p>}
        </header>

        <div className="fnd-body">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {note.content_blocks.map((block, index) => <Fragment key={index}>{renderBlock(block, index)}</Fragment>)}
        </div>

        {note.project_slug && <aside className="fnd-related">
          <span>Related</span>
          <a href={`/work/${encodeURIComponent(note.project_slug)}`} className="fnd-link">{note.project_slug} — full project record ↗</a>
        </aside>}

        {(previous || next) && <nav className="fnd-note-nav" aria-label="Adjacent field notes">
          {previous && <a href={`/field-notes/${encodeURIComponent(previous.slug)}`} className="fnd-link"><span>Previous observation</span>{previous.title}</a>}
          {next && <a href={`/field-notes/${encodeURIComponent(next.slug)}`} className="fnd-link"><span>Next observation</span>{next.title}</a>}
        </nav>}
      </article>
      <Footer />
    </main>
  )
}
