import { useMemo, type CSSProperties } from 'react'
import { createOceanGradient } from './oceanGradient'
import type { OceanBackgroundConfig } from './types'

/** Returns the local CSS variables used by OceanBackground. */
export function useOceanBackground({
  screens = 5,
  startDepth = 'shallow',
  endDepth = 'deep',
  style,
}: OceanBackgroundConfig = {}) {
  return useMemo(() => {
    const safeScreens = Number.isFinite(screens) ? Math.max(1, screens) : 1
    return {
      '--ocean-screens': safeScreens,
      '--ocean-gradient': createOceanGradient(startDepth, endDepth),
      ...style,
    } as CSSProperties
  }, [endDepth, screens, startDepth, style])
}
