import { m } from 'framer-motion'
import type { HeroContent } from '@/content/hero'
import { headerMotion } from './menuMotion'

interface MenuLabelProps {
  content: HeroContent
  /** Close shows while the menu is open, Menu otherwise. */
  expanded: boolean
  reducedMotion: boolean
  /** The menu's own button mounts open: it starts on Menu and plays the swap at once. */
  swapOnMount?: boolean
}

/**
 * Menu/Close word of the trigger. Both words share one masked cell, so the slot is as wide as
 * the wider word and the swap never shifts the header. From the reference: the leaving word
 * jumps up out of the mask and the other one rises from below once the header has settled.
 */
export function MenuLabel({
  content,
  expanded,
  reducedMotion,
  swapOnMount = false,
}: MenuLabelProps) {
  const animated = swapOnMount && !reducedMotion

  function word(shown: boolean, shownOnMount: boolean) {
    return {
      className: 'col-start-1 row-start-1 whitespace-nowrap',
      initial: animated ? { y: shownOnMount ? '0%' : '110%' } : (false as const),
      animate: {
        y: reducedMotion ? (shown ? '0%' : '110%') : shown ? ['110%', '0%'] : '-110%',
      },
      transition: reducedMotion
        ? { duration: 0 }
        : shown
          ? { ...headerMotion.wordEnter, delay: headerMotion.wordEnterDelay }
          : headerMotion.wordExit,
    }
  }

  return (
    <span className="grid h-[1.4em] shrink-0 justify-items-end overflow-y-clip" aria-hidden="true">
      <m.span {...word(!expanded, true)}>{content.menu}</m.span>
      <m.span {...word(expanded, false)}>{content.close}</m.span>
    </span>
  )
}
