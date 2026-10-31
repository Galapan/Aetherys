import { m, type Variants } from 'framer-motion'
import { REVEAL_EASE } from './easing'

// Each letter rolls out upwards while its copy rolls in from below, one after another.
const ROLL_DURATION = 0.5
const ROLL_STAGGER = 0.022

const roll = (to: string) => (index: number) => ({
  y: to,
  transition: { duration: ROLL_DURATION, ease: REVEAL_EASE, delay: index * ROLL_STAGGER },
})

// Labels inherited from the parent button: `hover` (Button) and `active` (NextStep) roll the
// text; `rest` and `disabled` bring it back.
const outgoing: Variants = {
  rest: roll('0%'),
  disabled: roll('0%'),
  hover: roll('-100%'),
  active: roll('-100%'),
}
const incoming: Variants = {
  rest: roll('100%'),
  disabled: roll('100%'),
  hover: roll('0%'),
  active: roll('0%'),
}

/**
 * Button label whose letters roll on the parent's hover, staggered. It has no state of its
 * own: it follows the variant labels of the nearest motion parent, so the parent decides when
 * (and whether, e.g. with reduced motion) it plays.
 */
export function RollingText({ text }: { text: string }) {
  return (
    <span className="inline-flex">
      <span className="sr-only">{text}</span>
      <span className="inline-flex" aria-hidden="true">
        {Array.from(text).map((char, index) => {
          const glyph = char === ' ' ? ' ' : char
          return (
            <span key={index} className="relative inline-block overflow-hidden">
              <m.span className="inline-block" variants={outgoing} custom={index}>
                {glyph}
              </m.span>
              <m.span
                className="absolute inset-0 inline-block"
                variants={incoming}
                custom={index}
                initial={{ y: '100%' }}
              >
                {glyph}
              </m.span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
