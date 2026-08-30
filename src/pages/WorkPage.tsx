import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import ProjectRecordShowcase from './ProjectRecordShowcase'
import './WorkPage.css'

const explorations = [
  {
    index: '06', domain: 'ML observability', status: 'Concept study', title: 'Drift Signals',
    question: 'Which changes deserve attention before monitoring becomes another source of noise?',
    signal: 'BASELINE → SHIFT → IMPACT → ALERT', note: 'Mock project / concept study', href: '/work/drift-signals',
  },
  {
    index: '07', domain: 'Agent systems', status: 'Exploring', title: 'Tool Ledger',
    question: 'What should an agent record so every tool call remains inspectable afterward?',
    signal: 'INTENT → TOOL → RESULT → PROVENANCE', note: 'Mock project / early exploration', href: '/work/tool-ledger',
  },
]

export default function WorkPage() {
  return (
    <main className="work-page">
      <Navbar submergedAt={0} />
      <OceanBackground
        screens={1}
        startDepth="shallow"
        endDepth="deep"
        showSurfaceWaves
        className="work-page__ocean"
      >
        <header className="work-page__intro">
          <div className="work-page__title-reveal">
            <h1>Work experience</h1>
          </div>
        </header>

        <ProjectRecordShowcase />

        <section className="work-explorations" aria-labelledby="work-explorations-title">
          <div className="work-explorations__head">
            <div>
              <span>Additional records</span>
              <h2 id="work-explorations-title">Ongoing explorations</h2>
            </div>
            <p>Early systems, prototypes, and research directions. These are intentionally marked as unfinished.</p>
          </div>

          <div className="work-explorations__grid">
            {explorations.map((project) => (
              <a className="work-exploration-card" href={project.href} aria-label={`Open ${project.title} project detail`} key={project.index}>
                <div className="work-exploration-card__meta">
                  <span>{project.index}</span><span>{project.domain}</span><i /><span>{project.status}</span>
                </div>
                <div className="work-exploration-card__body">
                  <h3>{project.title}</h3>
                  <p>{project.question}</p>
                </div>
                <div className="work-exploration-card__signal">
                  {project.signal.split(' → ').map((step, index, steps) => (
                    <span key={step}>{step}{index < steps.length - 1 && <i aria-hidden="true">→</i>}</span>
                  ))}
                </div>
                <footer><span>{project.note}</span><span className="work-exploration-card__cta">Open record {project.index} <i aria-hidden="true">↗</i></span></footer>
              </a>
            ))}
          </div>
        </section>

        <Footer />
      </OceanBackground>
    </main>
  )
}
