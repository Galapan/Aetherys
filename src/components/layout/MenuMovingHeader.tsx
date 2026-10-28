import type { RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent } from '@/content/hero'
import { normalizePath } from '@/routes'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { HeaderContactGhost } from './HeaderContact'
import { MenuCloseButton } from './MenuCloseButton'
import type { PageSnapshot } from './useMenuScene'
import type { SceneTransition } from './menuMotion'

interface MenuMovingHeaderProps {
  content: HeroContent
  snapshot: PageSnapshot
  expanded: boolean
  reducedMotion: boolean
  /** Inset of the scaled stage on each side. */
  gap: number
  padding: number
  headerInset: number
  sceneTransition: SceneTransition
  audioRef: RefObject<HTMLAudioElement | null>
  /** Brand link: always the root route. */
  homeHref: string
  onClose: () => void
}

export function MenuMovingHeader({
  content,
  snapshot,
  expanded,
  reducedMotion,
  gap,
  padding,
  headerInset,
  sceneTransition,
  audioRef,
  homeHref,
  onClose,
}: MenuMovingHeaderProps) {
  // The header layer stays unscaled, so the targets are the stage's padding as it appears
  // once the stage has shrunk around its centre: gap + offset * scale.
  const scaleX = 1 - (gap * 2) / snapshot.width
  const scaleY = 1 - (gap * 2) / snapshot.height
  const inset = gap + padding * scaleX
  return (
    <m.div
      className="pointer-events-auto absolute z-2 flex h-11 items-center justify-between"
      style={{
        top: snapshot.headerTop,
        left: snapshot.headerLeft,
        right: snapshot.headerRight,
      }}
      initial={reducedMotion ? false : { y: 0 }}
      animate={{ y: expanded ? gap + headerInset * scaleY - snapshot.headerTop : 0 }}
      transition={sceneTransition}
    >
      <m.a
        className="brand pointer-events-auto inline-flex min-h-11 items-center text-[28px] font-medium tracking-[-0.055em]"
        href={homeHref}
        aria-label={content.home}
        onClick={() => {
          // Same page: close the menu and let the router scroll to the top.
          const destination = new URL(homeHref, window.location.href)
          if (normalizePath(destination.pathname) === normalizePath(window.location.pathname)) {
            onClose()
          }
        }}
        initial={{ x: 0 }}
        animate={{ x: expanded ? inset - snapshot.headerLeft : 0 }}
        transition={sceneTransition}
      >
        {content.brand}
      </m.a>
      <m.div
        className="flex items-center gap-[clamp(6px,1.8vw,12px)] md:gap-4"
        initial={{ x: 0 }}
        animate={{ x: expanded ? snapshot.headerRight - inset : 0 }}
        transition={sceneTransition}
      >
        <AudioToggle content={content} reducedMotion={reducedMotion} audioRef={audioRef} />
        <HeaderContactGhost
          label={content.contact}
          expanded={expanded}
          reducedMotion={reducedMotion}
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
