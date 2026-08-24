import { useRef } from 'react'
import { Footer } from './components/footer'
import { Navbar } from './components/navbar'
import { OceanBackground } from './components/ocean'
import { useHomeScrollTimeline } from './hooks/useHomeScrollTimeline'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import ProjectRecordShowcase from './pages/ProjectRecordShowcase'
import SurfaceHero from './sections/home/SurfaceHero'
import './App.css'

export default function App() {
  const rootRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useSmoothScroll(reducedMotion)
  useHomeScrollTimeline({ rootRef, heroRef, reducedMotion })

  return (
    <main id="top" ref={rootRef}>
      <Navbar />
      <SurfaceHero heroRef={heroRef} reducedMotion={reducedMotion} />
      <OceanBackground screens={1} startDepth="shallow" endDepth="deep" showSurfaceWaves>
        <p className="descent-statement">
          The result is only the surface.<br />
          The interesting part is<br />
          what made it possible.
        </p>
        <ProjectRecordShowcase />
        <Footer />
      </OceanBackground>
    </main>
  )
}
