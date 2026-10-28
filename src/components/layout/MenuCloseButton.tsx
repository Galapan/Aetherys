import { m } from 'framer-motion'
import type { HeroContent } from '@/content/hero'
import type { SceneTransition } from './menuMotion'
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
      <MenuLabel content={content} expanded={expanded} reducedMotion={reducedMotion} swapOnMount />
    </m.button>
  )
}
