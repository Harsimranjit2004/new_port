import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Footer } from '../footer'
import { Navbar } from '../navbar'
import { OceanBackground } from '../ocean'
import { ProjectRecord, type ProjectPipelineStep, type ProjectReadoutRow } from '../project-record'
import './ProjectDetailPage.css'

export interface ProjectMetric { value: string; label: string }
export interface ProjectStage { index: string; title: string; label: string; detail: string; state?: string }
export interface RelatedNote { title: string; meta: string; href: string }

export interface ProjectDetailConfig {
  index: string
  domain: string
  status: string
  year: string
  title: string
  thesis: string
  description: string
  metrics: ProjectMetric[]
  pipeline: string[]
  problem: { title: string; copy: string }
  system: { title: string; copy: string; nodes: string[] }
  stages: ProjectStage[]
  evidence: { cmd: string; result: string; pipeline: ProjectPipelineStep[]; rows: ProjectReadoutRow[]; checks: string[] }
  notes: RelatedNote[]
  current: string
  next: string
  nextHref?: string
  heroVisual?: ReactNode
  plateImage?: string
  plateAlt?: string
  plateCaption?: string
}

function ProjectPlatePlaceholder({ plate, label, prompt }: { plate: string; label: string; prompt: string }) {
  return (
    <div className="pd-placeholder" role="img" aria-label={`${label} image placeholder`}>
      <div className="pd-placeholder__label"><span>{plate}</span><span>{label}</span></div>
      <div className="pd-placeholder__empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 16l4.5-4.5 3 3 2-2L20 19M15.5 9.5h.01" /></svg>
        <span>{prompt}</span>
        <button type="button">Browse files</button>
      </div>
    </div>
  )
}

function DefaultHeroVisual({ project }: { project: ProjectDetailConfig }) {
  return (
    <div className="pd-hero-visual" aria-label={`${project.title} system overview`}>
      <div className="pd-hero-visual__orbit" aria-hidden="true"><i /><i /><i /></div>
      <div className="pd-hero-visual__core">
        <span>Execution record</span>
        <strong>{project.title}</strong>
        <small>{project.evidence.result}</small>
      </div>
      <div className="pd-hero-visual__signals" aria-hidden="true">
        {project.pipeline.map((node, index) => <span style={{ '--signal': index } as CSSProperties} key={node}>{node}</span>)}
      </div>
    </div>
  )
}

export default function ProjectDetailPage({ project }: { project: ProjectDetailConfig }) {
  const sectionLinks = [
    ['01', 'Problem'], ['02', 'System'], ['03', 'Build'], ['04', 'Evidence'], ['05', 'Notes'],
  ]
  const [activeSection, setActiveSection] = useState('problem')

  useEffect(() => {
    const sections = sectionLinks
      .map(([, label]) => document.getElementById(label.toLowerCase()))
      .filter((section): section is HTMLElement => Boolean(section))
    if (!sections.length || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="pd-page">
      <Navbar submergedAt={0} />
      <OceanBackground screens={1} startDepth="deep" endDepth="abyss" className="pd-ocean">
        <div className="pd-shell">
          <a className="pd-back" href="/work">← Back to work</a>

          <header className="pd-hero">
            <div className="pd-hero__visual">{project.heroVisual ?? <DefaultHeroVisual project={project} />}</div>
            <div className="pd-hero__meta">{project.domain} · {project.status} · {project.year}</div>
            <h1>{project.title}</h1>
            <p className="pd-hero__thesis">{project.thesis}</p>
            <p className="pd-hero__description">{project.description}</p>
            <nav className="pd-hero__links" aria-label="Project resources">
              <a href="#build">Live systems ↗</a>
              <a href="#evidence">Evidence ↘</a>
              <a href="#notes">Notes ↗</a>
            </nav>
          </header>

          <section className="pd-metrics" aria-label="Project metrics">
            {project.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
          </section>

          <div className="pd-pipeline" aria-label="System pipeline">
            {project.pipeline.map((node, index) => (
              <span key={node}>{node}{index < project.pipeline.length - 1 && <i aria-hidden="true" />}</span>
            ))}
          </div>

          <div className="pd-layout">
            <aside className="pd-contents">
              <span>Contents</span>
              <nav>{sectionLinks.map(([number, label]) => {
                const id = label.toLowerCase()
                return <a className={activeSection === id ? 'is-active' : ''} aria-current={activeSection === id ? 'location' : undefined} href={`#${id}`} key={number}><b>{number}</b>{label}</a>
              })}</nav>

            </aside>

            <div className="pd-record">
              <section id="problem" className="pd-section pd-section--split">
                <div className="pd-section__copy"><span>01</span><div><h2>{project.problem.title}</h2><p>{project.problem.copy}</p></div></div>
                {project.plateImage ? (
                  <figure className="pd-plate">
                    <div><img src={project.plateImage} alt={project.plateAlt ?? ''} /></div>
                    {project.plateCaption && <figcaption>{project.plateCaption}</figcaption>}
                  </figure>
                ) : (
                  <div className="pd-provenance" aria-label="Artifact provenance diagram">
                    <strong>Model result</strong>
                    <div>{project.evidence.pipeline.map((step) => <span key={step.label}>{step.label}</span>)}</div>
                  </div>
                )}
              </section>

              <section id="system" className="pd-section pd-section--split">
                <div className="pd-section__copy"><span>02</span><div><h2>{project.system.title}</h2><p>{project.system.copy}</p></div></div>
                <div className="pd-system-flow">
                  {project.system.nodes.map((node, index) => <span key={node}>{node}{index < project.system.nodes.length - 1 && <i>→</i>}</span>)}
                </div>
                <ProjectPlatePlaceholder plate="Plate 02" label="System" prompt="Drop a wide image — architecture, pipeline, or system view" />
              </section>

              <section id="build" className="pd-section">
                <div className="pd-section__copy"><span>03</span><div><h2>Build</h2><p>Walk through the system as a set of inspectable stages.</p></div></div>
                <div className="pd-stages">
                  {project.stages.map((stage) => (
                    <a href={`#stage-${stage.index}`} className="pd-stage" key={stage.index}>
                      <span>{stage.index} / {stage.label}</span>
                      <div className="pd-stage__live" aria-hidden="true"><i /><i /><i /></div>
                      <strong>{stage.title}</strong>
                      <small>{stage.state ?? 'Live view'} ↗</small>
                    </a>
                  ))}
                </div>
              </section>

              <section id="evidence" className="pd-section pd-evidence">
                <div className="pd-placeholder--wide">
                  <ProjectPlatePlaceholder plate="Plate 03" label="Artifact" prompt="Drop a wide image — signed artifact or evaluation output" />
                  <p>What ships: weights plus the records required to explain them.</p>
                </div>
                <div className="pd-section__copy"><span>04</span><div><h2>Evidence</h2><p>Real run. Real trace. Everything accounted for.</p></div></div>
                <ProjectRecord className="pd-evidence__trace" cmd={project.evidence.cmd} result={project.evidence.result} pipeline={project.evidence.pipeline} readout={project.evidence.rows} />
                <div className="pd-checks"><span>Verification</span>{project.evidence.checks.map((check) => <div key={check}><span>{check}</span><strong>Pass</strong></div>)}</div>
              </section>

              <section id="notes" className="pd-notes">
                <h2>Related field notes</h2>
                <div>{project.notes.map((note) => <a href={note.href} key={note.title}><strong>{note.title}</strong><span>{note.meta} ↗</span></a>)}</div>
              </section>

              <nav className="pd-record-nav" aria-label="Project navigation">
                <span><small>Current</small>{project.current}</span>
                <a href={project.nextHref ?? '/work'}><small>Next</small>{project.next} →</a>
              </nav>
            </div>
          </div>
        </div>
        <Footer />
      </OceanBackground>
    </main>
  )
}
