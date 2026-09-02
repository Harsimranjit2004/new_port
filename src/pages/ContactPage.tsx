import { useEffect, useState, type FormEvent } from 'react'
import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import { publicApi, type PublicProfile, type SitePageSection } from '../lib/publicApi'
import './ContactPage.css'

export default function ContactPage() {
  const [profile, setProfile] = useState<PublicProfile>({ name: 'Harsimranjit', role: 'ML / AI Engineer', location: 'Toronto, Canada', email: 'hello@example.com' })
  const [content, setContent] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.allSettled([publicApi.profile(), publicApi.contactPage()]).then(([profileResult, pageResult]) => {
      if (!active) return
      if (profileResult.status === 'fulfilled') setProfile((fallback) => ({ ...fallback, ...profileResult.value }))
      if (pageResult.status === 'fulfilled') {
        const payload = pageResult.value
        if (Array.isArray(payload)) {
          const merged = (payload as SitePageSection[]).filter((section) => section.enabled !== false).reduce<Record<string, unknown>>((result, section) => ({ ...result, ...(section.content ?? {}) }), {})
          setContent(merged)
        } else setContent(payload)
      }
    })
    return () => { active = false }
  }, [])

  const copy = (key: string, fallback: string) => typeof content[key] === 'string' && content[key] ? String(content[key]) : fallback
  const subjectOptions = Array.isArray(content.subject_options) && content.subject_options.length ? content.subject_options.map(String) : ['ML systems', 'Model infrastructure', 'Research / experimentation', 'Something else']

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('busy')
    setError('')
    try {
      await publicApi.contact({
        name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''),
        topic: String(data.get('topic') || 'General inquiry'), message: String(data.get('message') ?? ''), website: '',
      })
      form.reset()
      setStatus('success')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The transmission could not be sent. Please try again.')
      setStatus('error')
    }
  }

  return (
    <main className="contact-page">
      <Navbar submergedAt={0} />

      <OceanBackground screens={1} startDepth="shallow" endDepth="deep" showSurfaceWaves className="contact-ocean">
      <div className="contact-shell">
        <div className="contact-rail">
          <span>Contact / final depth</span>
          <i aria-hidden="true" />
          <span>Channel open</span>
        </div>

        <section className="contact-layout">
          <div className="contact-intro">
            <span className="contact-label">Next / conversation</span>
            <h1>{copy('title', copy('heading', 'Have something interesting to build?'))}</h1>
            <p>{copy('intro', copy('description', profile.biography || 'I am interested in ML systems, model infrastructure, evaluation, and engineering problems where understanding the path matters as much as the result.'))}</p>

            <dl className="contact-readout">
              <div><dt>Based in</dt><dd>{profile.location}</dd></div>
              <div><dt>Focus</dt><dd>{profile.role}</dd></div>
              <div><dt>Response</dt><dd>{copy('response', 'As soon as the signal is clear')}</dd></div>
            </dl>

            <nav className="contact-channels" aria-label="Other contact channels">
              <a href={`mailto:${profile.email}`}>Email ↗</a>
              {(profile.social_links ?? []).map((link) => <a href={link.url} key={link.url}>{link.label} ↗</a>)}
            </nav>
          </div>

          <form className="contact-form" onSubmit={submit}>
            <div className="contact-form__head">
              <span>Transmission record</span>
              <span><i aria-hidden="true" /> {status === 'busy' ? 'Sending' : status === 'success' ? 'Received' : status === 'error' ? 'Retry' : 'Ready'}</span>
            </div>
            <label>
              <span>01 / {copy('name_label', 'Name')}</span>
              <input type="text" name="name" autoComplete="name" required placeholder="Your name" />
            </label>
            <label>
              <span>02 / {copy('email_label', 'Return address')}</span>
              <input type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
            </label>
            <label>
              <span>03 / {copy('subject_label', 'Subject')}</span>
              <select name="topic" defaultValue="">
                <option value="" disabled>Select a signal</option>
                {subjectOptions.map((option) => <option key={option}>{option}</option>) }
              </select>
            </label>
            <label>
              <span>04 / {copy('message_label', 'Message')}</span>
              <textarea name="message" required rows={6} placeholder="What are you building or investigating?" />
            </label>
            <div className="contact-form__send">
              <p aria-live="polite">{status === 'success' ? copy('success_message', 'Transmission received. I’ll be in touch.') : status === 'error' ? error : 'Your message will be sent securely through this site.'}</p>
              <button type="submit" disabled={status === 'busy'}>{status === 'busy' ? copy('sending_label', 'Sending…') : copy('submit_label', 'Send transmission')} <span aria-hidden="true">↗</span></button>
            </div>
          </form>
        </section>

        <footer className="contact-end">
          <span>Depth / abyss</span>
          <span>{profile.name} · {profile.role}</span>
          <a href="/">Return to surface ↑</a>
        </footer>
      </div>
      <Footer />
      </OceanBackground>
    </main>
  )
}
