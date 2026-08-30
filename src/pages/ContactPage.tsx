import { useState, type FormEvent } from 'react'
import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import './ContactPage.css'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const topic = String(data.get('topic') ?? 'General inquiry')
    const message = String(data.get('message') ?? '')
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`)
    const body = encodeURIComponent(`Topic: ${topic}\n\n${message}\n\nFrom: ${name}\nReply to: ${email}`)
    setSent(true)
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`
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
            <h1>Have something interesting to build?</h1>
            <p>I am interested in ML systems, model infrastructure, evaluation, and engineering problems where understanding the path matters as much as the result.</p>

            <dl className="contact-readout">
              <div><dt>Based in</dt><dd>Toronto, Canada</dd></div>
              <div><dt>Focus</dt><dd>ML / AI Engineering</dd></div>
              <div><dt>Response</dt><dd>As soon as the signal is clear</dd></div>
            </dl>

            <nav className="contact-channels" aria-label="Other contact channels">
              <a href="mailto:hello@example.com">Email ↗</a>
              <a href="https://github.com/">GitHub ↗</a>
              <a href="https://www.linkedin.com/">LinkedIn ↗</a>
            </nav>
          </div>

          <form className="contact-form" onSubmit={submit}>
            <div className="contact-form__head">
              <span>Transmission record</span>
              <span><i aria-hidden="true" /> Ready</span>
            </div>
            <label>
              <span>01 / Name</span>
              <input type="text" name="name" autoComplete="name" required placeholder="Your name" />
            </label>
            <label>
              <span>02 / Return address</span>
              <input type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
            </label>
            <label>
              <span>03 / Subject</span>
              <select name="topic" defaultValue="">
                <option value="" disabled>Select a signal</option>
                <option>ML systems</option>
                <option>Model infrastructure</option>
                <option>Research / experimentation</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              <span>04 / Message</span>
              <textarea name="message" required rows={6} placeholder="What are you building or investigating?" />
            </label>
            <div className="contact-form__send">
              <p aria-live="polite">{sent ? 'Opening your email client…' : 'The form prepares an email in your default mail client.'}</p>
              <button type="submit">Send transmission <span aria-hidden="true">↗</span></button>
            </div>
          </form>
        </section>

        <footer className="contact-end">
          <span>Depth / abyss</span>
          <span>Harsimranjit · ML / AI Engineer</span>
          <a href="/">Return to surface ↑</a>
        </footer>
      </div>
      <Footer />
      </OceanBackground>
    </main>
  )
}
