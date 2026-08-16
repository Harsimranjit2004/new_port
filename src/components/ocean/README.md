# Reusable Ocean Background

This entire folder is self-contained and can be copied into another React + TypeScript project.

```text
ocean/
  OceanBackground.tsx       Component
  OceanBackground.css       Local background and height styles
  oceanGradient.ts          Continuous gradient generator
  oceanPalette.ts           Customizable depth colors
  types.ts                  Public TypeScript API
  useOceanBackground.ts     Reusable configuration hook
  index.ts                   Public exports
  README.md                  Usage
```

There are intentionally no particles, lines, texture images, blur overlays, WebGL effects, or page-specific sections. The component only provides a smooth ocean background and configurable page height.

## Homepage: white first, ocean afterward

Do not put the white hero inside the ocean component:

```tsx
import { OceanBackground } from './components/ocean'

export default function HomePage() {
  return (
    <main>
      <WhiteHero />

      <OceanBackground
        screens={6}
        startDepth="shallow"
        endDepth="deep"
      >
        <Projects />
        <FieldNotes />
        <Contact />
      </OceanBackground>
    </main>
  )
}
```

This produces:

```text
white hero
→ shallow cyan ocean
→ mid-ocean blue
→ deep teal
```

## Another page: begin directly in the ocean

```tsx
import { OceanBackground } from './components/ocean'

export default function WorkPage() {
  return (
    <OceanBackground
      as="main"
      screens={5}
      startDepth="mid"
      endDepth="abyss"
    >
      <WorkIntro />
      <ProjectList />
      <Contact />
    </OceanBackground>
  )
}
```

This page has no white beginning. Its first viewport starts at mid-ocean blue.

## Screen-height configuration

The `screens` prop controls the minimum total height:

```tsx
<OceanBackground screens={5}>...</OceanBackground>
```

means approximately:

```css
min-height: 500svh;
```

Examples:

```tsx
<OceanBackground screens={3}>...</OceanBackground>   // 300svh
<OceanBackground screens={5}>...</OceanBackground>   // 500svh
<OceanBackground screens={6}>...</OceanBackground>   // 600svh
<OceanBackground screens={7.5}>...</OceanBackground> // 750svh
```

The gradient stretches over the complete configured height. Increasing the number of screens makes the same descent happen more slowly. It does not add color boundaries between children.

If content becomes taller than the configured minimum, the element expands naturally. For predictable color pacing, choose a `screens` value that is at least as tall as the expected content.

## Available depths

```ts
type OceanDepth = 'shallow' | 'mid' | 'deep' | 'abyss'
```

Examples:

```tsx
// Bright ocean only
<OceanBackground screens={4} startDepth="shallow" endDepth="mid" />

// General underwater page
<OceanBackground screens={6} startDepth="shallow" endDepth="deep" />

// Deep technical page
<OceanBackground screens={5} startDepth="mid" endDepth="abyss" />

// One consistent depth
<OceanBackground screens={3} startDepth="deep" endDepth="deep" />
```

## Props

```ts
interface OceanBackgroundProps {
  children: React.ReactNode
  screens?: number
  startDepth?: 'shallow' | 'mid' | 'deep' | 'abyss'
  endDepth?: 'shallow' | 'mid' | 'deep' | 'abyss'
  as?: 'main' | 'section' | 'div'
  className?: string
  id?: string
  style?: React.CSSProperties
  labelledBy?: string
}
```

Defaults:

```text
screens: 5
startDepth: shallow
endDepth: deep
as: section
```

Invalid, infinite, zero, or negative screen values are safely clamped to one screen.

## Customizing the palette

Edit only `oceanPalette.ts`:

```ts
export const OCEAN_PALETTE = {
  shallow: [85, 201, 220],
  mid: [8, 122, 159],
  deep: [7, 61, 78],
  abyss: [4, 22, 31],
}
```

Colors use RGB tuples so the gradient generator can calculate softened intermediate stops automatically.

## Using the hook without the wrapper

For an existing section that cannot use `OceanBackground`:

```tsx
import { useOceanBackground } from './components/ocean'

function ExistingPage() {
  const oceanStyle = useOceanBackground({
    screens: 6,
    startDepth: 'shallow',
    endDepth: 'deep',
  })

  return <main className="ocean-background" style={oceanStyle}>...</main>
}
```

Import `OceanBackground.css` as well if the component itself is not imported anywhere.

## Design behavior

- One background covers the entire wrapper.
- Child sections receive no automatic backgrounds or borders.
- Intermediate depth colors are included automatically.
- Midpoint colors soften transitions and avoid obvious bands.
- The selected ending depth appears only near the bottom.
- There is no JavaScript scroll listener.
- There are no per-frame React updates.
- There are no animation dependencies.
- Reduced-motion mode keeps the same static gradient.

## Copying to another project

1. Copy the complete `ocean/` directory.
2. Import from its `index.ts`.
3. Keep `OceanBackground.css` beside the component.
4. Customize `oceanPalette.ts` if the destination brand uses different colors.
5. Wrap only the content that should be underwater.

No other portfolio files are required.
