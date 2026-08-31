import { useEffect, useState } from 'react'
import { ApiError, adminApi } from '../lib/adminApi'

type RecordValue = Record<string, unknown>
type Shelf = 'current' | 'read' | 'return'

interface ExperienceItem { period: string; role: string; company: string; description: string; placeholder: boolean }
interface BookItem { title: string; author: string; cover: string; shelf: Shelf; reading: boolean; note: string; category: string; height: number; color: string; ink: string }

interface AboutDraft {
  headline: string
  biography: string
  workingSet: string[]
  currently: string[]
  experience: ExperienceItem[]
  books: BookItem[]
}

const shelfOptions: [Shelf, string][] = [['current', 'Current / recent'], ['read', 'Read / notes'], ['return', 'Return to / interests']]

const text = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback

function namesFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => typeof item === 'string' ? item : (item && typeof item === 'object' ? text((item as RecordValue).name) : '')).filter(Boolean)
}

function experienceFrom(value: unknown): ExperienceItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is RecordValue => Boolean(item) && typeof item === 'object').map((item) => ({
    period: text(item.period), role: text(item.role), company: text(item.company),
    description: text(item.description), placeholder: item.placeholder === true,
  }))
}

function booksFrom(value: unknown): BookItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is RecordValue => Boolean(item) && typeof item === 'object').map((item) => ({
    title: text(item.title), author: text(item.author), cover: text(item.cover),
    shelf: (['current', 'read', 'return'] as Shelf[]).includes(item.shelf as Shelf) ? item.shelf as Shelf : 'current',
    reading: item.status === 'reading', note: text(item.note), category: text(item.category),
    height: typeof item.height === 'number' ? item.height : 200, color: text(item.color, '#eee9df'), ink: text(item.ink),
  }))
}

function draftFrom(profile: RecordValue): AboutDraft {
  const extra = (profile.extra && typeof profile.extra === 'object' ? profile.extra as RecordValue : {})
  return {
    headline: text(profile.headline),
    biography: text(profile.biography),
    workingSet: namesFrom(profile.working_set),
    currently: namesFrom(profile.currently),
    experience: experienceFrom(extra.experience),
    books: booksFrom(extra.books),
  }
}

function TagList({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return <section>
    <h3>{label}</h3>
    {items.map((item, index) => (
      <div className="admin-about-row" key={index}>
        <input type="text" value={item} onChange={(event) => onChange(items.map((current, i) => i === index ? event.target.value : current))} />
        <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...items, ''])}>+ Add</button>
  </section>
}

export default function AboutEditor({ profile, adminKey, onSaved, onError }: { profile: RecordValue; adminKey: string; onSaved: (profile: RecordValue) => void; onError: (reason: unknown) => void }) {
  const [draft, setDraft] = useState<AboutDraft>(() => draftFrom(profile))
  const [saving, setSaving] = useState(false)
  useEffect(() => { setDraft(draftFrom(profile)) }, [profile])

  const updateExperience = (index: number, patch: Partial<ExperienceItem>) =>
    setDraft((current) => ({ ...current, experience: current.experience.map((item, i) => i === index ? { ...item, ...patch } : item) }))
  const updateBook = (index: number, patch: Partial<BookItem>) =>
    setDraft((current) => ({ ...current, books: current.books.map((item, i) => i === index ? { ...item, ...patch } : item) }))

  const save = async () => {
    setSaving(true)
    try {
      const { id, created_at, updated_at, ...rest } = profile
      void id; void created_at; void updated_at
      const extra = (profile.extra && typeof profile.extra === 'object' ? profile.extra as RecordValue : {})
      const payload = {
        ...rest,
        headline: draft.headline || null,
        biography: draft.biography || null,
        working_set: draft.workingSet.filter((name) => name.trim()).map((name) => ({ name: name.trim() })),
        currently: draft.currently.filter((name) => name.trim()).map((name) => ({ name: name.trim() })),
        extra: {
          ...extra,
          experience: draft.experience.filter((item) => item.role.trim()),
          books: draft.books
            .filter((item) => item.title.trim())
            .map(({ reading, ...book }) => ({ ...book, status: reading ? 'reading' : undefined })),
        },
      }
      const saved = await adminApi.put<RecordValue>('/profile', payload, adminKey)
      onSaved(saved)
    } catch (reason) {
      onError(reason instanceof Error ? reason : new ApiError(0, 'Save failed'))
    } finally { setSaving(false) }
  }

  return <div className="admin-about">
    <section>
      <h3>Bio</h3>
      <label><span>Headline</span><input type="text" value={draft.headline} onChange={(event) => setDraft({ ...draft, headline: event.target.value })} /></label>
      <label><span>Biography (second paragraph on About)</span><textarea value={draft.biography} onChange={(event) => setDraft({ ...draft, biography: event.target.value })} /></label>
    </section>

    <TagList label="Things I work with (domains)" items={draft.workingSet} onChange={(workingSet) => setDraft({ ...draft, workingSet })} />
    <TagList label="Technologies I use" items={draft.currently} onChange={(currently) => setDraft({ ...draft, currently })} />

    <section>
      <h3>Experience</h3>
      {draft.experience.map((item, index) => (
        <div className="admin-about-card" key={index}>
          <button type="button" className="admin-about-card__remove" onClick={() => setDraft({ ...draft, experience: draft.experience.filter((_, i) => i !== index) })} aria-label="Remove experience">×</button>
          <div className="admin-about-card__grid">
            <label><span>Period</span><input type="text" value={item.period} onChange={(event) => updateExperience(index, { period: event.target.value })} placeholder="2025 — PRESENT" /></label>
            <label><span>Role</span><input type="text" value={item.role} onChange={(event) => updateExperience(index, { role: event.target.value })} /></label>
            <label><span>Company</span><input type="text" value={item.company} onChange={(event) => updateExperience(index, { company: event.target.value })} /></label>
          </div>
          <label><span>Description</span><textarea value={item.description} onChange={(event) => updateExperience(index, { description: event.target.value })} /></label>
          <label className="admin-about-card__checkbox"><input type="checkbox" checked={item.placeholder} onChange={(event) => updateExperience(index, { placeholder: event.target.checked })} /> Placeholder (details pending)</label>
        </div>
      ))}
      <button type="button" onClick={() => setDraft({ ...draft, experience: [...draft.experience, { period: '', role: '', company: '', description: '', placeholder: false }] })}>+ Add experience</button>
    </section>

    <section>
      <h3>Books ({draft.books.length})</h3>
      {draft.books.map((item, index) => (
        <div className="admin-about-card" key={index}>
          <button type="button" className="admin-about-card__remove" onClick={() => setDraft({ ...draft, books: draft.books.filter((_, i) => i !== index) })} aria-label="Remove book">×</button>
          <div className="admin-about-card__grid">
            <label><span>Title</span><input type="text" value={item.title} onChange={(event) => updateBook(index, { title: event.target.value })} /></label>
            <label><span>Author</span><input type="text" value={item.author} onChange={(event) => updateBook(index, { author: event.target.value })} /></label>
            <label><span>Cover URL</span><input type="url" value={item.cover} onChange={(event) => updateBook(index, { cover: event.target.value })} /></label>
            <label><span>Shelf</span><select value={item.shelf} onChange={(event) => updateBook(index, { shelf: event.target.value as Shelf })}>{shelfOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label><span>Category</span><input type="text" value={item.category} onChange={(event) => updateBook(index, { category: event.target.value })} /></label>
            <label><span>Spine height (px)</span><input type="number" value={item.height} onChange={(event) => updateBook(index, { height: Number(event.target.value) || 200 })} /></label>
            <label><span>Spine color</span><input type="text" value={item.color} onChange={(event) => updateBook(index, { color: event.target.value })} /></label>
            <label><span>Spine ink color (optional)</span><input type="text" value={item.ink} onChange={(event) => updateBook(index, { ink: event.target.value })} /></label>
          </div>
          <label><span>Note</span><input type="text" value={item.note} onChange={(event) => updateBook(index, { note: event.target.value })} /></label>
          <label className="admin-about-card__checkbox"><input type="checkbox" checked={item.reading} onChange={(event) => updateBook(index, { reading: event.target.checked })} /> Currently reading</label>
        </div>
      ))}
      <button type="button" onClick={() => setDraft({ ...draft, books: [...draft.books, { title: '', author: '', cover: '', shelf: 'current', reading: false, note: '', category: '', height: 200, color: '#eee9df', ink: '' }] })}>+ Add book</button>
    </section>

    <div className="admin-about-actions">
      <button type="button" onClick={() => setDraft(draftFrom(profile))} disabled={saving}>Discard changes</button>
      <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save About content'}</button>
    </div>
  </div>
}
