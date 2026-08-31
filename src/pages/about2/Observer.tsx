import { useState } from 'react'
import { intro } from './about2.data'

function Portrait() {
  const [failed, setFailed] = useState(false)
  return <figure className="a2-portrait"><div className="a2-portrait__frame">{failed ? <div className="a2-portrait__placeholder" role="img" aria-label="Personal environmental portrait pending"><span>Personal portrait</span><small>Add image at {intro.portrait.src}</small></div> : <img src={intro.portrait.src} alt={intro.portrait.alt} onError={() => setFailed(true)} />}</div><figcaption>{intro.portrait.caption}</figcaption></figure>
}

export type ObserverLink = { label: string; href: string; primary?: boolean }

type ObserverProps = {
  name?: string
  observer?: string
  paragraphs?: string[]
  links?: ObserverLink[]
}

export default function Observer({ name = intro.name, observer = 'Observer', paragraphs = intro.paragraphs, links = intro.links }: ObserverProps) {
  return <section className="a2-observer" aria-labelledby="a2-observer-heading"><div className="a2-shell"><div className="a2-observer__grid"><div className="a2-observer__content"><p className="a2-eyebrow">01 / {observer}</p><h1 id="a2-observer-heading">{name}<span>.</span></h1><div className="a2-observer__copy">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>)}</div><nav className="a2-observer__links" aria-label="About page links">{links.map((link) => <a className={link.primary ? 'is-primary' : ''} href={link.href} key={`${link.label}-${link.href}`}>{link.label} <span aria-hidden="true">↗</span></a>)}</nav></div><Portrait /></div></div></section>
}
