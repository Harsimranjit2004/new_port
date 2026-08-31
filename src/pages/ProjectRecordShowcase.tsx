import { useEffect, useState } from 'react'
import { ProjectRecord, type ProjectPipelineStep, type ProjectReadoutRow } from '../components/project-record'
import { publicApi, type PublicProject } from '../lib/publicApi'
import './ProjectRecordShowcase.css'

interface ShowcaseProject {
  index: string
  domain: string
  status: string
  title: string
  question: string

  href: string
  cmd: string
  result: string

  pipeline: ProjectPipelineStep[]
  insight: string
  readout: ProjectReadoutRow[]
}

const fallbackProjects: ShowcaseProject[] = [
  {
    index: '01', domain: 'Model infrastructure', status: 'Active build', title: 'Whetstone',
    question: 'What has to survive for a model result to be reproducible?',
    href: '/work/whetstone',
    cmd: 'whetstone trace --run 7f3a2c', result: '✓ lineage resolved · 7/7 records present',

    pipeline: [
      { label: 'Dataset' }, { label: 'Identity' }, { label: 'Run' }, { label: 'Artifact', state: 'decision' },
    ],
    insight: 'Complete lineage · 7/7 records present',
    readout: [
      { k: 'dataset', v: 'manifest sha256:91d4… · 3.1M records', note: 'content-addressed', w: 0.82 },
      { k: 'identity', v: 'canonical JSON · SHA-256 · NFC', note: 'deterministic', w: 0.46 },
      { k: 'tokenizer', v: 'byte-BPE · vocab 32,768 · v1.2', note: 'frozen', w: 0.58 },
      { k: 'run contract', v: 'git · config · data · seed · hardware', note: 'validated', w: 0.7 },
      { k: 'training', v: '124M · step 42k · loss 2.41', note: '4d 06h', w: 1 },
      { k: 'artifact', v: 'checkpoint + lineage + cost', note: 'reproducible', w: 0.68, hi: true },
    ],
  },
  {
    index: '02', domain: 'Multimodal AI', status: 'Active build', title: 'Multimodal Moderation',
    question: 'How much evidence should a system acquire before making a decision?',
    href: '/work/moderation',
    cmd: 'moderate clip_2291.mp4 --explain', result: '✓ ALLOW · promotional · 3 items cited · 2 declined',

    pipeline: [
      { label: 'Video' }, { label: 'Frames' }, { label: 'OCR' }, { label: 'ASR skipped', state: 'skipped' }, { label: 'Decision', state: 'decision' },
    ],
    insight: 'Decision stable after OCR · ASR not required',
    readout: [
      { k: 'media', v: '00:42 · 1080p · 18MB', note: 'normalized', w: 0.35 },
      { k: 'frames', v: '12 sampled · motion-aware selection', note: 'acquired', w: 0.4 },
      { k: 'ocr', v: '4 text regions · language en', note: 'cited', w: 0.52 },
      { k: 'audio', v: 'ASR declined · outcome unchanged', note: 'declined', w: 0.18 },
      { k: 'decision', v: 'ALLOW · promotional · confidence 0.91', note: '3 cited', w: 0.72, hi: true },
    ],
  },
  {
    index: '03', domain: 'Ranking systems', status: 'Researching', title: 'Recommendation Systems',
    question: 'What happens when model score conflicts with system constraints?',
    href: '/work/recommendation-systems',
    cmd: 'rank --session 4471 --why', result: '✓ served B · A · E · C · D — two moves after scoring',

    pipeline: [
      { label: 'Signals' }, { label: 'Candidates' }, { label: 'Score' }, { label: 'Rerank' }, { label: 'Serve', state: 'decision' },
    ],
    insight: 'Two ordering changes applied after scoring',
    readout: [
      { k: 'signals', v: 'dwell · follow · repeat views', note: '31 events', w: 0.46 },
      { k: 'candidates', v: '1,240 → 180 · 4 retrievers', note: 'diverse', w: 1 },
      { k: 'scoring', v: 'A 0.84 · B 0.79 · C 0.67 · D 0.61', note: 'model v7', w: 0.72 },
      { k: 'rerank', v: 'B ↑1 · D ↓2 · creator cap applied', note: 'cap override', w: 0.64, hi: true },
      { k: 'explore', v: 'E inserted · unseen creator', note: 'slot 4', w: 0.3 },
    ],
  },
  {
    index: '04', domain: 'Model evaluation', status: 'Prototype', title: 'Evaluation Harness',
    question: 'Can a failed evaluation preserve enough context to explain why it failed?',
    href: '/work/evaluation-harness',
    cmd: 'evaluate run_88c1 --slice failures', result: '✓ 14 regressions isolated · 3 shared causes',
    pipeline: [
      { label: 'Tests' }, { label: 'Slices' }, { label: 'Compare' }, { label: 'Explain', state: 'decision' },
    ],
    insight: 'Three failure patterns explain fourteen regressions',
    readout: [
      { k: 'suite', v: '312 cases · 8 behavioural slices', note: 'loaded', w: 0.78 },
      { k: 'baseline', v: 'model v12 · pass 0.84', note: 'reference', w: 0.58 },
      { k: 'candidate', v: 'model v13 · pass 0.81', note: 'regressed', w: 0.52 },
      { k: 'failures', v: '14 isolated · 3 common causes', note: 'explained', w: 0.68, hi: true },
    ],
  },
  {
    index: '05', domain: 'Retrieval systems', status: 'Researching', title: 'Retrieval Lab',
    question: 'How much retrieval quality can be measured before generation obscures the evidence?',
    href: '/work/retrieval-lab',
    cmd: 'retrieve query_142 --audit', result: '✓ 8 sources ranked · evidence coverage 0.87',
    pipeline: [
      { label: 'Query' }, { label: 'Retrieve' }, { label: 'Rerank' }, { label: 'Audit', state: 'decision' },
    ],
    insight: 'Reranking recovered two sources missed by semantic similarity',
    readout: [
      { k: 'query', v: '142 · technical comparison', note: 'parsed', w: 0.32 },
      { k: 'retrieve', v: '64 candidates · hybrid search', note: 'collected', w: 0.82 },
      { k: 'rerank', v: '64 → 8 · cross-encoder', note: 'ordered', w: 0.66 },
      { k: 'coverage', v: '0.87 · 6 claims supported', note: 'audited', w: 0.74, hi: true },
    ],
  },
]

function pipelineState(state?: string): ProjectPipelineStep['state'] {
  return state === 'complete' || state === 'skipped' || state === 'decision' ? state : undefined
}

function toShowcaseProject(project: PublicProject): ShowcaseProject {
  return {
    index: project.index_label || String(project.sort_order ?? '').padStart(2, '0') || '—',
    domain: project.domain || 'Engineering',
    status: project.status || 'In progress',
    title: project.title,
    question: project.question || project.thesis || project.summary || '',
    href: `/work/${project.slug}`,
    cmd: project.trace?.cmd || `open ${project.slug}`,
    result: project.trace?.result || project.summary || 'Project record available',
    pipeline: (project.pipeline || []).map((step) => ({ label: step.label, state: pipelineState(step.state) })),
    insight: project.summary || project.thesis || project.question || '',
    readout: project.trace?.rows || [],
  }
}

export default function ProjectRecordShowcase({ limit }: { limit?: number }) {
  const [projects, setProjects] = useState<ShowcaseProject[]>(fallbackProjects)

  useEffect(() => {
    let active = true
    publicApi.projects()
      .then((records) => {
        const featured = records.filter((project) => project.featured !== false)
        if (active && featured.length) setProjects(featured.map(toShowcaseProject))
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const visibleProjects = typeof limit === 'number' ? projects.slice(0, limit) : projects

  return (
    <section className="project-showcase" aria-label="Selected engineering projects">
      {visibleProjects.map((project) => (
        <article
          className="project-showcase__project"
          key={project.index}
          role="link"
          tabIndex={0}
          aria-label={`Open ${project.title} project detail`}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) return
            window.location.href = project.href
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              window.location.href = project.href
            }
          }}
        >
          <header className="project-showcase__header">
            <div className="project-showcase__rail">
              <span>{project.index}</span>
              <span>{project.domain}</span>
              <span className="project-showcase__rule" aria-hidden="true" />
              <span>{project.status}</span>
            </div>
            <h2>{project.title}</h2>
            <p className="project-showcase__question">{project.question}</p>
            <a className="project-showcase__open-record" href={project.href}>Open record {project.index} <span aria-hidden="true">↗</span></a>
          </header>

          <ProjectRecord
            className="project-showcase__artifact"
            cmd={project.cmd}
            result={project.result}
            readout={project.readout}
            pipeline={project.pipeline}
            insight={project.insight}
          />

        </article>
      ))}
    </section>
  )
}
