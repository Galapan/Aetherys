import type { KeyboardEvent, RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent, Locale } from '../../content/hero'
import { LanguageSwitch, type NavigationProps } from './LanguageSwitch'
import { MenuLink } from './MenuLink'
import { MenuMovingHeader } from './MenuMovingHeader'
import { createReveal, type SceneTransition } from './menuMotion'
import type { PageSnapshot } from './useMenuScene'

interface MenuDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  content: HeroContent
  navigation: NavigationProps
  reducedMotion: boolean
  canHover: boolean
  expanded: boolean
  snapshot: PageSnapshot | null
  audioRef: RefObject<HTMLAudioElement | null>
  gap: number
  headerInset: number
  sceneTransition: SceneTransition
  hoveredLink: number | null
  setHoveredLink: (index: number | null) => void
  onClose: (id?: string) => void
  onSelectLocale: (locale: Locale) => void
}

export function MenuDialog({
  ref: dialogRef,
  content,
  navigation,
  reducedMotion,
  canHover,
  expanded,
  snapshot,
  audioRef,
  gap,
  headerInset,
  sceneTransition,
  hoveredLink,
  setHoveredLink,
  onClose,
  onSelectLocale,
}: MenuDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      id="navigation-menu"
      className="text-graphite fixed inset-0 m-auto h-dvh max-h-dvh w-full max-w-none overflow-auto border-0 bg-transparent p-0 [color-scheme:light] [--color-border:color-mix(in_srgb,var(--color-graphite)_14%,transparent)] [--color-secondary:color-mix(in_srgb,var(--color-graphite)_78%,transparent)] [--focus-outline:var(--color-graphite)] [--switch-pressed:var(--color-graphite)] backdrop:bg-transparent"
      aria-label={content.navigation}
      onKeyDown={containFocus}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {snapshot && (
        <>
          <MenuMovingHeader
            content={content}
            snapshot={snapshot}
            expanded={expanded}
            reducedMotion={reducedMotion}
            canHover={canHover}
            gap={gap}
            headerInset={headerInset}
            sceneTransition={sceneTransition}
            audioRef={audioRef}
            onClose={() => onClose()}
          />
          <MenuPanel
            content={content}
            navigation={navigation}
            expanded={expanded}
            reducedMotion={reducedMotion}
            canHover={canHover}
            gap={gap}
            headerInset={headerInset}
            sceneTransition={sceneTransition}
            hoveredLink={hoveredLink}
            setHoveredLink={setHoveredLink}
            onClose={onClose}
            onSelectLocale={onSelectLocale}
          />
        </>
      )}
    </dialog>
  )
}

interface MenuPanelProps {
  content: HeroContent
  navigation: NavigationProps
  expanded: boolean
  reducedMotion: boolean
  canHover: boolean
  gap: number
  headerInset: number
  sceneTransition: SceneTransition
  hoveredLink: number | null
  setHoveredLink: (index: number | null) => void
  onClose: (id: string) => void
  onSelectLocale: (locale: Locale) => void
}

function MenuPanel({
  content,
  navigation,
  expanded,
  reducedMotion,
  canHover,
  gap,
  headerInset,
  sceneTransition,
  hoveredLink,
  setHoveredLink,
  onClose,
  onSelectLocale,
}: MenuPanelProps) {
  const links = [
    { id: 'main', label: content.homeLabel },
    { id: 'proyectos', label: content.projectsLabel },
  ]

  return (
    <m.div
      className="absolute isolate flex flex-col overflow-hidden rounded"
      style={{ inset: gap }}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: expanded ? 1 : 0, y: reducedMotion || expanded ? 0 : 12 }}
      transition={sceneTransition}
    >
      <m.div
        className="pointer-events-none absolute inset-0 z-[-1] bg-[color-mix(in_srgb,var(--color-warm-white)_90%,transparent)] after:absolute after:top-1/2 after:left-1/2 after:aspect-square after:w-[clamp(320px,60vmin,720px)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-burgundy)_18%,transparent)_0%,color-mix(in_srgb,var(--color-burgundy)_8%,transparent)_35%,transparent_70%)] after:blur-[48px] after:content-['']"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{
          duration: reducedMotion ? 0 : expanded ? 0.4 : 0.32,
          delay: reducedMotion ? 0 : expanded ? 0.2 : 0.12,
        }}
      />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ paddingTop: headerInset + 60, paddingInline: gap, paddingBottom: gap }}
      >
        <div className="my-auto grid gap-12 py-12 lg:py-16">
          <nav className="flex flex-col items-stretch gap-2" aria-label={content.sectionsLabel}>
            {links.map((link, index) => (
              <MenuLink
                key={link.label}
                id={link.id}
                label={link.label}
                index={index}
                expanded={expanded}
                reducedMotion={reducedMotion}
                canHover={canHover}
                hoveredLink={hoveredLink}
                setHoveredLink={setHoveredLink}
                onClose={onClose}
              />
            ))}
          </nav>
        </div>
        <m.div className="self-end" {...createReveal(expanded, reducedMotion, 0.7)}>
          <LanguageSwitch {...navigation} canHover={canHover} onChange={onSelectLocale} />
        </m.div>
      </div>
    </m.div>
  )
}

function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return
  const controls = event.currentTarget.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled)',
  )
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
