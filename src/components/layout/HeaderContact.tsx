import { m } from 'framer-motion'
import { headerMotion } from './menuMotion'

// Same type as the menu trigger. Phones keep only the trigger, as the reference does.
const contactClassName =
  'min-h-11 items-center px-2 text-[20px] leading-[1.4] tracking-[0.08em] whitespace-nowrap uppercase'

/** Contact link of the page header. */
export function HeaderContactLink({ href, label }: { href: string; label: string }) {
  return (
    <a className={`${contactClassName} pointer-events-auto hidden md:inline-flex`} href={href}>
      {label}
    </a>
  )
}

interface HeaderContactGhostProps {
  label: string
  expanded: boolean
  reducedMotion: boolean
}

// Folding also takes back the header's flex gap (md:gap-4), so the dash slides all the way to
// the trigger.
const folded = { width: 0, marginRight: '-1rem' }
const unfolded = { width: 'auto', marginRight: '0rem' }

/**
 * Copy of the contact link in the menu's moving header. From the reference: opening folds the
 * word into its centre while the dash slides into its place, before the scene moves; closing
 * unfolds it the same way before the page scales back, so it lands on the page header's link.
 * It is only seen while the header moves (the menu lists Contact itself), so it is not
 * focusable or announced.
 */
export function HeaderContactGhost({ label, expanded, reducedMotion }: HeaderContactGhostProps) {
  return (
    // The word stays centred in a clipping box, so a narrowing box cuts it evenly on both sides.
    <m.span
      className="pointer-events-none hidden justify-center overflow-hidden md:flex"
      aria-hidden="true"
      initial={reducedMotion ? false : unfolded}
      animate={expanded ? folded : unfolded}
      transition={reducedMotion ? { duration: 0 } : headerMotion.fold}
    >
      <span className={`${contactClassName} inline-flex shrink-0`}>{label}</span>
    </m.span>
  )
}
