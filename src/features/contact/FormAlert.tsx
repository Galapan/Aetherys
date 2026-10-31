import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import { REVEAL_EASE, SPRING_BOUNCY } from '@/components/ui/easing'

interface FormAlertProps {
  kind: 'sent' | 'error'
  reducedMotion: boolean
  children: ReactNode
}

// Burgundy rule sweeping in like the invalid underline, the icon drawing itself, then the
// message rising into place.
export function FormAlert({ kind, reducedMotion, children }: FormAlertProps) {
  const timing = (duration: number, delay = 0) => ({
    duration: reducedMotion ? 0 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: REVEAL_EASE,
  })
  const draw = {
    initial: reducedMotion ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: timing(0.5, 0.25),
  } as const

  return (
    <m.div
      className="relative flex items-start gap-3 pt-4 text-[14px] leading-[1.4]"
      // The alert lands with a small bounce.
      initial={reducedMotion ? false : { y: 8, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={SPRING_BOUNCY}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: timing(0.25) }}
    >
      <m.span
        className="bg-burgundy pointer-events-none absolute inset-x-0 top-0 h-px origin-left"
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={timing(0.6)}
      />
      <svg
        className="text-burgundy mt-px h-4 w-4 shrink-0"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        {kind === 'sent' ? (
          <m.path
            d="M3 8.5l3.25 3.25L13 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            {...draw}
          />
        ) : (
          <>
            <m.path d="M8 3v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" {...draw} />
            <m.path
              d="M8 12.25v.75"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              {...draw}
            />
          </>
        )}
      </svg>
      <m.p
        className="m-0"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={timing(0.5, 0.15)}
      >
        {children}
      </m.p>
    </m.div>
  )
}
