import type { HeroContent, Locale } from '../../content/hero'
import { motion } from 'framer-motion'

export interface NavigationProps {
  content: HeroContent
  locale: Locale
  onChange: (locale: Locale) => void
  canHover?: boolean
}

export function LanguageSwitch({ content, locale, onChange, canHover }: NavigationProps) {
  return (
    <div className="language-switch" role="group" aria-label={content.language}>
      <motion.button
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        type="button"
        lang="es"
        aria-label={content.spanish}
        aria-pressed={locale === 'es'}
        onClick={() => onChange('es')}
      >
        {content.es}
      </motion.button>
      <span aria-hidden="true">/</span>
      <motion.button
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        type="button"
        lang="en"
        aria-label={content.english}
        aria-pressed={locale === 'en'}
        onClick={() => onChange('en')}
      >
        {content.en}
      </motion.button>
    </div>
  )
}
