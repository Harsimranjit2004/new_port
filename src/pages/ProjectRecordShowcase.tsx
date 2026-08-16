import { ProjectRecord, type ProjectReadoutRow } from '../components/project-record'
import './ProjectRecordShowcase.css'

interface ShowcaseProject {
  index: string
  domain: string
  status: string
  title: string
  question: string
  answer: string
  href: string
  cmd: string
  result: string
  readout: ProjectReadoutRow[]
}

const projects: ShowcaseProject[] = [
  {
    index: '01', domain: 'Model infrastructure', status: 'Active build', title: 'Whetstone',
    question: 'What has to survive for a model result to be reproducible?',
    answer: 'The path that produced it.', href: '/work/whetstone',
    cmd: 'whetstone trace --run 7f3a2c', result: '✓ lineage resolved · 7/7 records present',
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
    answer: 'Only what can change the decision.', href: '/work/moderation',
    cmd: 'moderate clip_2291.mp4 --explain', result: '✓ ALLOW · promotional · 3 items cited, 2 declined',
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
    answer: 'The constraints win.', href: '/work/recommendation-systems',
    cmd: 'rank --session 4471 --why', result: '✓ served B · A · E · C · D — two moves after scoring',
    readout: [
      { k: 'signals', v: 'dwell · follow · repeat views', note: '31 events', w: 0.46 },
      { k: 'candidates', v: '1,240 → 180 · 4 retrievers', note: 'diverse', w: 1 },
      { k: 'scoring', v: 'A 0.84 · B 0.79 · C 0.67 · D 0.61', note: 'model v7', w: 0.72 },
      { k: 'rerank', v: 'B ↑1 · D ↓2 · creator cap applied', note: 'cap override', w: 0.64, hi: true },
      { k: 'explore', v: 'E inserted · unseen creator', note: 'slot 4', w: 0.3 },
    ],
  },
]

export default function ProjectRecordShowcase() {
  return (
    <section className="project-showcase" aria-label="Selected engineering projects">
      {projects.map((project) => (
        <article className="project-showcase__project" key={project.index}>
          <header>
            <div className="project-showcase__rail">
              <span>{project.index}</span>
              <span>{project.domain}</span>
              <span className="project-showcase__rule" aria-hidden="true" />
              <span>{project.status}</span>
            </div>
            <h2>{project.title}</h2>
            <p className="project-showcase__question">{project.question}</p>
          </header>

          <ProjectRecord className="project-showcase__artifact" cmd={project.cmd} result={project.result} readout={project.readout} />

          <footer className="project-showcase__answer-row">
            <div>
              <span className="project-showcase__answer-label">The answer</span>
              <p>{project.answer}</p>
            </div>
            <a href={project.href}>Explore project <span aria-hidden="true">↗</span></a>
          </footer>
        </article>
      ))}
    </section>
  )
}
