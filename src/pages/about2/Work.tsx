import { useEffect, useRef, useState } from 'react'
import { experience, technologies, workDomains } from './about2.data'

function DomainIcon({ index }: { index: number }) {
  const icons = [
    <><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /><rect x="6" y="6" width="12" height="12" rx="4" /><path d="M10 9v6M14 9v6" /></>,
    <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4M4 17l8 4 8-4" /></>,
    <><circle cx="6" cy="12" r="3" /><circle cx="17" cy="6" r="3" /><circle cx="17" cy="18" r="3" /><path d="m9 11 5-3M9 13l5 3" /></>,
    <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m9 10-2 2 2 2M15 10l2 2-2 2" /></>,
    <><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 8.1 5 5 0 0 0 7 18Z" /></>,
    <><path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-6" /><circle cx="19" cy="7" r="1" /></>,
    <><path d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z" /><path d="m4 6.5 8 4.5 8-4.5M12 11v11" /></>,
  ]
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[index]}</svg>
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return <section className="a2-work" ref={sectionRef} data-visible={visible} aria-labelledby="a2-work-heading"><div className="a2-shell"><header className="a2-work__header"><p className="a2-eyebrow">02 / Experience</p><h2 id="a2-work-heading">Experience and technical practice</h2></header><div className="a2-work__grid"><section className="a2-work__column a2-work__experience" aria-labelledby="a2-experience-title"><h3 id="a2-experience-title">Experience</h3><ol className="a2-timeline">{experience.map((item) => <li className={item.placeholder ? 'is-placeholder' : ''} key={`${item.period}-${item.role}`}><time>{item.period}</time><strong>{item.role}</strong><span>{item.company}</span><p>{item.description}</p></li>)}</ol></section><section className="a2-work__column" aria-labelledby="a2-domains-title"><h3 id="a2-domains-title">Things I work with</h3><ul className="a2-domains">{workDomains.map((domain, index) => <li key={domain.name}><DomainIcon index={index} /><span>{domain.name}</span><i className={`is-${domain.trace}`} aria-hidden="true"><b /></i></li>)}</ul></section><section className="a2-work__column" aria-labelledby="a2-technologies-title"><h3 id="a2-technologies-title">Technologies I use</h3><ul className="a2-technologies">{technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></section></div></div></section>
}
