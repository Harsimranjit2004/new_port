import type { CSSProperties, ReactNode } from 'react'

export type OceanDepth = 'shallow' | 'mid' | 'deep' | 'abyss'
export type OceanElement = 'main' | 'section' | 'div'

export interface OceanBackgroundProps {
  children?: ReactNode
  /** Minimum component height in viewport screens. 6 becomes 600svh. */
  screens?: number
  /** Color at the top of the component. */
  startDepth?: OceanDepth
  /** Color reached only at the bottom of the component. */
  endDepth?: OceanDepth
  /** Animated top edge for a white-surface-to-ocean transition. Defaults to false. */
  showSurfaceWaves?: boolean
  as?: OceanElement
  className?: string
  id?: string
  style?: CSSProperties
  labelledBy?: string
}

export interface OceanBackgroundConfig {
  screens?: number
  startDepth?: OceanDepth
  endDepth?: OceanDepth
  style?: CSSProperties
}
