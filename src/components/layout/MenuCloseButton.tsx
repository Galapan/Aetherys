import { useEffect } from 'react'
import { m, useMotionValue } from 'framer-motion'
import { kick } from '@/components/ui/easing'
import type { HeroContent } from '@/content/hero'
import { headerMotion, type SceneTransition } from './menuMotion'
import { MenuLabel } from './MenuLabel'

interface MenuCloseButtonProps {
  content: HeroContent
  expanded: boolean
  reducedMotion: boolean
  sceneTransition: SceneTransition
  initialOffsetY: number
  onClose: () => void
}

export function MenuCloseButton({
  content,
  expanded,
  reducedMotion,
  sceneTransition,
  initialOffsetY,
  onClose,
}: MenuCloseButtonProps) {
  // Mounting is the menu opening, so the first run is the absorb kick.
  const x = useMotionValue(0)
  useEffect(() => {
    if (reducedMotion) return
    const { offset, delay } = expanded ? headerMotion.absorb : headerMotion.eject
    const move = kick(x, offset, delay)
    return () => move.stop()
  }, [expanded, reducedMotion, x])

  return (
    <m.button
      className="flex min-h-11 items-center rounded border-0 bg-transparent px-2 text-[20px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-inherit uppercase"
      type="button"
      aria-label={content.closeMenu}
      data-menu-close
      onClick={() => onClose()}
      initial={reducedMotion ? false : { y: initialOffsetY }}
      animate={{ y: 0 }}
      transition={sceneTransition}
    >
      {/* Its own layer: the button's y belongs to the scene transition. */}
      <m.span className="flex" style={{ x }}>
        <MenuLabel
          content={content}
          expanded={expanded}
          reducedMotion={reducedMotion}
          swapOnMount
        />
      </m.span>
    </m.button>
  )
}
