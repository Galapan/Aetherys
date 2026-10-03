import { LanguageTransition } from './LanguageTransition'
import type { HeroContent, Locale } from '../../content/hero'

interface LocaleTransitionProps {
  locale: Locale | null
  content: HeroContent
  reducedMotion: boolean
  onChange: (locale: Locale) => void
  onCovered: () => void
  onFinished: () => void
}

export function LocaleTransition({
  locale,
  content,
  reducedMotion,
  onChange,
  onCovered,
  onFinished,
}: LocaleTransitionProps) {
  if (locale === null) return null

  return (
    <LanguageTransition
      label={content.language}
      reducedMotion={reducedMotion}
      onCovered={() => {
        onChange(locale)
        onCovered()
      }}
      onFinished={onFinished}
    />
  )
}
