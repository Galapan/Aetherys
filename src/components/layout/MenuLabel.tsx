import { useLayoutEffect, useRef } from 'react'
import { animate, m, useMotionValue, type AnimationPlaybackControls } from 'framer-motion'
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
 * Menu/Close word of the trigger. Both words share one masked cell, right-aligned, so the
 * trigger's right edge never moves during the swap. From the reference: the leaving word
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

  // The slot is as wide as the word on show, so the gap before it matches the header's other
  // gaps; it resizes with Contact's fold, so the header settles in one movement.
  const menuWord = useRef<HTMLSpanElement>(null)
  const closeWord = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | 'auto'>('auto')
  const measured = useRef(false)

  useLayoutEffect(() => {
    const menu = menuWord.current
    const close = closeWord.current
    if (!menu || !close) return
    let resize: AnimationPlaybackControls | undefined
    let goal: number | undefined
    function fit() {
      if (!menu || !close) return
      const target = (expanded ? close : menu).offsetWidth
      // Not laid out yet: the menu's header mounts inside the still-closed dialog. The
      // observer below measures again once it shows.
      if (target === 0) return
      if (!measured.current) {
        measured.current = true
        // The open menu's own button starts on Menu and plays the swap at once.
        width.jump(animated ? menu.offsetWidth : target)
      }
      if (reducedMotion) {
        width.jump(target)
        return
      }
      if (target === goal || target === width.get()) return
      goal = target
      resize?.stop()
      resize = animate(width, target, headerMotion.fold)
    }
    fit()
    // Also follows the words' own size: first layout, locale and font changes.
    const observer = new ResizeObserver(fit)
    observer.observe(menu)
    observer.observe(close)
    return () => {
      observer.disconnect()
      resize?.stop()
    }
  }, [expanded, reducedMotion, animated, width])

  return (
    <m.span
      className="grid h-[1.4em] shrink-0 grid-cols-[minmax(0,1fr)] [justify-items:unsafe_end] overflow-y-clip"
      style={{ width }}
      aria-hidden="true"
    >
      <m.span ref={menuWord} {...word(!expanded, true)}>
        {content.menu}
      </m.span>
      <m.span ref={closeWord} {...word(expanded, false)}>
        {content.close}
      </m.span>
    </m.span>
  )
}
