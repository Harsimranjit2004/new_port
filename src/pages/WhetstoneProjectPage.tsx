import { ProjectDetailPage, type ProjectDetailConfig } from '../components/project-detail'

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

export default function WhetstoneProjectPage() {
  return <ProjectDetailPage project={whetstone} />
}
