import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'
import type { SceneTransition } from './menuMotion'

interface MenuCloseButtonProps {
  content: HeroContent
  expanded: boolean
  reducedMotion: boolean
  sceneTransition: SceneTransition
  onClose: () => void
}

export function MenuCloseButton({
  content,
  expanded,
  reducedMotion,
  sceneTransition,
  onClose,
}: MenuCloseButtonProps) {
  return (
    <m.button
      className="menu-toggle"
      type="button"
      aria-label={content.closeMenu}
      autoFocus
      onClick={onClose}
      transition={sceneTransition}
    >
      <span className="menu-label" aria-hidden="true">
        <OpenLabel content={content} expanded={expanded} reducedMotion={reducedMotion} />
        <CloseLabel content={content} expanded={expanded} reducedMotion={reducedMotion} />
      </span>
      <MenuCloseIcon expanded={expanded} reducedMotion={reducedMotion} />
    </m.button>
  )
}

function OpenLabel({
  content,
  expanded,
  reducedMotion,
}: Pick<MenuCloseButtonProps, 'content' | 'expanded' | 'reducedMotion'>) {
  return (
    <m.span
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      animate={{
        opacity: expanded ? 0 : 1,
        filter: expanded && !reducedMotion ? 'blur(6px)' : 'blur(0px)',
      }}
      transition={{
        duration: reducedMotion ? 0 : expanded ? 0.28 : 0.45,
        delay: expanded || reducedMotion ? 0 : 0.12,
      }}
    >
      {content.menu}
    </m.span>
  )
}

function CloseLabel({
  content,
  expanded,
  reducedMotion,
}: Pick<MenuCloseButtonProps, 'content' | 'expanded' | 'reducedMotion'>) {
  return (
    <m.span
      initial={{ opacity: 0 }}
      animate={{
        opacity: expanded ? 1 : 0,
        filter: !expanded && !reducedMotion ? 'blur(6px)' : 'blur(0px)',
      }}
      transition={{
        duration: reducedMotion ? 0 : expanded ? 0.45 : 0.28,
        delay: expanded && !reducedMotion ? 0.12 : 0,
      }}
    >
      {content.close}
    </m.span>
  )
}

function MenuCloseIcon({
  expanded,
  reducedMotion,
}: Pick<MenuCloseButtonProps, 'expanded' | 'reducedMotion'>) {
  return (
    <span className="menu-icon" aria-hidden="true">
      <m.i
        animate={{ y: expanded ? 3 : 0, rotate: expanded ? 45 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
      />
      <m.i
        animate={{ y: expanded ? -3 : 0, rotate: expanded ? -45 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
      />
    </span>
  )
}
