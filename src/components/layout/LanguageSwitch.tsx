import type { HeroContent, Locale } from '../../content/hero'
import { m } from 'framer-motion'

export interface NavigationProps {
  content: HeroContent
  locale: Locale
  onChange: (locale: Locale) => void
  canHover?: boolean
}

export function LanguageSwitch({ content, locale, onChange, canHover }: NavigationProps) {
  return (
    <div
      className="flex items-center text-sm tracking-[0.08em] md:text-base"
      role="group"
      aria-label={content.language}
    >
      <m.button
        className="text-secondary relative min-h-11 min-w-11 rounded border-0 bg-transparent aria-pressed:text-[var(--switch-pressed,var(--color-warm-white))] aria-pressed:after:absolute aria-pressed:after:right-4 aria-pressed:after:bottom-[7px] aria-pressed:after:left-4 aria-pressed:after:h-[2px] aria-pressed:after:bg-current aria-pressed:after:content-['']"
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        type="button"
        lang="es"
        aria-label={content.spanish}
        aria-pressed={locale === 'es'}
        onClick={() => onChange('es')}
      >
        {content.es}
      </m.button>
      <span className="text-secondary" aria-hidden="true">
        /
      </span>
      <m.button
        className="text-secondary relative min-h-11 min-w-11 rounded border-0 bg-transparent aria-pressed:text-[var(--switch-pressed,var(--color-warm-white))] aria-pressed:after:absolute aria-pressed:after:right-4 aria-pressed:after:bottom-[7px] aria-pressed:after:left-4 aria-pressed:after:h-[2px] aria-pressed:after:bg-current aria-pressed:after:content-['']"
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        type="button"
        lang="en"
        aria-label={content.english}
        aria-pressed={locale === 'en'}
        onClick={() => onChange('en')}
      >
        {content.en}
      </m.button>
    </div>
  )
}
