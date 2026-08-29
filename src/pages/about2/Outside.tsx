import { useState } from 'react'
import { lifeImages, type LifeImage } from './life.data'

function LifePhoto({ image }: { image: LifeImage }) {
  const [failed, setFailed] = useState(false)
  return <figure className={`a2-life-photo is-${image.size}`}>{failed ? <div className="a2-life-placeholder" role="img" aria-label={`${image.alt}. Personal image pending.`}><span>Personal archive</span><small>{image.src}</small></div> : <img src={image.src} alt={image.alt} loading="lazy" onError={() => setFailed(true)} />}{image.caption && <figcaption>{image.caption}</figcaption>}</figure>
}

export default function Outside() {
  return <section className="a2-outside" aria-labelledby="a2-outside-heading"><div className="a2-shell"><header className="a2-outside__header"><p className="a2-eyebrow">04 / Outside the screen</p><h2 id="a2-outside-heading">Life away from the screen<span>.</span></h2><p>A few places, people, and moments that stay with me.</p></header><div className="a2-life-grid">{lifeImages.map((image) => <LifePhoto image={image} key={image.src} />)}</div><p className="a2-outside__ending">Collected along the way.</p></div></section>
}
