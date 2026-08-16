import { createElement } from 'react'
import './OceanBackground.css'
import type { OceanBackgroundProps } from './types'
import { useOceanBackground } from './useOceanBackground'

/**
 * A self-contained, content-agnostic ocean gradient.
 *
 * Keep a white hero outside this component for homepage use. On other pages,
 * render this as the top-level `main` to begin directly underwater.
 */
export default function OceanBackground({
  children,
  screens = 5,
  startDepth = 'shallow',
  endDepth = 'deep',
  showSurfaceWaves = false,
  as: Component = 'section',
  className = '',
  id,
  style,
  labelledBy,
}: OceanBackgroundProps) {
  const oceanStyle = useOceanBackground({ screens, startDepth, endDepth, style })

  return createElement(
    Component,
    {
      id,
      className: `ocean-background ${className}`.trim(),
      style: oceanStyle,
      'aria-labelledby': labelledBy,
      'data-ocean-start': startDepth,
      'data-ocean-end': endDepth,
      'data-ocean-screens': screens,
      'data-ocean-surface': showSurfaceWaves || undefined,
    },
    children,
  )
}
