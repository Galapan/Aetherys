import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MenuDialog } from './MenuDialog'
import { LanguageTransition } from './LanguageTransition'
import { LocaleTransition } from './LocaleTransition'
import type { NavigationProps } from './LanguageSwitch'
import { createSceneTransition, getMenuDimensions } from './menuMotion'
import { PageSurface } from './PageSurface'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { useMenuScene } from './useMenuScene'
import { usePageTransition, type PageDestination } from './usePageTransition'
import { audioSrc } from '@/components/ui/AudioToggle'
import type { Locale } from '@/content/hero'
import { parseRoute, routes, withLocale } from '@/routes'

interface NavbarProps extends NavigationProps {
  children: ReactNode
  reducedMotion: boolean
  /** Path of the page currently rendered. */
  path: string
  /** Swaps the rendered page; called while the curtain covers the screen. */
  onNavigate: (destination: PageDestination | null) => void
}

export function Navbar({ children, reducedMotion, path, onNavigate, ...props }: NavbarProps) {
  const { content, locale } = props
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
    headerLayerRef,
    triggerRef,
    openMenu: openMenuScene,
    closeMenu,
    resetScene,
    onAnimationComplete,
  } = useMenuScene(reducedMotion)
  const { pendingPage, finishPage } = usePageTransition({
    path,
    busy: pendingLocale !== null,
    onSamePage: () => onNavigate(null),
  })
  const { gap, headerInset, padding } = getMenuDimensions(snapshot)
  const compact = Boolean(expanded && !reducedMotion && snapshot)
  const sceneTransition = createSceneTransition(
    expanded,
    reducedMotion,
    pendingLocale !== null || pendingPage !== null,
  )
  const routeKind = parseRoute(path).kind
  const isHome = routeKind === 'home'
  const homeHref = withLocale(routes.home, locale)

  useEffect(() => () => audioElement.current?.pause(), [])

  function openMenu() {
    if (mounted) return
    setHoveredLink(null)
    openMenuScene(header.current, page.current)
  }

  function selectLocale(next: Locale) {
    if (next !== locale && pendingLocale === null && pendingPage === null) setPendingLocale(next)
  }

  return (
    <>
      <audio className="hidden" ref={audioElement} src={audioSrc} preload="metadata" />
      <PageSurface
        ref={page}
        snapshot={snapshot}
        gap={gap}
        compact={compact}
        sceneTransition={sceneTransition}
      >
        <SiteHeader
          ref={header}
          triggerRef={triggerRef}
          audioRef={audioElement}
          content={content}
          reducedMotion={reducedMotion}
          mounted={mounted}
          homeHref={homeHref}
          onOpen={openMenu}
        />
        {children}
        {routeKind !== 'project' && (
          <SiteFooter
            content={content}
            locale={locale}
            reducedMotion={reducedMotion}
            canHover={canHover}
            homeHref={isHome ? '' : homeHref}
            onSelectLocale={selectLocale}
          />
        )}
      </PageSurface>
      <MenuDialog
        content={content}
        navigation={{ ...props, canHover }}
        homeHref={isHome ? '#main' : homeHref}
        brandHref={homeHref}
        aboutHref={isHome ? '#manifiesto' : `${homeHref}#manifiesto`}
        reducedMotion={reducedMotion}
        canHover={canHover}
        expanded={expanded}
        snapshot={snapshot}
        ref={dialogRef}
        headerLayerRef={headerLayerRef}
        audioRef={audioElement}
        padding={padding}
        headerInset={headerInset}
        sceneTransition={sceneTransition}
        hoveredLink={hoveredLink}
        setHoveredLink={setHoveredLink}
        onClose={(id) => closeMenu(id)}
        onSelectLocale={selectLocale}
        onExitComplete={onAnimationComplete}
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
      {pendingPage && (
        <LanguageTransition
          label={content.pageTransition}
          reducedMotion={reducedMotion}
          onCovered={() => {
            resetScene()
            onNavigate(pendingPage)
          }}
          onFinished={() => {
            finishPage()
            document.getElementById('main')?.focus({ preventScroll: true })
          }}
        />
      )}
    </>
  )
}
