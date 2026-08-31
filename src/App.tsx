import { useEffect, useRef, useState } from 'react'
import { Footer } from './components/footer'
import { Navbar } from './components/navbar'
import { OceanBackground } from './components/ocean'
import { useHomeScrollTimeline } from './hooks/useHomeScrollTimeline'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { publicApi, settingsMap, type SitePageSection } from './lib/publicApi'
import ProjectRecordShowcase from './pages/ProjectRecordShowcase'
import SurfaceHero from './sections/home/SurfaceHero'
import './App.css'

const fallbackDescentLines = [
  'The result is only the surface.',
  'The interesting part is',
  'what made it possible.',
]

interface HomeContent {
  name?: string
  role?: string
  eyebrow?: string
  disciplines?: string[]
  descentLines: string[]
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const strings = value.map(nonEmptyString).filter((item): item is string => Boolean(item))
  return strings.length ? strings : undefined
}

export default function App() {
  const rootRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [homeContent, setHomeContent] = useState<HomeContent>({ descentLines: fallbackDescentLines })

  useEffect(() => {
    let active = true

    Promise.allSettled([publicApi.profile(), publicApi.settings(), publicApi.homePage()]).then(
      ([profileResult, settingsResult, pageResult]) => {
        if (!active) return

        const profile = profileResult.status === 'fulfilled' ? profileResult.value : undefined
        const settings = settingsResult.status === 'fulfilled' ? settingsMap(settingsResult.value) : {}
        const home = settings.home && typeof settings.home === 'object' ? settings.home as Record<string, unknown> : {}
        const hero = home.hero && typeof home.hero === 'object' ? home.hero as Record<string, unknown> : {}
        let descentLines: string[] | undefined

        if (pageResult.status === 'fulfilled') {
          const payload = pageResult.value
          if (Array.isArray(payload)) {
            const descent = (payload as SitePageSection[]).find(
              (section) => section.section === 'descent_statement' && section.enabled !== false,
            )
            descentLines = stringArray(descent?.content?.lines)
          } else {
            const descent = payload.descent_statement
            if (descent && typeof descent === 'object') {
              const record = descent as Record<string, unknown>
              const content = record.content && typeof record.content === 'object'
                ? record.content as Record<string, unknown>
                : record
              descentLines = stringArray(content.lines)
            }
          }
        }

        setHomeContent({
          name: nonEmptyString(profile?.name),
          role: nonEmptyString(profile?.role),
          eyebrow: nonEmptyString(hero.eyebrow),
          disciplines: stringArray(hero.disciplines),
          descentLines: descentLines ?? fallbackDescentLines,
        })
      },
    )

    return () => { active = false }
  }, [])

  useSmoothScroll(reducedMotion)
  useHomeScrollTimeline({ rootRef, heroRef, reducedMotion })

  return (
    <main id="top" ref={rootRef}>
      <Navbar />
      <SurfaceHero
        heroRef={heroRef}
        reducedMotion={reducedMotion}
        name={homeContent.name}
        role={homeContent.role}
        eyebrow={homeContent.eyebrow}
        disciplines={homeContent.disciplines}
      />
      <OceanBackground screens={1} startDepth="shallow" endDepth="deep" showSurfaceWaves>
        <p className="descent-statement">
          {homeContent.descentLines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < homeContent.descentLines.length - 1 && <br />}
            </span>
          ))}
        </p>
        <ProjectRecordShowcase limit={3} />
        <Footer />
      </OceanBackground>
    </main>
  )
}
