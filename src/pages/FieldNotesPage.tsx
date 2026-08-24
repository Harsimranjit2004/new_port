import { useState } from 'react'
import { Navbar } from '../components/navbar'
import './FieldNotesPage.css'

interface Note {
  date: string
  tag: string
  title: string
  excerpt: string
  read: string
  href: string
}

const NOTES: Note[] = [
  { date: '11 AUG 2026', tag: 'WHETSTONE', title: 'Why the tokenizer needed a native backend', excerpt: 'Python defined the behaviour correctly. It just could not train fast enough to be the whole story.', read: '4 MIN', href: '/field-notes/tokenizer-native-backend' },
  { date: '02 AUG 2026', tag: 'WHETSTONE', title: 'Run 7f3a2c and the six weeks a README bought me', excerpt: 'Documentation described the conditions correctly for about six weeks. Then someone was me, and I forgot.', read: '3 MIN', href: '#note-2' },
  { date: '24 JUL 2026', tag: 'WHETSTONE', title: 'Making the artifact refuse to sign', excerpt: 'The gate was easy to build and uncomfortable to turn on. Turning it on was the point.', read: '2 MIN', href: '#note-3' },
  { date: '15 JUL 2026', tag: 'MODERATION', title: 'The frame that was not worth reading', excerpt: 'Every additional signal has a cost. The interesting problem is deciding when to stop acquiring evidence.', read: '5 MIN', href: '#note-4' },
  { date: '03 JUL 2026', tag: 'MODERATION', title: 'A verdict that cites what it declined to read', excerpt: 'Provenance is not just what a decision used. It is also what it chose not to.', read: '3 MIN', href: '#note-5' },
  { date: '19 JUN 2026', tag: 'RECOMMENDATION', title: 'Ranking candidates that never should have qualified', excerpt: 'The scorer was fine. The candidate generator was quietly letting through the wrong population.', read: '4 MIN', href: '#note-6' },
  { date: '02 JUN 2026', tag: 'GENERAL', title: 'On writing the failed attempt down', excerpt: 'A rejected approach is evidence of reasoning, not an admission. It belongs on the page.', read: '2 MIN', href: '#note-7' },
]

const TAGS = ['ALL', 'WHETSTONE', 'MODERATION', 'RECOMMENDATION', 'GENERAL']

export default function FieldNotesPage() {
  const [filter, setFilter] = useState('ALL')
  const notes = filter === 'ALL' ? NOTES : NOTES.filter((note) => note.tag === filter)

  return (
    <main className="fn-page">
      <Navbar submergedAt={0} />
      <section className="fn-root">
        <header className="fn-header">
          <a href="/" className="fn-link fn-back">← Observatory</a>
          <span className="fn-kicker">Field notes</span>
          <h1>Short technical notes, written as they happen.</h1>
          <p>Not case studies — smaller findings, decisions and dead ends from the active builds, logged close to when they happened.</p>
          <p className="fn-count">{NOTES.length} notes · Updated Aug 2026</p>

          <nav className="fn-tags" aria-label="Filter field notes">
            {TAGS.map((tag) => (
              <button
                type="button"
                className={tag === filter ? 'is-active' : ''}
                aria-pressed={tag === filter}
                onClick={() => setFilter(tag)}
                key={tag}
              >
                {tag}
              </button>
            ))}
          </nav>
        </header>

        <div className="fn-list" aria-live="polite">
          {notes.map((note, index) => (
            <a id={`note-${index + 1}`} key={`${note.href}-${note.title}`} href={note.href} className="fn-row">
              <span className="fn-date">{note.date}</span>
              <span className="fn-tag-label">{note.tag}</span>
              <span className="fn-copy">
                <strong>{note.title}</strong>
                <span>{note.excerpt}</span>
              </span>
              <span className="fn-read">{note.read} <i aria-hidden="true">↗</i></span>
            </a>
          ))}
        </div>

        <footer className="fn-end">
          <span>Log ends · More written as it happens</span>
          <a href="/work" className="fn-link">See the projects →</a>
        </footer>
      </section>
    </main>
  )
}
