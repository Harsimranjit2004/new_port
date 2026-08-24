import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface HomeScrollTimelineOptions {
  rootRef: RefObject<HTMLElement | null>
  heroRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

export function useHomeScrollTimeline({ rootRef, heroRef, reducedMotion }: HomeScrollTimelineOptions) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const hero = heroRef.current
    if (reducedMotion || !root || !hero) return

    const mobile = window.matchMedia('(max-width: 800px)').matches
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.8,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to('.hero-content', {
          y: mobile ? -55 : -105,
          scale: mobile ? 0.98 : 0.965,
          autoAlpha: mobile ? 0.15 : 0.08,
          filter: `blur(${mobile ? 4 : 9}px)`,
        }, 0)
        .to('.atmosphere-scroll', {
          y: mobile ? 26 : 54,
          scale: mobile ? 1.035 : 1.08,
          opacity: mobile ? 0.66 : 0.56,
        }, 0)
        .to('.portable-ocean-nav', {
          width: () => Math.min(820, window.innerWidth - 32),
          y: -3,
        }, 0.08)
    }, root)

    ScrollTrigger.refresh()
    return () => context.revert()
  }, [heroRef, reducedMotion, rootRef])
}
