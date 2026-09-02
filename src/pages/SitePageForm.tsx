import { useEffect, useState } from 'react'

type RecordValue = Record<string, unknown>
type Page = 'home' | 'contact'

const text = (value: unknown) => typeof value === 'string' ? value : ''
const list = (value: unknown) => Array.isArray(value) ? value.map(String) : []

export default function SitePageForm({ page, value, saving, onSave }: { page: Page; value: RecordValue; saving: boolean; onSave: (value: RecordValue) => Promise<void> }) {
  const [draft, setDraft] = useState<RecordValue>(value)
  useEffect(() => setDraft(value), [value])
  const set = (key: string, next: unknown) => setDraft((current) => ({ ...current, [key]: next }))
  const input = (key: string, label: string) => <label><span>{label}</span><input value={text(draft[key])} onChange={(event) => set(key, event.target.value)} /></label>
  const area = (key: string, label: string, rows = 4) => <label><span>{label}</span><textarea rows={rows} value={text(draft[key])} onChange={(event) => set(key, event.target.value)} /></label>
  const comma = (key: string, label: string) => <label><span>{label} — comma separated</span><input value={list(draft[key]).join(', ')} onChange={(event) => set(key, event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label>

  return <div className="admin-about"><section><h3>{page === 'home' ? 'Home hero' : 'Contact introduction'}</h3><div className="admin-project-grid">{page === 'home' ? <>{input('eyebrow', 'Eyebrow')}{input('name', 'Display name')}{input('role', 'Professional role')}{comma('disciplines', 'Disciplines')}</> : <>{input('rail_label', 'Rail label')}{input('channel_status', 'Channel status')}{input('label', 'Small label')}{input('title', 'Main heading')}{input('response', 'Response-time text')}</>}</div>{page === 'home' ? <>{area('home_about_text', 'Home About text')}{comma('descent_lines', 'Descent statement lines')}</> : area('intro', 'Introduction')}</section>
    {page === 'home' ? <><section><h3>Project presentation</h3><div className="admin-project-grid">{input('projects_heading', 'Projects heading')}{input('projects_count', 'Projects count override')}{input('experience_count', 'Experience override')}</div>{comma('tags', 'Project tags')}{area('projects_intro', 'Projects introduction')}</section><section><h3>Calls to action</h3><div className="admin-project-grid">{input('primary_label', 'Primary button label')}{input('primary_url', 'Primary button URL')}{input('secondary_label', 'Secondary button label')}{input('secondary_url', 'Secondary button URL')}</div></section></> : <><section><h3>Contact form</h3><div className="admin-project-grid">{input('form_heading', 'Form heading')}{input('name_label', 'Name label')}{input('email_label', 'Email label')}{input('subject_label', 'Subject label')}{input('message_label', 'Message label')}{input('submit_label', 'Submit button')}{input('sending_label', 'Sending text')}</div>{comma('subject_options', 'Subject options')}{area('success_message', 'Success message')}{area('privacy_text', 'Privacy/help text')}</section></>}
    <section><h3>Search & sharing</h3><div className="admin-project-grid">{input('seo_title', 'SEO title')}{input('social_image', 'Social sharing image URL')}</div>{area('seo_description', 'Meta description')}</section>
    <div className="admin-about-actions"><button type="button" onClick={() => setDraft(value)} disabled={saving}>Discard changes</button><button type="button" onClick={() => void onSave(draft)} disabled={saving}>{saving ? 'Updating…' : `Update ${page} page`}</button></div></div>
}
