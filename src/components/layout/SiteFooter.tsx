import { useLayoutEffect, useRef, useState } from 'react'
import { m, useInView, useScroll, useTransform } from 'framer-motion'
import { heroMark, type HeroContent, type Locale } from '@/content/hero'
import { content as footerContent } from '@/content/footer'
import { menuContact, menuContent, menuSocials } from '@/content/navigation'
import { projectsHref } from '@/content/projects'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { LanguageSwitch } from './LanguageSwitch'

interface SiteFooterProps {
  content: HeroContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
  /** Prefix for links to home sections: empty on home, the home URL on other pages. */
  homeHref?: string
  onSelectLocale: (locale: Locale) => void
}

// The card enters almost full-bleed and narrows to the container edge as the page reaches
// its end, as in the reference.
const ENTRY_INSET = 12
const FINAL_INSET = 'max(var(--page-padding), (100% - 1440px) / 2 + var(--page-padding))'

// "Contact" rests sunk into the card's bottom edge and rises letter by letter, left to right,
// while the pointer is over the footer (in view on touch); it sinks back the same way.
const LETTER_REST = '0.22em'
const LETTER_STAGGER = 0.035
const LETTER_EASE = [0.22, 1, 0.36, 1] as const
// Starting guess of the word's width in em per letter, refined once the glyphs are measured.
const LETTER_WIDTH = 0.52

const LINK_HOVER = { x: 8 }
const LINK_TRANSITION = { duration: 0.22, ease: 'easeOut' } as const

const listClassName = 'm-0 flex list-none flex-col gap-1 p-0'
const headingClassName = 'm-0 mb-4 text-[12px] leading-[1.4] tracking-[0.08em] uppercase'
const linkClassName =
  'text-secondary inline-flex min-h-8 items-center text-sm tracking-[0.04em] uppercase aria-disabled:cursor-default'

export function SiteFooter({
  content,
  locale,
  reducedMotion,
  canHover,
  homeHref = '',
  onSelectLocale,
}: SiteFooterProps) {
  const copy = footerContent[locale]
  const card = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLAnchorElement>(null)
  const { scrollYProgress } = useScroll({ target: card, offset: ['start end', 'end end'] })
  const clipPath = useTransform(
    scrollYProgress,
    (progress) =>
      `inset(0px calc(${ENTRY_INSET * (1 - progress)}px + ${FINAL_INSET} * ${progress}) 0px round 8px)`,
  )
  const wordInView = useInView(word, { amount: 0.6 })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const raised = reducedMotion || (canHover ? hovered || focused : wordInView || focused)
  const hoverLink = canHover && !reducedMotion ? LINK_HOVER : undefined
  const letters = Array.from(copy.contactWord)
  // Width of the word in em with the system font actually used, so it fills the card.
  const [wordEms, setWordEms] = useState<{ word: string; ems: number } | null>(null)
  const fit = wordEms?.word === copy.contactWord ? wordEms.ems : letters.length * LETTER_WIDTH

  useLayoutEffect(() => {
    const element = word.current
    if (!element) return
    const measure = () => {
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      let width = 0
      for (const letter of element.children) width += letter.getBoundingClientRect().width
      if (size > 0 && width > 0) setWordEms({ word: copy.contactWord, ems: width / size })
    }
    measure()
    let active = true
    void document.fonts.ready.then(() => {
      if (active) measure()
    })
    return () => {
      active = false
    }
  }, [copy.contactWord])

  const pages = [
    { href: homeHref || '#inicio', label: content.homeLabel },
    { href: projectsHref(locale), label: content.projectsLabel },
    { href: `${homeHref}#manifiesto`, label: menuContent[locale].about },
    { href: `${homeHref}#servicios`, label: copy.services },
    { href: `${homeHref}#proceso`, label: copy.process },
  ]

  return (
    <footer
      className="bg-warm-white relative isolate z-1 overflow-x-clip pt-[clamp(48px,9svh,104px)]"
      aria-label={copy.label}
    >
      <RuleGrid className="absolute inset-0 z-0" spanClassName="bg-grid-burgundy" />
      <m.div
        ref={card}
        className="text-warm-white relative z-1 overflow-hidden bg-[radial-gradient(110%_85%_at_0%_0%,color-mix(in_srgb,var(--color-burgundy)_42%,var(--color-graphite)),var(--color-graphite)_62%)]"
        style={{
          clipPath: reducedMotion ? `inset(0px ${FINAL_INSET} 0px round 8px)` : clipPath,
        }}
        onHoverStart={canHover ? () => setHovered(true) : undefined}
        onHoverEnd={canHover ? () => setHovered(false) : undefined}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}
      >
        <div className="container">
          <div className="px-6 pt-12 md:px-10 md:pt-16 lg:px-12 lg:pt-20">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-6">
              <a
                className="col-span-2 self-start justify-self-start md:col-span-1"
                href="#inicio"
                aria-label={copy.homeLabel}
              >
                <svg
                  className="block h-auto w-14"
                  viewBox="140 110 205 160"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d={heroMark.path} fill="currentColor" />
                </svg>
              </a>
              <nav aria-labelledby="footer-pages">
                <h2 id="footer-pages" className={headingClassName}>
                  {copy.pages}
                </h2>
                <ul className={listClassName}>
                  {pages.map((page) => (
                    <li key={page.href}>
                      <m.a
                        className={linkClassName}
                        href={page.href}
                        whileHover={hoverLink}
                        transition={LINK_TRANSITION}
                      >
                        {page.label}
                      </m.a>
                    </li>
                  ))}
                </ul>
              </nav>
              <section aria-labelledby="footer-socials">
                <h2 id="footer-socials" className={headingClassName}>
                  {copy.socials}
                </h2>
                <ul className={listClassName}>
                  {menuSocials.map((social) => (
                    <li key={social.label}>
                      <m.a
                        className={linkClassName}
                        href={social.href || undefined}
                        role={social.href ? undefined : 'link'}
                        aria-disabled={!social.href || undefined}
                        whileHover={social.href ? hoverLink : undefined}
                        transition={LINK_TRANSITION}
                      >
                        {social.label}
                      </m.a>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="col-span-2 -ml-3 self-end justify-self-start md:col-span-3 md:col-start-4 md:ml-0 md:justify-self-end">
                <LanguageSwitch
                  content={content}
                  locale={locale}
                  canHover={canHover && !reducedMotion}
                  onChange={onSelectLocale}
                />
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 items-center gap-x-6 gap-y-3 pb-8 text-sm leading-[1.5] md:mt-24 md:grid-cols-6 md:pb-10">
              <p className="m-0">{menuContact.copyright}</p>
              <p className="m-0">{menuContact.location}</p>
              <a
                className="inline-flex min-h-8 items-center whitespace-nowrap"
                href={menuContact.phoneHref}
              >
                {menuContact.phone}
              </a>
              <a
                className="col-span-2 inline-flex min-h-8 items-center [overflow-wrap:anywhere]"
                href={menuContact.emailHref}
              >
                {menuContact.email}
              </a>
              <m.a
                className="col-span-2 inline-flex min-h-8 items-center gap-2 justify-self-start md:col-span-1 md:justify-self-end"
                href="#inicio"
                whileHover={canHover && !reducedMotion ? { y: -2 } : undefined}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <span aria-hidden="true">↑</span>
                {copy.backToTop}
              </m.a>
            </div>
            <div className="border-border border-t" />
            <div className="@container pt-4">
              <a
                ref={word}
                className="flex h-[0.7em] justify-between leading-none font-medium tracking-[-0.04em] whitespace-nowrap"
                style={{ fontSize: `calc(100cqw / ${fit * 1.01})` }}
                href={menuContact.emailHref}
                aria-label={copy.contactWord}
              >
                {letters.map((letter, index) => (
                  <m.span
                    key={`${letter}-${index}`}
                    className="-mt-[0.15em] inline-block"
                    aria-hidden="true"
                    initial={false}
                    animate={{ y: raised ? '0em' : LETTER_REST }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            duration: raised ? 0.7 : 0.6,
                            delay: index * LETTER_STAGGER,
                            ease: LETTER_EASE,
                          }
                    }
                  >
                    {letter}
                  </m.span>
                ))}
              </a>
            </div>
          </div>
        </div>
      </m.div>
    </footer>
  )
}
