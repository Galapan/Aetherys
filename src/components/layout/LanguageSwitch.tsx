import { useLayoutEffect, useRef, useState } from 'react'
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

// The underline spans the label: the button minus its 16px of side room.
const UNDERLINE_INSET = 16

interface Span {
  x: number
  width: number
}

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
  const buttons = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({})
  const [spans, setSpans] = useState<Partial<Record<Locale, Span>>>({})
  const span = spans[underlined]

  const languages = [
    { value: 'es', label: content.es, name: content.spanish },
    { value: 'en', label: content.en, name: content.english },
  ] as const

  // A single underline slides between measured offsets. A shared layoutId measured its old box
  // through the menu's transformed stage and sent the underline up and down on the way.
  // Offsets ignore transforms, so the hover lift and the menu's scene do not skew them; the
  // observer re-measures once the menu's panel gets its size.
  useLayoutEffect(() => {
    const measure = () => {
      const next: Partial<Record<Locale, Span>> = {}
      for (const [value, button] of Object.entries(buttons.current) as [Locale, HTMLElement][]) {
        if (!button?.offsetWidth) continue
        next[value] = {
          x: button.offsetLeft + UNDERLINE_INSET,
          width: button.offsetWidth - UNDERLINE_INSET * 2,
        }
      }
      setSpans(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const button of Object.values(buttons.current)) if (button) observer.observe(button)
    return () => observer.disconnect()
  }, [content])

  return (
    <div
      className="relative flex items-center text-sm tracking-[0.08em] md:text-base"
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
            ref={(element) => {
              buttons.current[value] = element
            }}
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
          </m.button>
        </span>
      ))}
      {span && (
        // Slides to the chosen language and bounces.
        <m.span
          className="pointer-events-none absolute bottom-[7px] left-0 h-[2px] bg-[var(--switch-pressed,var(--color-warm-white))]"
          initial={false}
          animate={{ x: span.x, width: span.width }}
          transition={reducedMotion ? { duration: 0 } : SPRING_BOUNCY}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
