import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './ProjectRecord.css'

export interface ProjectReadoutRow {
  k: string
  v: string
  note?: string
  w?: number
  hi?: boolean
}

export interface ProjectRecordProps {
  cmd?: string
  result?: string
  readout?: ProjectReadoutRow[]
  className?: string
}

const FALLBACK_ROWS: ProjectReadoutRow[] = [
  { k: 'input', v: 'record accepted', note: 'ready', w: 0.35 },
  { k: 'decision', v: 'constraint applied', note: 'verified', w: 0.72, hi: true },
]

export default function ProjectRecord({
  cmd,
  result,
  readout,
  className = '',
}: ProjectRecordProps) {
  const rootRef = useRef<HTMLElement>(null)
  const timersRef = useRef<number[]>([])
  const [visibleRows, setVisibleRows] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const rows = useMemo(() => {
    const source = readout?.length ? readout : FALLBACK_ROWS
    const selected = source.findIndex((row) => row.hi)
    const highlightIndex = selected >= 0 ? selected : 0
    return source.map((row, rowIndex) => ({ ...row, hi: rowIndex === highlightIndex }))
  }, [readout])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []
  }, [])

  const reveal = useCallback(() => {
    clearTimers()
    if (reducedMotion) {
      setVisibleRows(rows.length)
      return
    }
    setVisibleRows(0)
    rows.forEach((_, rowIndex) => {
      timersRef.current.push(window.setTimeout(() => setVisibleRows(rowIndex + 1), rowIndex * 120))
    })
  }, [clearTimers, reducedMotion, rows])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      setReducedMotion(media.matches)
      if (media.matches) setVisibleRows(rows.length)
    }
    syncMotion()
    media.addEventListener('change', syncMotion)
    return () => media.removeEventListener('change', syncMotion)
  }, [rows.length])

  useEffect(() => {
    const element = rootRef.current
    if (!element || reducedMotion) return
    if (typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      reveal()
    }, { threshold: 0.3 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion, reveal])

  useEffect(() => clearTimers, [clearTimers])

  const finished = visibleRows >= rows.length

  return (
    <section ref={rootRef} className={`project-record ${className}`.trim()} data-project-record aria-label="Project terminal readout">
      <div className="project-record__terminal">
        <div className="project-record__terminal-head">
          <code><span>$</span> {cmd ?? 'system trace --latest'}</code>
          <button type="button" onClick={reveal}>Replay</button>
        </div>

        <div className="project-record__rows">
          {rows.map((row, rowIndex) => (
            <div
              className={`project-record__row ${row.hi ? 'is-highlighted' : ''} ${rowIndex < visibleRows ? 'is-visible' : ''}`}
              key={`${row.k}-${rowIndex}`}
            >
              <code className="project-record__key">{row.k}</code>
              <code className="project-record__value">{row.v}</code>
              <div className="project-record__row-meta">
                <span className="project-record__bar-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, Math.min(1, row.w ?? 0)) * 64}px` }} />
                </span>
                <code>{row.note ?? ''}</code>
              </div>
            </div>
          ))}
        </div>

        <div className={`project-record__result ${finished ? 'is-finished' : ''}`} aria-live="polite">
          <code>{finished ? (result ?? '✓ trace resolved · constraint verified') : 'running…'}</code>
          {!finished && <span className="project-record__caret" aria-hidden="true" />}
        </div>
      </div>
    </section>
  )
}
