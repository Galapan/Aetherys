import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import { BUTTON_HOVER_SCALE, BUTTON_PRESS_SCALE, SPRING_BOUNCY, SPRING_PRESS } from './easing'

/** Primary button look; exported for buttons that drive their own motion (see NextStep). */
export const buttonClassName =
  'bg-burgundy text-warm-white focus-visible:outline-graphite inline-flex min-h-11 items-center justify-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait'

// The hover grows with a bounce and the press gives under the finger; opacity just fades.
const TRANSITION = { duration: 0.3, scale: SPRING_BOUNCY } as const
// Variant labels, not plain targets, so composed labels (see ContactForm) follow the button.
const VARIANTS = {
  rest: { scale: 1, opacity: 1 },
  hover: { scale: BUTTON_HOVER_SCALE, opacity: 1 },
  tap: { scale: BUTTON_PRESS_SCALE, transition: { ...TRANSITION, scale: SPRING_PRESS } },
  disabled: { scale: 1, opacity: 0.6 },
}

type ButtonProps = {
  /** Bouncy hover growth; pass false without fine hover or with reduced motion. */
  lift: boolean
  /** No press bounce with reduced motion. */
  reducedMotion: boolean
  className?: string
  children: ReactNode
} & (
  | { href: string; type?: never; disabled?: never }
  | { type: 'button' | 'submit'; href?: never; disabled?: boolean }
)

/** Primary button: a link when given `href`, otherwise a native button. */
export function Button({
  lift,
  reducedMotion,
  className,
  children,
  href,
  type,
  disabled,
}: ButtonProps) {
  const props = {
    className: className ? `${buttonClassName} ${className}` : buttonClassName,
    variants: VARIANTS,
    // The hover stays declared while disabled so the button eases back instead of snapping.
    whileHover: lift ? (disabled ? 'disabled' : 'hover') : undefined,
    // Touch too: the press does not depend on hover.
    whileTap: reducedMotion || disabled ? undefined : 'tap',
    animate: disabled ? 'disabled' : 'rest',
    initial: false,
    transition: TRANSITION,
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
