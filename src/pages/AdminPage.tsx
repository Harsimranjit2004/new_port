import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { API_BASE, ApiError, adminApi } from '../lib/adminApi'
import AboutEditor from './AboutEditor'
import ProjectEditor from './ProjectEditor'
import StructuredRecordEditor from './StructuredRecordEditor'
import SitePageForm from './SitePageForm'
import './AdminPage.css'

type Tab = 'overview' | 'helper' | 'profile' | 'home' | 'about' | 'contact-page' | 'projects' | 'notes' | 'content' | 'media' | 'inbox' | 'rag'
type RecordValue = Record<string, unknown>

const projectTemplate = {
  slug: 'new-project', index_label: '08', title: 'New project', domain: 'Engineering', status: 'Draft',
  year: '2026', question: '', thesis: '', summary: '', featured: false, published: false, sort_order: 80,
  metrics: [], pipeline: [], trace: {}, sections: [], links: [], technologies: [], extra: {},
}
const noteTemplate = {
  slug: 'new-field-note', title: 'New field note', excerpt: '', body: '', note_type: 'Observation', tags: [],
  project_slug: null, reading_minutes: 3, published_at: null, published: false, featured: false,
  content_blocks: [], seo: {},
}


function AdminLogin({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await onLogin(username, password) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Login failed') } finally { setBusy(false) }
  }
  return <main className="admin-login"><form onSubmit={submit}><span>Portfolio / administration</span><h1>Observer access</h1><p>Sign in with the admin username and password. The session is stored only in this browser tab.</p><label><span>Username</span><input type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoFocus required autoComplete="username" /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="admin-error">{error}</p>}<button disabled={busy}>{busy ? 'Verifying…' : 'Open control room →'}</button><a href="/">← Return to portfolio</a></form></main>
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('portfolio_admin_key') || '')
  const [verified, setVerified] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<RecordValue>({})
  const [projects, setProjects] = useState<RecordValue[]>([])
  const [notes, setNotes] = useState<RecordValue[]>([])
  const [settings, setSettings] = useState<RecordValue[]>([])
  const [pageSections, setPageSections] = useState<RecordValue[]>([])
  const [pageName, setPageName] = useState('home')
  const [media, setMedia] = useState<RecordValue[]>([])
  const [mediaFilter, setMediaFilter] = useState('all')
  const [inbox, setInbox] = useState<RecordValue[]>([])
  const [rag, setRag] = useState<RecordValue>({})
  const [sources, setSources] = useState<RecordValue[]>([])
  const [knowledgeUploads, setKnowledgeUploads] = useState<RecordValue[]>([])
  const [selected, setSelected] = useState<RecordValue | null>(null)
  const [editorMode, setEditorMode] = useState<'project' | 'note' | 'profile' | 'setting' | 'page' | null>(null)
  const [helperInput, setHelperInput] = useState('')
  const [helperMessages, setHelperMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [helperProposal, setHelperProposal] = useState<RecordValue | null>(null)
  const [helperBusy, setHelperBusy] = useState(false)

  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }
  const guard = (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : 'Request failed'
    setError(message)
    if (reason instanceof ApiError && reason.status === 401) logout()
  }

  const loadCore = useCallback(async (key = adminKey) => {
    setLoading(true); setError('')
    try {
      const [profileData, projectData, noteData, settingData, mediaData, inboxData, uploadData] = await Promise.all([
        adminApi.get<RecordValue>('/profile', key), adminApi.get<RecordValue[]>('/projects/admin', key),
        adminApi.get<RecordValue[]>('/field-notes/admin', key), adminApi.get<RecordValue[]>('/site/settings', key),
        adminApi.get<RecordValue[]>('/media-assets', key), adminApi.get<RecordValue[]>('/contact', key),
        adminApi.get<RecordValue[]>('/knowledge-documents', key).catch((reason) => {
          if (reason instanceof ApiError && reason.status === 404) return []
          throw reason
        }),
      ])
      setProfile(profileData); setProjects(projectData); setNotes(noteData); setSettings(settingData); setMedia(mediaData); setInbox(inboxData); setKnowledgeUploads(uploadData)
      try { setRag(await adminApi.get<RecordValue>('/ai/status', key)); setSources(await adminApi.get<RecordValue[]>('/ai/sources', key)) } catch { setRag({ status: 'Not indexed' }); setSources([]) }
      setVerified(true)
    } finally { setLoading(false) }
  }, [adminKey])

  const login = async (username: string, password: string) => {
    const { token } = await adminApi.login(username, password)
    sessionStorage.setItem('portfolio_admin_key', token); setAdminKey(token); await loadCore(token)
  }
  const logout = () => { sessionStorage.removeItem('portfolio_admin_key'); setAdminKey(''); setVerified(false) }
  useEffect(() => { if (adminKey && !verified) loadCore(adminKey).catch(guard) }, [])

  const loadPage = async (page = pageName) => {
    try { setPageSections(await adminApi.get<RecordValue[]>(`/site/pages/${page}/admin`, adminKey)) } catch (reason) { guard(reason) }
  }
  useEffect(() => {
    if (!verified) return
    if (tab === 'content') void loadPage(pageName)
    if (tab === 'home') void loadPage('home')
    if (tab === 'contact-page') void loadPage('contact')
  }, [verified, tab, pageName])

  const savePageForm = async (page: 'home' | 'contact', content: RecordValue) => {
    setLoading(true); setError('')
    try {
      const existing = pageSections.find((item) => item.section === 'page')
      const existingContent = existing?.content && typeof existing.content === 'object' && !Array.isArray(existing.content) ? existing.content as RecordValue : {}
      const mergedContent = { ...existingContent, ...content }
      if (existing?.id) await adminApi.put(`/site/pages/${existing.id}`, { page, section: 'page', sort_order: Number(existing.sort_order ?? 0), enabled: true, content: mergedContent }, adminKey)
      else await adminApi.post('/site/pages', { page, section: 'page', sort_order: 0, enabled: true, content: mergedContent }, adminKey)
      await loadPage(page); flash(`${page === 'home' ? 'Home' : 'Contact'} page saved`)
    } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const openEditor = (mode: typeof editorMode, item: RecordValue) => { setEditorMode(mode); setSelected(structuredClone(item)) }
  const closeEditor = () => { setEditorMode(null); setSelected(null) }

  const saveEditor = async () => {
    if (!selected || !editorMode) return
    setLoading(true); setError('')
    try {
      if (editorMode === 'profile') {
        const { id, created_at, updated_at, ...payload } = selected; void id; void created_at; void updated_at
        setProfile(await adminApi.put('/profile', payload, adminKey))
      }
      if (editorMode === 'project') {
        const isNew = !selected.id; const { id, created_at, updated_at, ...payload } = selected; void id; void created_at; void updated_at
        if (isNew) await adminApi.post('/projects', payload, adminKey)
        else { const { slug, ...patch } = payload; await adminApi.patch(`/projects/${slug}`, patch, adminKey) }
        setProjects(await adminApi.get('/projects/admin', adminKey))
      }
      if (editorMode === 'note') {
        const isNew = !selected.id; const { id, created_at, updated_at, ...payload } = selected; void id; void created_at; void updated_at
        if (isNew) await adminApi.post('/field-notes', payload, adminKey)
        else { const { slug, ...patch } = payload; await adminApi.patch(`/field-notes/${slug}`, patch, adminKey) }
        setNotes(await adminApi.get('/field-notes/admin', adminKey))
      }
      if (editorMode === 'setting') {
        const { id, key, created_at, updated_at, ...payload } = selected; void id; void created_at; void updated_at
        await adminApi.put(`/site/settings/${key}`, payload, adminKey); setSettings(await adminApi.get('/site/settings', adminKey))
      }
      if (editorMode === 'page') {
        const isNew = !selected.id; const { id, created_at, updated_at, ...payload } = selected; void created_at; void updated_at
        if (isNew) await adminApi.post('/site/pages', payload, adminKey)
        else await adminApi.put(`/site/pages/${id}`, payload, adminKey)
        await loadPage()
      }
      flash('Changes saved'); closeEditor()
    } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const remove = async (kind: 'project' | 'note' | 'media' | 'contact' | 'page', item: RecordValue) => {
    if (!window.confirm(`Delete ${String(item.title || item.filename || item.name || 'this record')}?`)) return
    try {
      if (kind === 'project') { await adminApi.delete(`/projects/${item.slug}`, adminKey); setProjects(await adminApi.get('/projects/admin', adminKey)) }
      if (kind === 'note') { await adminApi.delete(`/field-notes/${item.slug}`, adminKey); setNotes(await adminApi.get('/field-notes/admin', adminKey)) }
      if (kind === 'media') { await adminApi.delete(`/media-assets/${item.id}`, adminKey); setMedia(await adminApi.get('/media-assets', adminKey)) }
      if (kind === 'contact') { await adminApi.delete(`/contact/${item.id}`, adminKey); setInbox(await adminApi.get('/contact', adminKey)) }
      if (kind === 'page') { await adminApi.delete(`/site/pages/${item.id}`, adminKey); await loadPage() }
      flash('Record deleted')
    } catch (reason) { guard(reason) }
  }

  const uploadMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    try { await adminApi.upload('/media-assets', form, adminKey); setMedia(await adminApi.get('/media-assets', adminKey)); event.currentTarget.reset(); flash('Media uploaded') } catch (reason) { guard(reason) }
  }

  const togglePersonalArchive = async (mediaItem: RecordValue) => {
    setLoading(true); setError('')
    try {
      const extra = profile.extra && typeof profile.extra === 'object' && !Array.isArray(profile.extra) ? profile.extra as RecordValue : {}
      const current = Array.isArray(extra.lifeImages) ? extra.lifeImages.filter((item): item is RecordValue => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : []
      const isAssigned = current.some((item) => item.media_id === mediaItem.id)
      const lifeImages = isAssigned
        ? current.filter((item) => item.media_id !== mediaItem.id)
        : [...current, {
            media_id: mediaItem.id,
            src: mediaItem.public_url,
            alt: mediaItem.alt_text || 'A moment from life outside the screen',
            caption: mediaItem.alt_text || undefined,
            size: ['large', 'wide', 'tall', 'medium', 'small'][current.length % 5],
          }]
      const { id, created_at, updated_at, avatar_url, avatar_alt, ...payload } = profile
      void id; void created_at; void updated_at; void avatar_url; void avatar_alt
      setProfile(await adminApi.put('/profile', { ...payload, extra: { ...extra, lifeImages } }, adminKey))
      flash(isAssigned ? 'Removed from Personal Archives' : 'Added to Personal Archives')
    } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const assignMedia = async (kind: 'avatar' | 'project' | 'note', mediaItem: RecordValue, target?: string) => {
    setLoading(true); setError('')
    try {
      if (kind === 'avatar') {
        const { id, created_at, updated_at, avatar_url, avatar_alt, ...payload } = profile
        void id; void created_at; void updated_at; void avatar_url; void avatar_alt
        setProfile(await adminApi.put('/profile', { ...payload, avatar_media_id: mediaItem.id }, adminKey))
      }
      if (kind === 'project' && target) {
        await adminApi.patch(`/projects/${target}`, { cover_media_id: mediaItem.id }, adminKey)
        setProjects(await adminApi.get('/projects/admin', adminKey))
      }
      if (kind === 'note' && target) {
        await adminApi.patch(`/field-notes/${target}`, { cover_media_id: mediaItem.id }, adminKey)
        setNotes(await adminApi.get('/field-notes/admin', adminKey))
      }
      flash(kind === 'avatar' ? 'Profile avatar assigned' : kind === 'project' ? 'Project cover assigned' : 'Field Note cover assigned')
    } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const uploadKnowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    setLoading(true); setError('')
    try {
      await adminApi.upload('/knowledge-documents', form, adminKey)
      setKnowledgeUploads(await adminApi.get('/knowledge-documents', adminKey))
      event.currentTarget.reset(); flash('Document uploaded and queued for indexing')
    } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const updateKnowledge = async (item: RecordValue, changes: RecordValue) => {
    try {
      await adminApi.patch(`/knowledge-documents/${item.id}`, changes, adminKey)
      setKnowledgeUploads(await adminApi.get('/knowledge-documents', adminKey)); flash('Knowledge document updated')
    } catch (reason) { guard(reason) }
  }

  const deleteKnowledge = async (item: RecordValue) => {
    if (!window.confirm(`Delete ${String(item.title || item.filename || 'this document')}?`)) return
    try {
      await adminApi.delete(`/knowledge-documents/${item.id}`, adminKey)
      setKnowledgeUploads(await adminApi.get('/knowledge-documents', adminKey)); flash('Knowledge document deleted')
    } catch (reason) { guard(reason) }
  }

  const askHelper = async (event: FormEvent) => {
    event.preventDefault()
    const message = helperInput.trim(); if (!message) return
    const previous = helperMessages; setHelperMessages([...previous, { role: 'user', content: message }]); setHelperInput(''); setHelperBusy(true); setError('')
    try {
      const response = await adminApi.post<{ message: string; proposal: RecordValue | null }>('/admin-assistant/chat', { message, history: previous.slice(-8) }, adminKey)
      setHelperMessages((items) => [...items, { role: 'assistant', content: response.message }]); setHelperProposal(response.proposal)
    } catch (reason) { guard(reason) } finally { setHelperBusy(false) }
  }

  const executeHelperProposal = async () => {
    if (!helperProposal || !window.confirm('Apply this proposal to the portfolio database?')) return
    setHelperBusy(true)
    try {
      const result = await adminApi.post<{ message: string }>('/admin-assistant/execute', { proposal: helperProposal }, adminKey)
      setHelperMessages((items) => [...items, { role: 'assistant', content: result.message }]); setHelperProposal(null); await loadCore(); flash('Assistant change applied')
    } catch (reason) { guard(reason) } finally { setHelperBusy(false) }
  }

  const reindex = async (force = false) => {
    setLoading(true)
    try { const result = await adminApi.post<RecordValue>('/ai/reindex', { force, source_types: null }, adminKey); flash(`Indexed ${result.chunks_embedded || 0} chunks`); setRag(await adminApi.get('/ai/status', adminKey)); setSources(await adminApi.get('/ai/sources', adminKey)) } catch (reason) { guard(reason) } finally { setLoading(false) }
  }

  const pageContent = (page: 'home' | 'contact') => {
    const relevant = pageSections.filter((item) => !item.page || item.page === page)
    return relevant.filter((item) => item.enabled !== false).reduce<RecordValue>((result, item) => {
      const content = item.content && typeof item.content === 'object' && !Array.isArray(item.content) ? item.content as RecordValue : {}
      return { ...result, ...content }
    }, {})
  }
  const settingValue = (key: string): unknown => settings.find((item) => item.key === key || String(item.key).endsWith(`.${key}`))?.value
  const homeStored = pageContent('home')
  const contactStored = pageContent('contact')
  const homeDefaults: RecordValue = {
    eyebrow: String(settingValue('eyebrow') || 'Portfolio / ML systems'),
    name: String(homeStored.name || profile.name || 'Harsimranjit'), role: String(homeStored.role || profile.role || 'ML / AI Engineer'),
    disciplines: homeStored.disciplines || settingValue('disciplines') || ['Machine learning', 'Infrastructure', 'Evaluation'],
    descent_lines: homeStored.descent_lines || homeStored.lines || ['The result is only the surface.', 'The interesting part is', 'what made it possible.'],
    home_about_text: String(homeStored.home_about_text || profile.headline || ''), projects_heading: String(homeStored.projects_heading || 'Selected work'),
    projects_intro: String(homeStored.projects_intro || ''), projects_count: String(homeStored.projects_count || ''), experience_count: String(homeStored.experience_count || ''),
    tags: homeStored.tags || ['All', 'Data Science', 'Web Development', 'C++'], primary_label: String(homeStored.primary_label || 'View work'), primary_url: String(homeStored.primary_url || '/work'),
    secondary_label: String(homeStored.secondary_label || 'About'), secondary_url: String(homeStored.secondary_url || '/about'), ...homeStored,
  }
  const contactDefaults: RecordValue = {
    rail_label: 'Contact / final depth', channel_status: 'Channel open', label: 'Next / conversation', title: 'Have something interesting to build?',
    intro: String(profile.biography || 'I am interested in ML systems, model infrastructure, evaluation, and engineering problems where understanding the path matters as much as the result.'),
    response: 'As soon as the signal is clear', form_heading: 'Transmission record', name_label: 'Name', email_label: 'Return address', subject_label: 'Subject', message_label: 'Message',
    subject_options: ['ML systems', 'Model infrastructure', 'Research / experimentation', 'Something else'], submit_label: 'Send transmission', sending_label: 'Sending…',
    success_message: 'Transmission received. I’ll be in touch.', privacy_text: 'Your message will be sent securely through this site.', ...contactStored,
  }

  const counts = useMemo(() => [
    ['Projects', projects.length], ['Published', projects.filter((item) => item.published).length], ['Field Notes', notes.length],
    ['Messages', inbox.filter((item) => item.status === 'new').length], ['Media', media.length], ['RAG chunks', Number(rag.chunks || 0)],
  ], [projects, notes, inbox, media, rag])

  if (!verified) return <AdminLogin onLogin={login} />

  const tabs: [Tab, string][] = [['overview','Overview'],['helper','Content Helper'],['profile','Identity & Links'],['home','Home page'],['about','About page'],['contact-page','Contact page'],['projects','Projects'],['notes','Field Notes'],['content','Site Content'],['media','Media'],['inbox','Inbox'],['rag','AI / RAG']]

  return <main className="admin-page">
    <aside className="admin-sidebar"><a href="/" className="admin-brand">h.<span>control</span></a><nav>{tabs.map(([id,label]) => <button className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav><div><span>{API_BASE}</span><button onClick={logout}>Lock session</button></div></aside>
    <section className="admin-main">
      <header className="admin-header"><div><span>Portfolio administration</span><h1>{tabs.find(([id]) => id === tab)?.[1]}</h1></div><div><i /> API connected <button onClick={() => loadCore().catch(guard)}>Refresh</button></div></header>
      {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error-banner">{error}<button onClick={() => setError('')}>×</button></div>}

      {tab === 'overview' && <><div className="admin-metrics">{counts.map(([label,value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="admin-overview-grid"><section><h2>Quick actions</h2><button onClick={() => { setTab('projects'); openEditor('project', projectTemplate) }}>New project</button><button onClick={() => { setTab('notes'); openEditor('note', noteTemplate) }}>New Field Note</button><button onClick={() => setTab('inbox')}>Review messages</button><button onClick={() => setTab('rag')}>Inspect knowledge index</button></section><section><h2>System state</h2><p><span>Backend</span>Connected</p><p><span>Knowledge documents</span>{String(rag.documents ?? 'Not indexed')}</p><p><span>Embedding model</span>{String(rag.embedding_model ?? 'Not configured')}</p><p><span>New messages</span>{String(counts[3][1])}</p></section></div></>}

      {tab === 'helper' && <section className="admin-helper"><div className="admin-helper__intro"><span>Private content copilot</span><h2>Describe what you want to publish or change.</h2><p>Ask for a Field Note draft, a project update, profile copy, a site setting, or a new page section. The helper proposes structured data first and writes only after your confirmation.</p><div><button onClick={() => setHelperInput('Draft a Field Note about a failed evaluation hiding inside an average metric.')}>Draft a Field Note</button><button onClick={() => setHelperInput('Create a draft project record for an ML systems experiment.')}>Draft a project</button><button onClick={() => setHelperInput('Improve my About profile headline without inventing any experience.')}>Improve profile copy</button><button onClick={() => { setHelperMessages([]); setHelperProposal(null); setHelperInput('') }}>New chat</button></div></div><div className="admin-helper__chat"><div className="admin-helper__messages">{helperMessages.length === 0 && <p className="admin-helper__empty">No conversation yet. The helper uses current database records as context.</p>}{helperMessages.map((message,index) => <article className={`is-${message.role}`} key={`${message.role}-${index}`}><span>{message.role}</span><p>{message.content}</p></article>)}{helperBusy && <article className="is-assistant"><span>assistant</span><p>Preparing a structured proposal…</p></article>}</div>{helperProposal && <div className="admin-helper__proposal"><header><div><span>Review required</span><strong>{String(helperProposal.summary || helperProposal.action)}</strong></div><button onClick={() => setHelperProposal(null)}>Discard</button></header><pre>{JSON.stringify(helperProposal, null, 2)}</pre><button onClick={executeHelperProposal} disabled={helperBusy}>Confirm and apply →</button></div>}<form onSubmit={askHelper}><textarea rows={3} value={helperInput} onChange={(event) => setHelperInput(event.target.value)} placeholder="Create a Field Note about…" /><button disabled={helperBusy || !helperInput.trim()}>Send →</button></form></div></section>}

      {tab === 'profile' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Public profile</h2><p>Identity, links, working set, current activity, and résumé information.</p></div><button onClick={() => openEditor('profile', profile)}>Edit profile</button></div><pre>{JSON.stringify(profile, null, 2)}</pre></section>}

      {tab === 'home' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Home page</h2><p>Manage all homepage copy and display settings from one form.</p></div></div><SitePageForm page="home" value={homeDefaults} saving={loading} onSave={(content) => savePageForm('home', content)} /></section>}

      {tab === 'about' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>About page</h2><p>Bio, experience, domains, technologies, and the bookshelf shown on the About page.</p></div></div><AboutEditor profile={profile} adminKey={adminKey} onSaved={(saved) => { setProfile(saved); flash('About content saved') }} onError={guard} /></section>}

      {tab === 'contact-page' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Contact page</h2><p>Manage contact copy, form labels, subject options, messages, and SEO from one form.</p></div></div><SitePageForm page="contact" value={contactDefaults} saving={loading} onSave={(content) => savePageForm('contact', content)} /></section>}

      {tab === 'projects' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Project records</h2><p>Manage homepage cards and full engineering records.</p></div><button onClick={() => openEditor('project', projectTemplate)}>New project</button></div><div className="admin-table">{projects.map((item) => <article key={String(item.id)}><span>{String(item.index_label)}</span><div><strong>{String(item.title)}</strong><small>{String(item.domain)} · {String(item.status)}</small></div><em className={item.published ? 'is-live' : ''}>{item.published ? 'Published' : 'Draft'}</em><button onClick={() => openEditor('project', item)}>Edit</button><button className="is-danger" onClick={() => remove('project', item)}>Delete</button></article>)}</div></section>}

      {tab === 'notes' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Field Notes</h2><p>Create, edit, publish, and connect observations to projects.</p></div><button onClick={() => openEditor('note', noteTemplate)}>New note</button></div><div className="admin-table">{notes.map((item) => <article key={String(item.id)}><span>{String(item.note_type)}</span><div><strong>{String(item.title)}</strong><small>{Array.isArray(item.tags) ? item.tags.join(' · ') : ''}</small></div><em className={item.published ? 'is-live' : ''}>{item.published ? 'Published' : 'Draft'}</em><button onClick={() => openEditor('note', item)}>Edit</button><button className="is-danger" onClick={() => remove('note', item)}>Delete</button></article>)}</div></section>}

      {tab === 'content' && <><section className="admin-panel"><div className="admin-panel__head"><div><h2>Site settings</h2><p>Navigation, footer, hero, orb, and other small global values.</p></div></div><div className="admin-table">{settings.map((item) => <article key={String(item.id)}><span>{String(item.id)}</span><div><strong>{String(item.key)}</strong><small>{String(item.description || '')}</small></div><em className={item.is_public ? 'is-live' : ''}>{item.is_public ? 'Public' : 'Private'}</em><button onClick={() => openEditor('setting', item)}>Edit</button></article>)}</div></section><section className="admin-panel"><div className="admin-panel__head"><div><h2>Page sections</h2><p>Small editable content blocks grouped by route.</p></div><div className="admin-inline"><select value={pageName} onChange={(event) => setPageName(event.target.value)}>{['home','work','field-notes','about','contact','footer'].map((page) => <option key={page}>{page}</option>)}</select><button onClick={() => openEditor('page', { page: pageName, section: 'new_section', sort_order: pageSections.length, enabled: true, content: {} })}>New section</button></div></div><div className="admin-table">{pageSections.map((item) => <article key={String(item.id)}><span>{String(item.sort_order)}</span><div><strong>{String(item.section)}</strong><small>{JSON.stringify(item.content).slice(0,90)}</small></div><em className={item.enabled ? 'is-live' : ''}>{item.enabled ? 'Enabled' : 'Hidden'}</em><button onClick={() => openEditor('page', item)}>Edit</button><button className="is-danger" onClick={() => remove('page', item)}>Delete</button></article>)}</div></section></>}

      {tab === 'media' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Media library</h2><p>Upload once, then assign the asset to your profile, Personal Archives, a project, or a Field Note.</p><select className="admin-media-filter" value={mediaFilter} onChange={(event) => setMediaFilter(event.target.value)}><option value="all">All media</option><option value="unused">Unused</option><option value="profile">Profile / About</option><option value="project">Projects</option><option value="field_note">Field Notes</option><option value="general">General</option></select></div><form className="admin-upload" onSubmit={uploadMedia}><input type="file" name="file" accept="image/*,application/pdf,video/*" required /><input name="alt_text" placeholder="Alt text" required /><select name="purpose" defaultValue="general"><option value="general">General asset</option><option value="profile">Profile portrait</option><option value="about">About page</option><option value="project">Project asset</option><option value="field_note">Field Note asset</option></select><select name="related_project" defaultValue=""><option value="">No related project</option>{projects.map((project) => <option value={String(project.slug)} key={String(project.id)}>{String(project.title)}</option>)}</select><button>Upload</button></form></div><div className="admin-media-grid">{media.map((item) => { const isImage = String(item.mime_type).startsWith('image/'); const projectUse = projects.find((project) => project.cover_media_id === item.id); const noteUse = notes.find((note) => note.cover_media_id === item.id); const isAvatar = profile.avatar_media_id === item.id; const extra = profile.extra && typeof profile.extra === 'object' && !Array.isArray(profile.extra) ? profile.extra as RecordValue : {}; const archiveImages = Array.isArray(extra.lifeImages) ? extra.lifeImages : []; const isArchived = archiveImages.some((archive) => Boolean(archive) && typeof archive === 'object' && !Array.isArray(archive) && (archive as RecordValue).media_id === item.id); const usage = isAvatar ? 'Profile avatar' : isArchived ? 'Personal Archives' : projectUse ? `Project · ${String(projectUse.title)}` : noteUse ? `Field Note · ${String(noteUse.title)}` : 'Unused'; const category = isAvatar ? 'profile' : isArchived ? 'about' : projectUse ? 'project' : noteUse ? 'field_note' : String(item.purpose || 'general'); if (mediaFilter !== 'all' && !(mediaFilter === 'unused' ? usage === 'Unused' : category === mediaFilter || (mediaFilter === 'profile' && category === 'about'))) return null; return <article className={isAvatar || isArchived ? 'is-selected' : ''} key={String(item.id)}>{isImage ? <img src={String(item.public_url)} alt={String(item.alt_text || '')} /> : <div>{String(item.kind)}</div>}<strong>{String(item.filename)}</strong><span>{Math.round(Number(item.size_bytes)/1024)} KB · {String(item.alt_text || 'No alt text')}</span><span className={usage === 'Unused' ? 'admin-media-status is-unused' : 'admin-media-status is-assigned'}>{usage} · {String(item.purpose || 'general').replace('_', ' ')}</span>{Boolean(item.related_project) && <span>Related to {String(item.related_project)}</span>}{isImage && <><button onClick={() => assignMedia('avatar', item)}>{isAvatar ? 'Current profile image' : 'Set as profile image'}</button><button onClick={() => togglePersonalArchive(item)}>{isArchived ? 'Remove from Personal Archives' : 'Add to Personal Archives'}</button><select defaultValue="" aria-label={`Assign ${String(item.filename)} to a project`} onChange={(event) => { if (event.target.value) void assignMedia('project', item, event.target.value); event.target.value = '' }}><option value="">Assign project cover…</option>{projects.map((project) => <option value={String(project.slug)} key={String(project.id)}>{String(project.title)}</option>)}</select><select defaultValue="" aria-label={`Assign ${String(item.filename)} to a Field Note`} onChange={(event) => { if (event.target.value) void assignMedia('note', item, event.target.value); event.target.value = '' }}><option value="">Assign Field Note cover…</option>{notes.map((note) => <option value={String(note.slug)} key={String(note.id)}>{String(note.title)}</option>)}</select></>}<a href={String(item.public_url)} target="_blank" rel="noreferrer">Open asset ↗</a><button onClick={() => remove('media', item)}>Delete</button></article> })}</div></section>}

      {tab === 'inbox' && <section className="admin-panel"><div className="admin-panel__head"><div><h2>Contact inbox</h2><p>Messages submitted through the portfolio contact system.</p></div></div><div className="admin-inbox">{inbox.map((item) => <article key={String(item.id)}><header><div><strong>{String(item.name)}</strong><a href={`mailto:${String(item.email)}`}>{String(item.email)}</a></div><select value={String(item.status)} onChange={async (event) => { await adminApi.patch(`/contact/${item.id}`, { status: event.target.value }, adminKey); setInbox(await adminApi.get('/contact', adminKey)) }}>{['new','read','replied','archived','spam'].map((status) => <option key={status}>{status}</option>)}</select></header><span>{String(item.topic)}</span><p>{String(item.message)}</p><footer><time>{new Date(String(item.created_at)).toLocaleString()}</time><button onClick={() => remove('contact', item)}>Delete</button></footer></article>)}</div></section>}

      {tab === 'rag' && <><div className="admin-metrics">{[['Documents',rag.documents||0],['Chunks',rag.chunks||0],['Embedded',rag.embedded_chunks||0],['Uploads',knowledgeUploads.length],['Model',rag.embedding_model||'—']].map(([label,value]) => <div key={String(label)}><strong>{String(value)}</strong><span>{String(label)}</span></div>)}</div><section className="admin-panel"><div className="admin-panel__head"><div><h2>Knowledge library</h2><p>Upload PDF, DOCX, Markdown, or text. Only public, enabled documents are available to the visitor assistant.</p></div><form className="admin-upload admin-upload--knowledge" onSubmit={uploadKnowledge}><input type="file" name="file" accept=".pdf,.docx,.md,.markdown,.txt" required /><input name="title" placeholder="Document title" required /><input name="related_project" placeholder="Related project slug" /><select name="visibility" defaultValue="public" title="This controls chatbot indexing; the current R2 bucket itself is public"><option value="public">Public + indexed</option><option value="internal">Excluded from public chat</option><option value="private">Excluded from all public retrieval</option></select><button disabled={loading}>Upload</button></form></div><div className="admin-table">{knowledgeUploads.map((item) => <article key={String(item.id)}><span>{String(item.document_type)}</span><div><strong>{String(item.title)}</strong><small>{String(item.filename)} · {String(item.chunk_count || 0)} chunks</small></div><em className={item.status === 'indexed' ? 'is-live' : ''}>{String(item.visibility)} · {String(item.status)}</em><button onClick={() => updateKnowledge(item, { enabled: !item.enabled })}>{item.enabled ? 'Disable' : 'Enable'}</button><button onClick={() => updateKnowledge(item, { visibility: item.visibility === 'public' ? 'private' : 'public' })}>{item.visibility === 'public' ? 'Make private' : 'Publish'}</button><button onClick={async () => { await adminApi.post(`/knowledge-documents/${item.id}/reindex`, {}, adminKey); setKnowledgeUploads(await adminApi.get('/knowledge-documents', adminKey)); flash('Reindex queued') }}>Reindex</button><button className="is-danger" onClick={() => deleteKnowledge(item)}>Delete</button></article>)}</div></section><section className="admin-panel"><div className="admin-panel__head"><div><h2>Knowledge pipeline</h2><p>Rebuild embeddings after importing or editing portfolio evidence.</p></div><div className="admin-inline"><button disabled={loading} onClick={() => reindex(false)}>Incremental reindex</button><button disabled={loading} onClick={() => reindex(true)}>Force rebuild</button></div></div><div className="admin-table">{sources.map((item) => <article key={String(item.id)}><span>{String(item.source_type)}</span><div><strong>{String(item.title)}</strong><small>{String(item.url)}</small></div><em className={item.enabled ? 'is-live' : ''}>{item.enabled ? 'Enabled' : 'Disabled'}</em><button onClick={async () => { await adminApi.patch(`/ai/sources/${item.id}/toggle`, {}, adminKey); setSources(await adminApi.get('/ai/sources', adminKey)) }}>Toggle</button></article>)}</div></section></>}
    </section>

    {editorMode && selected && <div className="admin-modal" role="dialog" aria-modal="true"><div><header><div><span>{editorMode}</span><h2>{String(selected.title || selected.key || selected.name || 'New record')}</h2></div><button onClick={closeEditor} aria-label="Close editor">×</button></header>{editorMode === 'project' ? <ProjectEditor value={selected} media={media} notes={notes} onChange={setSelected} /> : editorMode ? <StructuredRecordEditor mode={editorMode} value={selected} media={media} onChange={setSelected} /> : null}<footer><button onClick={closeEditor}>Cancel</button><button onClick={saveEditor} disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button></footer></div></div>}
  </main>
}
