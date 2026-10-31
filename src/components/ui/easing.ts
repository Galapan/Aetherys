import { animate, type MotionValue } from 'framer-motion'

/** Shared ease-out curve of the site's reveals, hovers and slides. */
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Bouncy springs, only for answers to something the visitor did (a press, a drag, a state
 * change, hitting an edge); never for scroll reveals or ambient motion.
 */
/** Impacts: overshoots clearly once and settles. */
export const SPRING_BOUNCY = { type: 'spring', visualDuration: 0.35, bounce: 0.55 } as const
/** Presses: a quicker, tighter give. */
export const SPRING_PRESS = { type: 'spring', visualDuration: 0.25, bounce: 0.45 } as const

const KICK_PUSH = { duration: 0.08, ease: [0.16, 1, 0.3, 1] as const }

/**
 * Knocks a value at rest by `offset` and lets it spring back to 0 on SPRING_BOUNCY. Done in
 * two steps because Motion skips a spring whose start and end match, whatever its velocity.
 */
export function kick(value: MotionValue<number>, offset: number, delay = 0) {
  let stopped = false
  let current = animate(value, offset, { ...KICK_PUSH, delay })
  current.then(() => {
    if (!stopped) current = animate(value, 0, SPRING_BOUNCY)
  })
  return {
    stop() {
      stopped = true
      current.stop()
    },
  }
}
