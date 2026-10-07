import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'
import { MenuDialog } from './MenuDialog'
import { LocaleTransition } from './LocaleTransition'
import type { NavigationProps } from './LanguageSwitch'
import { createSceneTransition, getMenuDimensions } from './menuMotion'
import { PageSurface } from './PageSurface'
import { SiteHeader } from './SiteHeader'
import { useMenuScene } from './useMenuScene'
import { audioSrc } from '../ui/AudioToggle'
import type { Locale } from '../../content/hero'

interface NavbarProps extends NavigationProps {
  children: ReactNode
  reducedMotion: boolean
  headerInvert: MotionValue<number>
}

export function Navbar({ children, reducedMotion, headerInvert, ...props }: NavbarProps) {
  const { content } = props
  const canHover = Boolean(props.canHover && !reducedMotion)
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null)
  const [hoveredLink, setHoveredLink] = useState<number | null>(null)
  const page = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const audioElement = useRef<HTMLAudioElement>(null)
  const {
    snapshot,
    expanded,
    mounted,
    dialogRef,
    triggerRef,
    openMenu: openMenuScene,
    closeMenu,
    resetScene,
    onAnimationComplete,
  } = useMenuScene(reducedMotion)
  const { gap, headerInset } = getMenuDimensions(snapshot)
  const compact = Boolean(expanded && !reducedMotion && snapshot)
  const sceneTransition = createSceneTransition(expanded, reducedMotion, pendingLocale !== null)

  useEffect(() => () => audioElement.current?.pause(), [])

  function applyHeaderMix(value: number) {
    header.current?.style.setProperty('--header-mix', `${((1 - value) * 100).toFixed(2)}%`)
  }

  useMotionValueEvent(headerInvert, 'change', applyHeaderMix)

  useEffect(() => {
    applyHeaderMix(headerInvert.get())
  }, [headerInvert])

  function openMenu() {
    if (mounted) return
    setHoveredLink(null)
    openMenuScene(header.current, page.current)
  }

  function selectLocale(next: Locale) {
    if (next !== props.locale && pendingLocale === null) setPendingLocale(next)
  }

  return (
    <>
      <audio className="hidden" ref={audioElement} src={audioSrc} preload="metadata" />
      <PageSurface
        ref={page}
        snapshot={snapshot}
        gap={gap}
        compact={compact}
        expanded={expanded}
        reducedMotion={reducedMotion}
        hasPendingLocale={pendingLocale !== null}
        sceneTransition={sceneTransition}
        onAnimationComplete={onAnimationComplete}
      >
        <SiteHeader
          ref={header}
          triggerRef={triggerRef}
          audioRef={audioElement}
          content={content}
          reducedMotion={reducedMotion}
          canHover={canHover}
          mounted={mounted}
          onOpen={openMenu}
        />
        {children}
      </PageSurface>
      <MenuDialog
        content={content}
        navigation={{ ...props, canHover }}
        reducedMotion={reducedMotion}
        canHover={canHover}
        expanded={expanded}
        snapshot={snapshot}
        ref={dialogRef}
        audioRef={audioElement}
        gap={gap}
        headerInset={headerInset}
        sceneTransition={sceneTransition}
        hoveredLink={hoveredLink}
        setHoveredLink={setHoveredLink}
        onClose={(id) => closeMenu(id)}
        onSelectLocale={selectLocale}
      />
      <LocaleTransition
        locale={pendingLocale}
        content={content}
        reducedMotion={reducedMotion}
        onChange={props.onChange}
        onCovered={resetScene}
        onFinished={() => {
          setPendingLocale(null)
          triggerRef.current?.focus({ preventScroll: true })
        }}
      />
    </>
  )
}
