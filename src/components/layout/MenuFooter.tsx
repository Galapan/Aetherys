import { useState } from 'react'
import { m } from 'framer-motion'
import type { Locale } from '../../content/hero'
import { menuContact, menuContent } from '../../content/navigation'
import { LanguageSwitch, type NavigationProps } from './LanguageSwitch'
import { createReveal } from './menuMotion'

interface MenuFooterProps {
  navigation: NavigationProps
  expanded: boolean
  reducedMotion: boolean
  canHover: boolean
  onSelectLocale: (locale: Locale) => void
}

export function MenuFooter({
  navigation,
  expanded,
  reducedMotion,
  canHover,
  onSelectLocale,
}: MenuFooterProps) {
  const contactHoverEnabled = canHover && expanded && !reducedMotion
  const [hover, setHover] = useState<{
    enabled: boolean
    contact: 'phone' | 'email' | null
  }>({ enabled: contactHoverEnabled, contact: null })

  if (hover.enabled !== contactHoverEnabled) {
    setHover({ enabled: contactHoverEnabled, contact: null })
  }

  function contactAnimation(contact: 'phone' | 'email') {
    const active = contactHoverEnabled && hover.enabled && hover.contact === contact
    return {
      initial: false as const,
      animate: { clipPath: active ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)' },
      transition: {
        duration: !contactHoverEnabled ? 0 : active ? 0.55 : 0.35,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    }
  }

  return (
    <footer
      className="relative grid shrink-0 grid-cols-1 items-center gap-x-4 gap-y-2 pt-6 text-sm leading-[1.5] sm:grid-cols-[1fr_1fr_auto] sm:gap-x-6 md:pt-8 md:text-base lg:flex lg:justify-between lg:gap-8 lg:pt-10"
      aria-label={menuContent[navigation.locale].contact}
    >
      <div className="overflow-hidden">
        <m.p className="m-0" {...createReveal(expanded, reducedMotion, 0.78, true)}>
          {menuContact.copyright}
        </m.p>
      </div>
      <div className="col-start-1 overflow-hidden sm:col-start-auto">
        <m.p className="m-0" {...createReveal(expanded, reducedMotion, 0.84, true)}>
          {menuContact.location}
        </m.p>
      </div>
      <div className="col-start-1 -my-2 overflow-hidden py-2 sm:row-start-2 lg:my-0">
        <m.div {...createReveal(expanded, reducedMotion, 0.9, true)}>
          <m.a
            className="inline-flex min-h-8 items-center whitespace-nowrap"
            href={menuContact.phoneHref}
            onHoverStart={() => {
              if (contactHoverEnabled) setHover({ enabled: true, contact: 'phone' })
            }}
            onHoverEnd={() => setHover({ enabled: contactHoverEnabled, contact: null })}
          >
            <span className="relative">
              {menuContact.phone}
              <m.span
                aria-hidden="true"
                className="text-burgundy pointer-events-none absolute inset-0"
                {...contactAnimation('phone')}
              >
                {menuContact.phone}
              </m.span>
            </span>
          </m.a>
        </m.div>
      </div>
      <div className="col-start-1 -my-2 overflow-hidden py-2 sm:col-start-2 sm:row-start-2 lg:my-0">
        <m.div {...createReveal(expanded, reducedMotion, 0.96, true)}>
          <m.a
            className="inline-flex min-h-8 items-center break-all"
            href={menuContact.emailHref}
            onHoverStart={() => {
              if (contactHoverEnabled) setHover({ enabled: true, contact: 'email' })
            }}
            onHoverEnd={() => setHover({ enabled: contactHoverEnabled, contact: null })}
          >
            <span className="relative">
              {menuContact.email}
              <m.span
                aria-hidden="true"
                className="text-burgundy pointer-events-none absolute inset-0"
                {...contactAnimation('email')}
              >
                {menuContact.email}
              </m.span>
            </span>
          </m.a>
        </m.div>
      </div>
      <div className="justify-self-end overflow-hidden sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:self-end lg:self-auto">
        <m.div {...createReveal(expanded, reducedMotion, 1.02, true)}>
          <LanguageSwitch {...navigation} canHover={canHover} onChange={onSelectLocale} />
        </m.div>
      </div>
    </footer>
  )
}
