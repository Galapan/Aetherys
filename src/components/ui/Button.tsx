import type { ReactNode } from 'react'
import { m } from 'framer-motion'

/** Primary button look; exported for buttons that drive their own motion (see NextStep). */
export const buttonClassName =
  'bg-burgundy text-warm-white focus-visible:outline-graphite inline-flex min-h-11 items-center justify-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4'

const LIFT = { y: -2 }
const LIFT_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const

type ButtonProps = {
  /** Hover lift; pass false without fine hover or with reduced motion. */
  lift: boolean
  className?: string
  children: ReactNode
} & ({ href: string; type?: never } | { type: 'button' | 'submit'; href?: never })

/** Primary button: a link when given `href`, otherwise a native button. */
export function Button({ lift, className, children, href, type }: ButtonProps) {
  const props = {
    className: className ? `${buttonClassName} ${className}` : buttonClassName,
    whileHover: lift ? LIFT : undefined,
    transition: LIFT_TRANSITION,
  }
  return href === undefined ? (
    <m.button {...props} type={type}>
      {children}
    </m.button>
  ) : (
    <m.a {...props} href={href}>
      {children}
    </m.a>
  )
}
