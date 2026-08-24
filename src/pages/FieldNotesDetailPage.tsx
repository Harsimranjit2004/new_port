import { Navbar } from '../components/navbar'
import './FieldNotesDetailPage.css'

export default function FieldNotesDetailPage() {
  return (
    <main className="fnd-page">
      <Navbar submergedAt={0} />
      <article className="fnd-root">
        <a href="/field-notes" className="fnd-link fnd-back">← Field Notes</a>

        <header className="fnd-header">
          <div className="fnd-meta">
            <span>Whetstone</span>
            <time dateTime="2026-08-11">11 Aug 2026</time>
            <span>4 min read</span>
          </div>
          <h1>Why the tokenizer needed a native backend</h1>
          <p>Python defined the tokenizer correctly. It just could not train fast enough to be the whole story.</p>
        </header>

        <div className="fnd-body">
          <p>The Python implementation was never wrong. It trained a byte-level BPE tokenizer, selected merges under a deterministic tie-break, and produced a vocabulary that matched every test we wrote for it. The problem showed up somewhere else: on a 4.2M-document corpus, training that vocabulary took long enough that iterating on filtering decisions upstream became expensive in a way that changed how carefully anyone was willing to experiment.</p>

          <p>That is a bad trade to make silently. If retraining a tokenizer costs an afternoon, people quietly stop retraining it, and the corpus and the vocabulary drift apart in a way nothing catches until evaluation gets strange in some direction nobody can immediately name.</p>

          <blockquote>The decision was not “rewrite it in C++.” It was “keep two implementations, and never let them disagree.”</blockquote>

          <p>Python stayed the reference implementation — the place behaviour is defined and where a new rule gets written first. A C++ backend took over actual training runs. The only way this is safe is if the two are held to strict parity: same input, same byte-for-byte vocabulary and merge table, every time, checked by a test suite rather than by inspection.</p>

          <figure>
            <figcaption>Merge tie-break, unchanged in either backend</figcaption>
            <pre><code>(-frequency, left_id, right_id)</code></pre>
            <p>A total ordering, not a heuristic — the same rule holds in both implementations, which is what makes the parity test meaningful rather than approximate.</p>
          </figure>

          <p>362 tests now run across both backends: encode/decode round trips, binary and NUL input, and direct comparison of vocabulary and merge tables produced from the same corpus. None of that proves the tokenizer is good. It proves the two implementations cannot quietly disagree — which turned out to be the actual risk, not speed.</p>

          <p>The part I’m least settled on: two implementations are twice the surface area to maintain, forever, for a component that should eventually stop changing. I don’t yet know if that trade stays worth it once the tokenizer is actually frozen.</p>
        </div>

        <aside className="fnd-related">
          <span>Related</span>
          <a href="/work/whetstone" className="fnd-link">Whetstone — full project record ↗</a>
        </aside>

        <nav className="fnd-note-nav" aria-label="Adjacent field notes">
          <a href="#note-3" className="fnd-link">
            <span>Previous observation</span>
            Making the artifact refuse to sign
          </a>
          <a href="#note-2" className="fnd-link">
            <span>Next observation</span>
            Run 7f3a2c and the six weeks a README bought me
          </a>
        </nav>
      </article>
    </main>
  )
}
