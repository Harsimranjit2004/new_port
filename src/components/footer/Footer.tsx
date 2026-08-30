import { FaGithub, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import './Footer.css'

function Icon({ name }: { name: 'github' | 'linkedin' | 'mail' | 'file' | 'arrow' }) {
  const paths = {
    github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.7a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.77c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    linkedin: <><path d="M6.5 8.2V18M6.5 5.5v.1M10.5 18v-5.4c0-2.2 3.9-2.4 3.9.2V18M10.5 8.2v1.5" /><rect x="3" y="3" width="18" height="18" rx="2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></>,
    file: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6" /></>,
    arrow: <path d="M6 18 18 6M9 6h9v9" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}


export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__identity" aria-label="Identity and external links">
            <div className="site-footer__identity-copy">
              <div className="site-footer__identity-heading">
                <span className="site-footer__brand-mark" aria-hidden="true">h.</span>
                <div><p className="site-footer__name">Harsimranjit<span>.</span></p><p className="site-footer__role">ML / AI Engineer</p></div>
              </div>
            </div>
            <nav className="site-footer__social" aria-label="External links">
              <a href="https://github.com/" aria-label="GitHub"><FaGithub /><span>GitHub</span></a>
              <a href="https://www.linkedin.com/" aria-label="LinkedIn"><FaLinkedinIn /><span>LinkedIn</span></a>
              <a href="https://twitter.com/" aria-label="Twitter"><FaTwitter /><span>Twitter</span></a>
              <a className="site-footer__resume" href="mailto:hello@example.com?subject=R%C3%A9sum%C3%A9%20request"><Icon name="file" /><span>Request résumé</span></a>
            </nav>
          </section>

          <section className="site-footer__navigation" aria-labelledby="footer-navigation-title">
            <p id="footer-navigation-title" className="site-footer__label">Navigation</p>
            <nav aria-label="Footer navigation">
              <a href="/"><span>01</span>Overview</a>
              <a href="/work"><span>02</span>Work</a>
              <a href="/field-notes"><span>03</span>Field Notes</a>
              <a href="/about"><span>04</span>About</a>
              <a href="/contact"><span>05</span>Contact</a>
            </nav>
          </section>

          <section className="site-footer__notes" aria-labelledby="footer-notes-title">
            <div className="site-footer__notes-head">
              <p id="footer-notes-title" className="site-footer__label">Field Note</p>
              <a href="/field-notes">Archive <Icon name="arrow" /></a>
            </div>
            <a className="site-footer__field-card" href="/field-notes/tokenizer-native-backend">
              <span>11 Aug · Whetstone</span>
              <strong>Why the tokenizer needed a native backend</strong>
              <p>Python defined the behaviour correctly. It just could not train fast enough to be the whole story.</p>
              <small>4 min read <Icon name="arrow" /></small>
            </a>
            <a className="site-footer__contact-signal" href="/contact"><i aria-hidden="true" /> Channel open · Start a conversation <Icon name="arrow" /></a>
          </section>
        </div>

        <div className="site-footer__base">
          <span>Toronto · 2026</span>
          <span>Built beneath the surface</span>
          <a href="/">Return to surface ↑</a>
        </div>
      </div>
    </footer>
  )
}
