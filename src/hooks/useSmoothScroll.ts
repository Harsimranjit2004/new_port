import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useSmoothScroll(reducedMotion: boolean) {
  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1 })
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    let frame = 0
    const animate = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(animate)
    }
    const onVisibility = () => {
      document.documentElement.toggleAttribute('data-motion-paused', document.hidden)
      if (document.hidden) lenis.stop()
      else lenis.start()
    }

    frame = requestAnimationFrame(animate)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      document.documentElement.removeAttribute('data-motion-paused')
      lenis.off('scroll', onScroll)
      lenis.destroy()
    }
  }, [reducedMotion])
}
