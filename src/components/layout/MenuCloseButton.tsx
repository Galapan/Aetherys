import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'
import { createLabelTransition, type SceneTransition } from './menuMotion'

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
      className="flex min-h-11 items-center gap-4 rounded border-0 bg-transparent px-2 text-[20px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-inherit uppercase"
      type="button"
      aria-label={content.closeMenu}
      autoFocus
      onClick={onClose}
      initial={reducedMotion ? false : { y: initialOffsetY }}
      animate={{ y: 0 }}
      transition={sceneTransition}
    >
      <span
        className="grid w-[84px] shrink-0 grid-cols-[minmax(0,1fr)] items-center justify-items-end"
        aria-hidden="true"
      >
        <OpenLabel
          content={content}
          expanded={expanded}
          reducedMotion={reducedMotion}
          sceneTransition={sceneTransition}
        />
        <CloseLabel
          content={content}
          expanded={expanded}
          reducedMotion={reducedMotion}
          sceneTransition={sceneTransition}
        />
      </span>
      <MenuCloseIcon expanded={expanded} sceneTransition={sceneTransition} />
    </m.button>
  )
}

function OpenLabel({
  content,
  expanded,
  reducedMotion,
  sceneTransition,
}: Pick<MenuCloseButtonProps, 'content' | 'expanded' | 'reducedMotion' | 'sceneTransition'>) {
  return (
    <m.span
      className="col-start-1 row-start-1 whitespace-nowrap"
      initial={reducedMotion ? false : { opacity: 1, filter: 'blur(0px)' }}
      animate={{
        opacity: expanded ? 0 : 1,
        filter: expanded ? 'blur(6px)' : 'blur(0px)',
      }}
      transition={createLabelTransition(sceneTransition)}
    >
      {content.menu}
    </m.span>
  )
}

function CloseLabel({
  content,
  expanded,
  reducedMotion,
  sceneTransition,
}: Pick<MenuCloseButtonProps, 'content' | 'expanded' | 'reducedMotion' | 'sceneTransition'>) {
  return (
    <m.span
      className="col-start-1 row-start-1 whitespace-nowrap"
      initial={reducedMotion ? false : { opacity: 0, filter: 'blur(6px)' }}
      animate={{
        opacity: expanded ? 1 : 0,
        filter: expanded ? 'blur(0px)' : 'blur(6px)',
      }}
      transition={createLabelTransition(sceneTransition)}
    >
      {content.close}
    </m.span>
  )
}

function MenuCloseIcon({
  expanded,
  sceneTransition,
}: Pick<MenuCloseButtonProps, 'expanded' | 'sceneTransition'>) {
  const transition = { ...sceneTransition, duration: Math.min(0.45, sceneTransition.duration) }
  return (
    <span className="grid w-5 gap-[5px]" aria-hidden="true">
      <m.i
        className="block h-px w-5 bg-current"
        animate={{ y: expanded ? 3 : 0, rotate: expanded ? 45 : 0 }}
        initial={false}
        transition={transition}
      />
      <m.i
        className="block h-px w-5 bg-current"
        animate={{ y: expanded ? -3 : 0, rotate: expanded ? -45 : 0 }}
        initial={false}
        transition={transition}
      />
    </span>
  )
}
