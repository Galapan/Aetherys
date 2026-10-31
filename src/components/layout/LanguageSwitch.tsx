import { useId, useState } from 'react'
import { m } from 'framer-motion'
import type { HeroContent, Locale } from '@/content/hero'
import { SPRING_BOUNCY, SPRING_PRESS } from '@/components/ui/easing'

export interface NavigationProps {
  content: HeroContent
  locale: Locale
  onChange: (locale: Locale) => void
  canHover?: boolean
  /** No press bounce and no sliding underline with reduced motion. */
  reducedMotion?: boolean
}

const buttonClassName =
  'text-secondary relative min-h-11 min-w-11 rounded border-0 bg-transparent aria-pressed:text-[var(--switch-pressed,var(--color-warm-white))]'

// Hover keeps its short glide; the press springs back.
const buttonTransition = { duration: 0.18, ease: 'easeOut', scale: SPRING_PRESS } as const

export function LanguageSwitch({
  content,
  locale,
  onChange,
  canHover,
  reducedMotion = false,
}: NavigationProps) {
  // The locale itself only changes once the curtain covers the page, so the underline moves on
  // the click instead, where it can be seen. A choice made for an older locale is dropped.
  const [choice, setChoice] = useState<{ from: Locale; to: Locale } | null>(null)
  const underlined = choice?.from === locale ? choice.to : locale
  const underlineId = useId()

  const languages = [
    { value: 'es', label: content.es, name: content.spanish },
    { value: 'en', label: content.en, name: content.english },
  ] as const

  return (
    <div
      className="flex items-center text-sm tracking-[0.08em] md:text-base"
      role="group"
      aria-label={content.language}
    >
      {languages.map(({ value, label, name }, index) => (
        <span key={value} className="contents">
          {index > 0 && (
            <span className="text-secondary" aria-hidden="true">
              /
            </span>
          )}
          <m.button
            className={buttonClassName}
            whileHover={canHover ? { y: -2 } : undefined}
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            transition={buttonTransition}
            type="button"
            lang={value}
            aria-label={name}
            aria-pressed={locale === value}
            onClick={() => {
              if (value !== locale) setChoice({ from: locale, to: value })
              onChange(value)
            }}
          >
            {label}
            {underlined === value && (
              // Shared between both buttons: it slides to the chosen language and bounces.
              <m.span
                layoutId={underlineId}
                className="absolute right-4 bottom-[7px] left-4 h-[2px] bg-[var(--switch-pressed,var(--color-warm-white))]"
                transition={reducedMotion ? { duration: 0 } : SPRING_BOUNCY}
                aria-hidden="true"
              />
            )}
          </m.button>
        </span>
      ))}
    </div>
  )
}
