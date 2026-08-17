import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__main">
          <section className="site-footer__identity" aria-label="Identity and contact">
            <p className="site-footer__name">Harsimranjit</p>
            <p className="site-footer__role">ML / AI engineer</p>
            <nav className="site-footer__social" aria-label="Social links">
              <a href="https://github.com/">GitHub</a>
              <a href="https://www.linkedin.com/">LinkedIn</a>
              <a href="mailto:hello@example.com">Email</a>
            </nav>
          </section>

          <section className="site-footer__notes" aria-labelledby="field-notes-title">
            <p id="field-notes-title" className="site-footer__label">Field notes</p>
            <p className="site-footer__statement">Experiments, implementation notes, failures, and things still unresolved.</p>
            <a href="/field-notes">Read field notes <span aria-hidden="true">↗</span></a>
          </section>
        </div>

        <p className="site-footer__place">Toronto · 2026</p>
      </div>
    </footer>
  )
}
