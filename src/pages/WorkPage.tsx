import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import ProjectRecordShowcase from './ProjectRecordShowcase'
import './WorkPage.css'

const explorations = [
  {
    index: '04', domain: 'Model evaluation', status: 'Prototype', title: 'Evaluation Harness',
    question: 'Can a failed evaluation preserve enough context to explain why it failed?',
    signal: 'TEST → SLICE → TRACE → COMPARE', note: 'Mock project / in development',
  },
  {
    index: '05', domain: 'Retrieval systems', status: 'Researching', title: 'Retrieval Lab',
    question: 'How much retrieval quality can be measured before generation obscures the evidence?',
    signal: 'QUERY → RETRIEVE → RERANK → AUDIT', note: 'Mock project / research direction',
  },
  {
    index: '06', domain: 'ML observability', status: 'Concept study', title: 'Drift Signals',
    question: 'Which changes deserve attention before monitoring becomes another source of noise?',
    signal: 'BASELINE → SHIFT → IMPACT → ALERT', note: 'Mock project / concept study',
  },
  {
    index: '07', domain: 'Agent systems', status: 'Exploring', title: 'Tool Ledger',
    question: 'What should an agent record so every tool call remains inspectable afterward?',
    signal: 'INTENT → TOOL → RESULT → PROVENANCE', note: 'Mock project / early exploration',
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
          <div className="work-page__depth-markers" aria-hidden="true">
            <span>Surface</span>
            <i />
            <span>Selected systems</span>
          </div>
          <p>Engineering records · 2026</p>
          <div className="work-page__title-reveal">
            <h1>Work experience</h1>
          </div>
          <div className="work-page__intro-note">
            <span>03 projects</span>
            <p>Systems built around evidence, reproducibility, constraints, and decisions.</p>
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
              <article className="work-exploration-card" key={project.index}>
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
                <footer><span>{project.note}</span><span aria-hidden="true">○</span></footer>
              </article>
            ))}
          </div>
        </section>

        <Footer />
      </OceanBackground>
    </main>
  )
}
