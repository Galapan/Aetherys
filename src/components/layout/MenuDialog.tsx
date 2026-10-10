import type { KeyboardEvent, RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent, Locale } from '../../content/hero'
import { menuContact, menuContent, menuSocials } from '../../content/navigation'
import type { NavigationProps } from './LanguageSwitch'
import { MenuFooter } from './MenuFooter'
import { MenuLink } from './MenuLink'
import { MenuMovingHeader } from './MenuMovingHeader'
import { MenuProjects } from './MenuProjects'
import {
  createPanelTransition,
  createReveal,
  getMenuDimensions,
  type SceneTransition,
} from './menuMotion'
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
  padding: number
  headerInset: number
  sceneTransition: SceneTransition
  hoveredLink: number | null
  setHoveredLink: (index: number | null) => void
  onClose: (id?: string) => void
  onSelectLocale: (locale: Locale) => void
  onExitComplete: () => void
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
  padding,
  headerInset,
  sceneTransition,
  hoveredLink,
  setHoveredLink,
  onClose,
  onSelectLocale,
  onExitComplete,
}: MenuDialogProps) {
  const copy = menuContent[navigation.locale]
  const { gap } = getMenuDimensions(snapshot)
  const links = [
    { href: '#main', label: content.homeLabel },
    { href: '', label: content.projectsLabel },
    { href: '#manifiesto', label: copy.about },
    { href: menuContact.emailHref, label: content.contact },
  ]

  return (
    <dialog
      ref={dialogRef}
      id="navigation-menu"
      className="text-graphite fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none overflow-hidden border-0 bg-transparent p-0 [color-scheme:light] [--color-border:color-mix(in_srgb,var(--color-graphite)_14%,transparent)] [--color-secondary:color-mix(in_srgb,var(--color-graphite)_78%,transparent)] [--focus-outline:var(--color-graphite)] [--switch-pressed:var(--color-graphite)] backdrop:bg-transparent"
      aria-label={content.navigation}
      style={
        snapshot ? { left: snapshot.pageLeft, right: 'auto', width: snapshot.width } : undefined
      }
      onKeyDown={containFocus}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {snapshot && (
        <m.div
          className="absolute inset-0 origin-center overflow-hidden rounded will-change-transform"
          initial={reducedMotion ? false : { scaleX: 1, scaleY: 1 }}
          animate={expanded ? 'open' : 'closed'}
          variants={{
            open: {
              scaleX: 1 - (gap * 2) / snapshot.width,
              scaleY: 1 - (gap * 2) / snapshot.height,
            },
            closed: { scaleX: 1, scaleY: 1 },
          }}
          transition={sceneTransition}
          onAnimationComplete={(definition) => {
            if (definition === 'closed' && !expanded) onExitComplete()
          }}
        >
          <m.div
            className="bg-warm-white pointer-events-none absolute inset-0"
            aria-hidden="true"
            initial={reducedMotion ? false : 'closed'}
            animate={expanded ? 'open' : 'closed'}
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={createPanelTransition(expanded, sceneTransition)}
          />
          <MenuMovingHeader
            content={content}
            snapshot={snapshot}
            expanded={expanded}
            reducedMotion={reducedMotion}
            canHover={canHover}
            padding={padding}
            headerInset={headerInset}
            sceneTransition={sceneTransition}
            audioRef={audioRef}
            onClose={() => onClose()}
          />
          <div className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain">
            <div className="relative flex min-h-full flex-col px-5 pt-[100px] pb-[max(24px,env(safe-area-inset-bottom))] sm:px-8 md:pt-[132px] md:pb-10 lg:px-16 lg:pt-[168px] lg:pb-16">
              <div className="grid flex-1 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] content-center items-start gap-x-6 gap-y-8 py-12 sm:grid-cols-12 sm:gap-y-0 md:py-16">
                <nav
                  className="row-span-2 flex min-w-0 flex-col items-start gap-1 sm:col-span-5 sm:row-span-1 md:gap-2"
                  aria-label={content.sectionsLabel}
                >
                  {links.map((link, index) => (
                    <MenuLink
                      key={link.label}
                      {...link}
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
                <div className="min-w-0 sm:col-span-3">
                  <MenuProjects
                    locale={navigation.locale}
                    expanded={expanded}
                    reducedMotion={reducedMotion}
                  />
                </div>
                <section
                  className="col-start-2 min-w-0 sm:col-span-4 sm:col-start-auto sm:self-end sm:text-right"
                  aria-labelledby="menu-socials-heading"
                >
                  <div className="overflow-hidden">
                    <m.h2
                      id="menu-socials-heading"
                      className="m-0 mb-3 text-sm leading-[1.4] font-normal tracking-[0.02em] uppercase md:text-base"
                      {...createReveal(expanded, reducedMotion, 0.6, true)}
                    >
                      {copy.socials}
                    </m.h2>
                  </div>
                  <ul className="m-0 flex list-none flex-col items-start gap-1 p-0 sm:items-end">
                    {menuSocials.map((social, index) => (
                      <li key={social.label} className="overflow-hidden">
                        <m.a
                          href={social.href || undefined}
                          role={social.href ? undefined : 'link'}
                          aria-disabled={!social.href || undefined}
                          className="text-secondary inline-flex min-h-8 items-center text-sm uppercase aria-disabled:cursor-default md:text-base"
                          {...createReveal(expanded, reducedMotion, 0.66 + index * 0.07, true)}
                        >
                          {social.label}
                        </m.a>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <MenuFooter
                navigation={navigation}
                expanded={expanded}
                reducedMotion={reducedMotion}
                canHover={canHover}
                onSelectLocale={onSelectLocale}
              />
            </div>
          </div>
        </m.div>
      )}
    </dialog>
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
