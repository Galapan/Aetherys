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
      className="menu-dialog"
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
      className="menu-panel"
      style={{ inset: gap }}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: expanded ? 1 : 0, y: reducedMotion || expanded ? 0 : 12 }}
      transition={sceneTransition}
    >
      <m.div
        className="menu-panel-background"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{
          duration: reducedMotion ? 0 : expanded ? 0.4 : 0.32,
          delay: reducedMotion ? 0 : expanded ? 0.2 : 0.12,
        }}
      />
      <div
        className="menu-scroll"
        style={{ paddingTop: headerInset + 60, paddingInline: gap, paddingBottom: gap }}
      >
        <div className="menu-content">
          <nav aria-label={content.sectionsLabel}>
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
        <m.div className="menu-language" {...createReveal(expanded, reducedMotion, 0.7)}>
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
