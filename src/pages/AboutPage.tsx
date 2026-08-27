import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import './AboutPage.css'

const ways = [
  ['Go deeper.', 'The first answer is rarely the interesting part. I like understanding what produced it.'],
  ['Build it.', 'Reading gives me the map. Building something exposes what the map leaves out.'],
  ['Question the result.', 'A metric matters more when I understand where it came from and when it fails.'],
  ['Keep learning.', "I deliberately spend time around things I don't yet know how to do."],
]

const curiosities = [
  ['Model evaluation', 'how do we know it actually improved?'],
  ['Language models', 'what happens during training?'],
  ['System design', 'where the boring failure hides'],
  ['French', 'another system to understand'],
]

const observations = [
  ['11 Aug', 'Why the tokenizer needed a native backend', '/field-notes/tokenizer-native-backend'],
  ['02 Aug', 'Run 7f3a2c and the six weeks a README bought me', '/field-notes'],
  ['02 Jun', 'On writing the failed attempt down', '/field-notes'],
]

function ImageSlot({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`about-dc-image ${className}`.trim()} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 16l4.5-4.5 3 3 2-2L20 19M15.5 9.5h.01" /></svg>
      <span>{label}</span>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="about-dc-page">
      <Navbar submergedAt={0} />
      <div className="about-dc-root">
        <div className="about-dc-top about-dc-wrap">
          <a href="/">← Observatory</a>
          <span>About / observer 001</span>
        </div>

        <header className="about-dc-intro about-dc-wrap">
          <div>
            <h1>Harsimranjit</h1>
            <p>I like understanding what happens beneath the surface — in systems, ideas, and the world around me.</p>
            <p>I spend much of my time building and studying machine-learning systems, but the same curiosity that pulls me into models and infrastructure also pulls me toward the world outside them.</p>
          </div>
          <ImageSlot label="Drop a photograph — environmental, not a headshot" className="about-dc-portrait" />
        </header>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Work / systems</span>
          <h2>I build things to understand them.</h2>
          <p className="about-dc-copy">Machine learning, model infrastructure, backend systems, and the evaluation and provenance work that decides whether a result can be trusted.</p>
          <div className="about-dc-map" aria-label="Areas of engineering work">
            <span>Language models</span><i />
            <div><span>ML systems</span><i /><strong>Engineering</strong><i /><span>Infrastructure</span></div>
            <i /><span>Experimentation</span>
          </div>
          <a className="about-dc-action" href="/work">View projects ↗</a>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">A way of working</span>
          <div className="about-dc-ways">
            {ways.map(([title, body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}
          </div>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Away from the screen</span>
          <figure className="about-dc-wide-photo"><ImageSlot label="Drop a photograph — outside, in motion, unposed" /><figcaption>01 / Outside</figcaption></figure>
          <div className="about-dc-away">
            <figure><ImageSlot label="Drop a smaller photograph" /><figcaption>02 / Reading</figcaption></figure>
            <div><h2>Moving helps me think.</h2><p>Most of my interests eventually turn into something I want to understand better.</p></div>
          </div>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">The site / why depth?</span>
          <h2>Why an ocean?</h2>
          <p className="about-dc-copy">The surface shows a result. The interesting part usually starts below it — in the decisions, experiments, and failures that produced it. That is also how I approach engineering, so it became how this site is built.</p>
          <div className="about-dc-depth">
            {['Result', 'Implementation', 'Decisions', 'Experiments', 'Failures', 'Understanding'].map((word, index) => <div key={word}><span>{index === 0 ? 'Surface' : '↓'}</span><strong>{word}</strong></div>)}
          </div>
          <span className="about-dc-depth-note">Depth ↓</span>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Field note / this website</span>
          <div className="about-dc-sketches">
            <figure><ImageSlot label="Drop the paper sketch" /><figcaption>Sketch</figcaption></figure>
            <figure><ImageSlot label="Drop a crop of the built interface" /><figcaption>Implemented</figcaption></figure>
          </div>
          <p className="about-dc-site-note">The portfolio is another system I keep iterating on.</p>
          <a className="about-dc-action" href="/field-notes">Read the design note ↗</a>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Current curiosities</span>
          <div className="about-dc-curiosities">
            {curiosities.map(([topic, note]) => <div key={topic}><strong>{topic}</strong><i /><span>{note}</span></div>)}
          </div>
        </section>

        <section className="about-dc-section about-dc-wrap about-dc-now">
          <span className="about-dc-label">Now / Aug 2026</span>
          <div>
            <p><span>Building</span>Whetstone</p>
            <p><span>Writing</span>Field Notes</p>
            <p><span>Studying</span>Evaluation methodology</p>
          </div>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Professionally</span>
          <div className="about-dc-professional">
            <p><span>Focus</span>ML / AI Engineering</p>
            <p><span>Based in</span>Toronto, Canada</p>
            <p><span>Education</span>Computer Programming, Seneca Polytechnic</p>
          </div>
          <nav className="about-dc-links" aria-label="Professional links">
            <span>Résumé available on request</span><a href="https://github.com/">GitHub ↗</a><a href="https://www.linkedin.com/">LinkedIn ↗</a>
          </nav>
          <span className="about-dc-stack">Python · C++ · PyTorch · TypeScript · AWS</span>
        </section>

        <section className="about-dc-section about-dc-wrap">
          <span className="about-dc-label">Observations</span>
          <h2>Things I have been thinking about.</h2>
          <div className="about-dc-observations">
            {observations.map(([date, title, href]) => <a href={href} key={title}><time>{date}</time><span>{title}</span><i>↗</i></a>)}
          </div>
          <a className="about-dc-action" href="/field-notes">All Field Notes ↗</a>
        </section>

        <section className="about-dc-end about-dc-wrap">
          <span>End of record</span>
          <h2>Still curious?</h2>
          <nav><a href="/contact">Contact ↗</a><a href="/work">Projects ↗</a><a href="/field-notes">Field Notes ↗</a></nav>
        </section>
      </div>
      <Footer />
    </main>
  )
}
