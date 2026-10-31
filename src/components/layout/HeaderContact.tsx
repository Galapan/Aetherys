import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, m, useMotionValue, useTransform } from 'framer-motion'
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
const FLEX_GAP = 16

/**
 * Copy of the contact link in the menu's moving header. From the reference: opening folds the
 * word into its centre while the dash slides into its place, before the scene moves; closing
 * unfolds it the same way before the page scales back, so it lands on the page header's link.
 * It is only seen while the header moves (the menu lists Contact itself), so it is not
 * focusable or announced.
 */
export function HeaderContactGhost({ label, expanded, reducedMotion }: HeaderContactGhostProps) {
  const word = useRef<HTMLSpanElement>(null)
  const wordWidth = useMotionValue(0)
  // 0 unfolded, 1 folded, bouncing both ways. Folding overshoots past 1: the box is already
  // closed, so the margin takes the rest and the dash runs past the trigger. Unfolding overshoots
  // below 0: the box opens wider than the word, so the dash runs past its place on the left.
  const fold = useMotionValue(reducedMotion && expanded ? 1 : 0)
  const space = useTransform(() => (wordWidth.get() + FLEX_GAP) * (1 - fold.get()) - FLEX_GAP)
  const width = useTransform(() => Math.max(0, space.get()))
  const marginRight = useTransform(() => Math.min(0, space.get()))

  // Measured by an observer: the menu's header mounts inside the still-closed dialog, where the
  // word has no size yet.
  useLayoutEffect(() => {
    const element = word.current
    if (!element) return
    const measure = () => wordWidth.jump(element.offsetWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [wordWidth])

  useEffect(() => {
    const target = expanded ? 1 : 0
    if (reducedMotion) {
      fold.jump(target)
      return
    }
    const move = animate(fold, target, headerMotion.foldBounce)
    return () => move.stop()
  }, [expanded, reducedMotion, fold])

  return (
    // The word stays centred in a clipping box, so a narrowing box cuts it evenly on both sides.
    <m.span
      className="pointer-events-none hidden justify-center overflow-hidden md:flex"
      style={{ width, marginRight }}
      aria-hidden="true"
    >
      <span ref={word} className={`${contactClassName} inline-flex shrink-0`}>
        {label}
      </span>
    </m.span>
  )
}
