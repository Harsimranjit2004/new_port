import { useEffect, useState } from 'react'
import { ProjectDetailPage, type ProjectDetailConfig } from '../components/project-detail'
import type { ProjectPipelineStep } from '../components/project-record'
import { publicApi, type PublicProject } from '../lib/publicApi'

const whetstone: ProjectDetailConfig = {
  index: '01',
  domain: 'Model infrastructure',
  status: 'Active build',
  year: '2026',
  title: 'Whetstone',
  thesis: 'The path that produced the model ships with the model.',
  description: 'Whetstone is infrastructure for reproducible small-language-model development, connecting data preparation, tokenization, training, evaluation, and provenance into one verifiable chain.',
  heroVisual: (
    <figure className="pd-project-image">
      <img src="/whetstone-infrastructure.jpg" alt="Rows of illuminated computing infrastructure in a data center" />
      <figcaption><span>Infrastructure / execution environment</span><span>Photo · Taylor Vick / Unsplash</span></figcaption>
    </figure>
  ),
  plateImage: '/whetstone-provenance.svg',
  plateAlt: 'Whetstone manifest and lineage record connecting the inputs required to reproduce a model run',
  plateCaption: 'Where a corpus stops being a directory and becomes an addressable input.',
  metrics: [
    { value: '3.1M', label: 'Prepared documents' },
    { value: '32,768', label: 'Tokenizer vocabulary' },
    { value: 'Py + C++', label: 'Backends' },
    { value: '362', label: 'Tokenizer tests' },
    { value: '7 / 7', label: 'Lineage resolved' },
  ],
  pipeline: ['Data', 'Tokenizer', 'Model', 'Evaluation', 'Artifact'],
  problem: {
    title: 'The problem',
    copy: 'A checkpoint tells you what was produced. It does not necessarily tell you how it was produced.',
  },
  system: {
    title: 'System',
    copy: 'An end-to-end pipeline where every stage produces verifiable, content-addressed records.',
    nodes: ['Raw data', 'Preparation', 'Manifest', 'Tokenizer', 'Training', 'Evaluation', 'Artifact'],
  },
  stages: [
    { index: '01', label: 'Tokenizer', title: 'Native / reference parity', detail: 'Deterministic BPE training', state: 'Live trace' },
    { index: '02', label: 'Model', title: 'Training contract', detail: 'Config and seed capture', state: 'Live trace' },
    { index: '03', label: 'Evaluation', title: 'Evaluation context', detail: 'Metrics with conditions', state: 'Live trace' },
    { index: '04', label: 'Artifact', title: 'Lineage explorer', detail: 'Signed provenance graph', state: 'Explorer' },
  ],
  evidence: {
    cmd: 'whetstone trace --run 7f3a2c',
    result: '✓ lineage resolved · 7/7 records present',
    pipeline: [{ label: 'Dataset' }, { label: 'Identity' }, { label: 'Run' }, { label: 'Artifact', state: 'decision' }],
    rows: [
      { k: 'source', v: 'manifest sha256:91d4…', note: 'resolved', w: .82 },
      { k: 'preparation', v: 'filter contract · v3', note: 'verified', w: .7 },
      { k: 'tokenizer', v: 'byte-BPE · vocab 32,768', note: 'parity', w: .58 },
      { k: 'training', v: '124M · step 42k · loss 2.41', note: 'resolved', w: 1 },
      { k: 'evaluation', v: 'context + metrics + slices', note: 'verified', w: .72 },
      { k: 'artifact', v: 'checkpoint + lineage + cost', note: 'signed', w: .68, hi: true },
    ],
    checks: ['Determinism', 'Py / C++ parity', 'Round trip', 'Artifact validation'],
  },
  notes: [
    { title: 'Determinism is more than setting a seed', meta: '23 Aug · Tokenizer', href: '/field-notes' },
    { title: 'When native and reference implementations disagree', meta: '19 Aug · C++', href: '/field-notes/tokenizer-native-backend' },
    { title: "The model artifact isn't the model", meta: '14 Aug · Infrastructure', href: '/field-notes' },
    { title: 'Why evaluation context changes everything', meta: '10 Aug · Evaluation', href: '/field-notes' },
  ],
  current: 'Evaluation system',
  next: 'Training system',
  nextHref: '/work',
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function section(project: PublicProject, id: string) {
  return project.sections?.find((item) => item.id.toLowerCase() === id)
}

function toDetailConfig(project: PublicProject): ProjectDetailConfig {
  const isWhetstone = project.slug === 'whetstone'
  const fallback = isWhetstone ? whetstone : undefined
  const extra = asRecord(project.extra)
  const problem = section(project, 'problem')
  const system = section(project, 'system')
  const buildSections = project.sections?.filter((item) => !['problem', 'system'].includes(item.id.toLowerCase())) || []
  const technologies = Array.isArray(project.technologies) ? project.technologies.map(String) : []
  const pipeline = project.pipeline?.map((step) => step.label) || fallback?.pipeline || technologies
  const evidencePipeline: ProjectPipelineStep[] = (project.pipeline || []).map((step) => ({
    label: step.label,
    state: step.state === 'complete' || step.state === 'skipped' || step.state === 'decision' ? step.state : undefined,
  }))

  return {
    index: project.index_label || fallback?.index || String(project.sort_order ?? '').padStart(2, '0'),
    domain: project.domain || fallback?.domain || 'Engineering',
    status: project.status || fallback?.status || 'In progress',
    year: String(project.year || fallback?.year || new Date().getFullYear()),
    title: project.title,
    thesis: project.thesis || project.question || fallback?.thesis || project.summary || '',
    description: project.summary || fallback?.description || project.question || '',
    metrics: (project.metrics?.length ? project.metrics.map((metric) => ({
      value: String(metric.value ?? ''),
      label: String(metric.label ?? ''),
    })) : fallback?.metrics) || [],
    pipeline,
    problem: {
      title: problem?.title || fallback?.problem.title || 'The problem',
      copy: problem?.body || project.question || fallback?.problem.copy || project.summary || '',
    },
    system: {
      title: system?.title || fallback?.system.title || 'System',
      copy: system?.body || fallback?.system.copy || project.summary || '',
      nodes: pipeline.length ? pipeline : fallback?.system.nodes || [],
    },
    stages: buildSections.length ? buildSections.map((item, index) => ({
      index: String(index + 1).padStart(2, '0'),
      label: item.id,
      title: item.title,
      detail: item.body,
      state: project.status,
    })) : fallback?.stages || [],
    evidence: {
      cmd: project.trace?.cmd || fallback?.evidence.cmd || `open ${project.slug}`,
      result: project.trace?.result || fallback?.evidence.result || project.summary || 'Project record available',
      pipeline: evidencePipeline.length ? evidencePipeline : fallback?.evidence.pipeline || [],
      rows: project.trace?.rows || fallback?.evidence.rows || [],
      checks: technologies.length ? technologies : fallback?.evidence.checks || [],
    },
    notes: fallback?.notes || [],
    current: String(extra.current || fallback?.current || project.status || 'In progress'),
    next: String(extra.next || fallback?.next || 'More work'),
    nextHref: typeof extra.nextHref === 'string' ? extra.nextHref : fallback?.nextHref || '/work',
    ...(fallback ? {
      heroVisual: fallback.heroVisual,
      plateImage: fallback.plateImage,
      plateAlt: fallback.plateAlt,
      plateCaption: fallback.plateCaption,
    } : {}),
  }
}

export default function WhetstoneProjectPage() {
  const slug = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || 'whetstone'
  const [project, setProject] = useState<ProjectDetailConfig>(() => slug === 'whetstone'
    ? whetstone
    : toDetailConfig({ slug, title: slug.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ') }))

  useEffect(() => {
    let active = true
    publicApi.project(slug)
      .then((record) => { if (active) setProject(toDetailConfig(record)) })
      .catch(() => undefined)
    return () => { active = false }
  }, [slug])

  return <ProjectDetailPage project={project} />
}
