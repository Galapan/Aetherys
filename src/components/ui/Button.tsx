import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import { REVEAL_EASE } from './easing'

/** Primary button look; exported for buttons that drive their own motion (see NextStep). */
export const buttonClassName =
  'bg-burgundy text-warm-white focus-visible:outline-graphite inline-flex min-h-11 items-center justify-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait'

const LIFT = { y: -2 }
// Long enough, on the site's reveal curve, that the lift and its return read as one glide.
const LIFT_TRANSITION = { duration: 0.35, ease: REVEAL_EASE } as const

type ButtonProps = {
  /** Hover lift; pass false without fine hover or with reduced motion. */
  lift: boolean
  className?: string
  children: ReactNode
} & (
  | { href: string; type?: never; disabled?: never }
  | { type: 'button' | 'submit'; href?: never; disabled?: boolean }
)

/** Primary button: a link when given `href`, otherwise a native button. */
export function Button({ lift, className, children, href, type, disabled }: ButtonProps) {
  const props = {
    className: className ? `${buttonClassName} ${className}` : buttonClassName,
    // The hover stays declared while disabled so the button eases back instead of snapping.
    whileHover: lift ? (disabled ? { y: 0 } : LIFT) : undefined,
    animate: { opacity: disabled ? 0.6 : 1 },
    initial: false,
    transition: LIFT_TRANSITION,
  } as const
  return href === undefined ? (
    <m.button {...props} type={type} disabled={disabled}>
      {children}
    </m.button>
  ) : (
    <m.a {...props} href={href}>
      {children}
    </m.a>
  )
}
