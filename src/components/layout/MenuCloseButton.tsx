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
      className="flex min-h-11 items-center gap-4 rounded border-0 bg-transparent px-2 text-[20px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-inherit uppercase"
      type="button"
      aria-label={content.closeMenu}
      autoFocus
      onClick={onClose}
      transition={sceneTransition}
    >
      <span className="grid w-[84px] items-center justify-items-end" aria-hidden="true">
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
      className="col-start-1 row-start-1 whitespace-nowrap"
      initial={{ opacity: 1 }}
      animate={{
        opacity: expanded ? 0 : 1,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.3,
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
      className="col-start-1 row-start-1 whitespace-nowrap"
      initial={{ opacity: 0 }}
      animate={{
        opacity: expanded ? 1 : 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.3,
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
    <span className="grid w-5 gap-[5px]" aria-hidden="true">
      <m.i
        className="block h-px w-5 bg-current"
        animate={{ y: expanded ? 3 : 0, rotate: expanded ? 45 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
      />
      <m.i
        className="block h-px w-5 bg-current"
        animate={{ y: expanded ? -3 : 0, rotate: expanded ? -45 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
      />
    </span>
  )
}
