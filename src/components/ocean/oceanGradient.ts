import { OCEAN_DEPTH_ORDER, OCEAN_PALETTE, type OceanRgb } from './oceanPalette'
import type { OceanDepth } from './types'

function rgb(color: OceanRgb) {
  return `rgb(${color[0]} ${color[1]} ${color[2]})`
}

function mix(from: OceanRgb, to: OceanRgb, amount: number): OceanRgb {
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount)) as unknown as OceanRgb
}

/**
 * Produces one continuous gradient. Intermediate semantic depths are included
 * automatically, and softened midpoint stops prevent visible color bands.
 */
export function createOceanGradient(start: OceanDepth, end: OceanDepth) {
  const startIndex = OCEAN_DEPTH_ORDER.indexOf(start)
  const endIndex = OCEAN_DEPTH_ORDER.indexOf(end)
  const low = Math.min(startIndex, endIndex)
  const high = Math.max(startIndex, endIndex)
  const depths = OCEAN_DEPTH_ORDER.slice(low, high + 1)
  if (startIndex > endIndex) depths.reverse()

  if (depths.length === 1) {
    const color = rgb(OCEAN_PALETTE[depths[0]])
    return `linear-gradient(180deg, ${color} 0%, ${color} 100%)`
  }

  const segments = depths.length - 1
  const stops: string[] = [`${rgb(OCEAN_PALETTE[depths[0]])} 0%`]

  for (let index = 1; index < depths.length; index += 1) {
    const previous = OCEAN_PALETTE[depths[index - 1]]
    const current = OCEAN_PALETTE[depths[index]]
    const sectionStart = (index - 1) / segments
    const sectionEnd = index / segments
    const midpoint = sectionStart + (sectionEnd - sectionStart) * .52
    stops.push(`${rgb(mix(previous, current, .5))} ${Math.round(midpoint * 100)}%`)
    stops.push(`${rgb(current)} ${Math.round(sectionEnd * 100)}%`)
  }

  return `linear-gradient(180deg, ${stops.join(', ')})`
}
