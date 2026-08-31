type RecordValue = Record<string, unknown>

type Props = {
  value: RecordValue
  media: RecordValue[]
  onChange: (value: RecordValue) => void
}

function records(value: unknown): RecordValue[] {
  return Array.isArray(value) ? value.filter((item): item is RecordValue => Boolean(item && typeof item === 'object')) : []
}

function mediaIdFromSection(sections: RecordValue[], id: string): string {
  const section = sections.find((item) => item.id === id)
  return typeof section?.media_id === 'string' ? section.media_id : ''
}

export default function ProjectEditor({ value, media, onChange }: Props) {
  const images = media.filter((item) => String(item.mime_type).startsWith('image/'))
  const extra = value.extra && typeof value.extra === 'object' && !Array.isArray(value.extra) ? value.extra as RecordValue : {}
  const sections = records(value.sections)

  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next })
  const setExtra = (key: string, next: unknown) => set('extra', { ...extra, [key]: next || null })
  const setSectionMedia = (id: string, mediaId: string) => {
    const index = sections.findIndex((item) => item.id === id)
    const next = [...sections]
    if (index >= 0) next[index] = { ...next[index], media_id: mediaId || null }
    else next.push({ id, title: id === 'system' ? 'System' : 'Evidence', body: '', media_id: mediaId || null })
    set('sections', next)
  }

  const mediaSelect = (label: string, selected: string, onSelect: (id: string) => void) => (
    <label><span>{label}</span><select value={selected} onChange={(event) => onSelect(event.target.value)}><option value="">No image selected</option>{images.map((item) => <option value={String(item.id)} key={String(item.id)}>{String(item.filename)}{item.related_project ? ` · ${String(item.related_project)}` : ''}</option>)}</select>{selected && <div className="admin-project-media-preview">{images.find((item) => item.id === selected) ? <img src={String(images.find((item) => item.id === selected)?.public_url)} alt="Selected project media" /> : <small>Selected media is not in the current library.</small>}</div>}</label>
  )

  return <div className="admin-project-editor">
    <section><h3>Project identity</h3><div className="admin-project-grid"><label><span>Title</span><input value={String(value.title ?? '')} onChange={(event) => set('title', event.target.value)} required /></label><label><span>Slug</span><input value={String(value.slug ?? '')} onChange={(event) => set('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} required /></label><label><span>Index label</span><input value={String(value.index_label ?? '')} onChange={(event) => set('index_label', event.target.value)} /></label><label><span>Domain</span><input value={String(value.domain ?? '')} onChange={(event) => set('domain', event.target.value)} /></label><label><span>Status</span><input value={String(value.status ?? '')} onChange={(event) => set('status', event.target.value)} /></label><label><span>Year</span><input value={String(value.year ?? '')} onChange={(event) => set('year', event.target.value)} /></label><label><span>Sort order</span><input type="number" value={Number(value.sort_order ?? 0)} onChange={(event) => set('sort_order', Number(event.target.value))} /></label></div><div className="admin-project-checks"><label><input type="checkbox" checked={Boolean(value.featured)} onChange={(event) => set('featured', event.target.checked)} /> Featured</label><label><input type="checkbox" checked={Boolean(value.published)} onChange={(event) => set('published', event.target.checked)} /> Published</label></div></section>

    <section><h3>Project story</h3><label><span>Question</span><textarea rows={3} value={String(value.question ?? '')} onChange={(event) => set('question', event.target.value)} /></label><label><span>Thesis</span><textarea rows={3} value={String(value.thesis ?? '')} onChange={(event) => set('thesis', event.target.value)} /></label><label><span>Summary</span><textarea rows={5} value={String(value.summary ?? '')} onChange={(event) => set('summary', event.target.value)} /></label><label><span>Technologies — comma separated</span><input value={Array.isArray(value.technologies) ? value.technologies.join(', ') : ''} onChange={(event) => set('technologies', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label></section>

    <section><h3>Project media</h3><p>Upload images in the Media Library first, then select them here.</p><div className="admin-project-media-grid">{mediaSelect('Cover / project card', String(value.cover_media_id ?? ''), (id) => set('cover_media_id', id || null))}{mediaSelect('Hero image', String(extra.hero_media_id ?? ''), (id) => setExtra('hero_media_id', id))}{mediaSelect('System / architecture', mediaIdFromSection(sections, 'system'), (id) => setSectionMedia('system', id))}{mediaSelect('Evidence / result', mediaIdFromSection(sections, 'evidence'), (id) => setSectionMedia('evidence', id))}</div></section>
  </div>
}
