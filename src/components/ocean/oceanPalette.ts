import type { OceanDepth } from './types'

export type OceanRgb = readonly [number, number, number]

/** Ordered from the lightest water to the deepest water. */
export const OCEAN_DEPTH_ORDER: readonly OceanDepth[] = ['shallow', 'mid', 'deep', 'abyss']

/** Change these values to re-theme every OceanBackground instance. */
export const OCEAN_PALETTE: Readonly<Record<OceanDepth, OceanRgb>> = {
  shallow: [85, 201, 220],
  mid: [8, 122, 159],
  deep: [7, 61, 78],
  abyss: [4, 22, 31],
}
