import type { CSSProperties } from 'react'
import './Logo.css'

export interface LogoProps {
  variant?: 'dark' | 'light'
  size?: number | string
  className?: string
  label?: string
}

export default function Logo({
  variant = 'dark',
  size = 48,
  className = '',
  label = 'Harsimranjit',
}: LogoProps) {
  const style = { '--logo-size': typeof size === 'number' ? `${size}px` : size } as CSSProperties

  return (
    <span
      className={`logo logo--${variant} ${className}`.trim()}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <span aria-hidden="true">h.</span>
    </span>
  )
}
