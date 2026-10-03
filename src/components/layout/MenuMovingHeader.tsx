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
  gap: number
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
  gap,
  headerInset,
  sceneTransition,
  audioRef,
  onClose,
}: MenuMovingHeaderProps) {
  return (
    <m.div
      className="menu-moving-header"
      style={{
        top: snapshot.headerTop,
        left: snapshot.headerLeft,
        right: snapshot.headerRight,
      }}
      initial={{ y: 0, color: 'var(--color-warm-white)' }}
      animate={{
        y: expanded && !reducedMotion ? gap + headerInset - snapshot.headerTop : 0,
        color: expanded ? 'var(--color-graphite)' : 'var(--color-warm-white)',
      }}
      transition={sceneTransition}
    >
      <m.span
        className="brand"
        initial={{ x: 0 }}
        animate={{ x: expanded && !reducedMotion ? gap * 2 - snapshot.headerLeft : 0 }}
        transition={sceneTransition}
      >
        {content.brand}
      </m.span>
      <m.div
        className="header-actions menu-moving-actions"
        initial={{ x: 0 }}
        animate={{ x: expanded && !reducedMotion ? snapshot.headerRight - gap * 2 : 0 }}
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
          onClose={onClose}
        />
      </m.div>
    </m.div>
  )
}
