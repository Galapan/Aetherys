import type { RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'
import { AudioToggle } from '../ui/AudioToggle'
import { MenuCloseButton } from './MenuCloseButton'
import type { PageSnapshot } from './useMenuScene'
import type { SceneTransition } from './menuMotion'

interface MenuMovingHeaderProps {
  content: HeroContent
  snapshot: PageSnapshot
  expanded: boolean
  reducedMotion: boolean
  canHover: boolean
  padding: number
  headerInset: number
  sceneTransition: SceneTransition
  audioRef: RefObject<HTMLAudioElement | null>
  onClose: () => void
}

export function MenuMovingHeader({
  content,
  snapshot,
  expanded,
  reducedMotion,
  canHover,
  padding,
  headerInset,
  sceneTransition,
  audioRef,
  onClose,
}: MenuMovingHeaderProps) {
  return (
    <m.div
      className="absolute z-2 flex h-11 items-center justify-between"
      style={{
        top: snapshot.headerTop,
        left: snapshot.headerLeft,
        right: snapshot.headerRight,
      }}
      initial={reducedMotion ? false : { y: 0, color: snapshot.headerColor }}
      animate={{
        y: expanded ? headerInset - snapshot.headerTop : 0,
        color: expanded ? snapshot.menuColor : snapshot.headerColor,
      }}
      transition={sceneTransition}
    >
      <m.span
        className="brand inline-flex min-h-11 items-center text-[28px] font-medium tracking-[-0.055em]"
        initial={{ x: 0 }}
        animate={{ x: expanded ? padding - snapshot.headerLeft : 0 }}
        transition={sceneTransition}
      >
        {content.brand}
      </m.span>
      <m.div
        className="flex items-center gap-[clamp(6px,1.8vw,12px)] md:gap-4"
        initial={{ x: 0 }}
        animate={{ x: expanded ? snapshot.headerRight - padding : 0 }}
        transition={sceneTransition}
      >
        <AudioToggle
          content={content}
          reducedMotion={reducedMotion}
          canHover={canHover}
          audioRef={audioRef}
        />
        <MenuCloseButton
          content={content}
          expanded={expanded}
          reducedMotion={reducedMotion}
          sceneTransition={sceneTransition}
          initialOffsetY={snapshot.triggerOffsetY}
          onClose={onClose}
        />
      </m.div>
    </m.div>
  )
}
