import { motion } from 'framer-motion'
import type { RefObject } from 'react'

interface SurfaceHeroProps {
  heroRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  name?: string
  role?: string
  eyebrow?: string
  disciplines?: string[]
}

const fallbackName = 'Harsimranjit'
const fallbackRole = 'ML / AI engineer'
const fallbackEyebrow = 'Engineering beneath the surface'
const fallbackDisciplines = ['Machine learning', 'ML systems', 'Research & experimentation']
const ease = [0.22, 1, 0.36, 1] as const

export default function SurfaceHero({
  heroRef,
  reducedMotion,
  name = fallbackName,
  role = fallbackRole,
  eyebrow = fallbackEyebrow,
  disciplines = fallbackDisciplines,
}: SurfaceHeroProps) {
  return (
    <section ref={heroRef} className="white-surface" aria-labelledby="home-name">
      <div className="atmosphere-scroll" aria-hidden="true">
        <div className="atmosphere" />
      </div>
      <div className="surface-reflection" aria-hidden="true" />

      <div className="hero-type hero-content">
        <motion.p
          className="hero-type__line"
          initial={reducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
        >
          {eyebrow} <span aria-hidden="true">—</span> {role}
        </motion.p>

        <motion.h1 id="home-name" aria-label={name}>
          {name.split('').map((character, index) => (
            <motion.span
              aria-hidden="true"
              key={`${character}-${index}`}
              initial={reducedMotion ? false : { opacity: 0, x: -5, y: 24, scaleY: 0.975, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, y: 0, scaleY: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.05, delay: 0.58 + index * 0.045, ease }}
              whileHover={reducedMotion ? undefined : { y: -3, scaleY: 1.008, color: '#0b3c5d' }}
            >
              {character}
            </motion.span>
          ))}
        </motion.h1>

        <p className="hero-type__line hero-type__line--disciplines">
          {disciplines.map((item, index) => (
            <span className="expertise-entry" key={item}>
              <motion.span
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 1 + index * 0.1, ease: 'easeOut' }}
                whileHover={reducedMotion ? undefined : { y: -3 }}
              >
                {item}
              </motion.span>
              {index < disciplines.length - 1 && <span className="expertise-separator" aria-hidden="true">—</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
