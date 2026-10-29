import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { m, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import { heroMark, type HeroContent, type Locale } from '@/content/hero'
import { content as footerContent } from '@/content/footer'
import { menuContact, menuContent } from '@/content/navigation'
import { aboutHref } from '@/content/about'
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

// The card enters almost full-bleed and narrows to the page padding as the page reaches its
// end, as in the reference; the content spans the card's final width.
const ENTRY_INSET = 12
const FINAL_INSET = 'var(--page-padding)'

// "Contact" rests sunk into the card's bottom edge and rises letter by letter, left to right,
// while the pointer is over the footer (in view on touch); it sinks back the same way.
const LETTER_REST = '0.22em'
const LETTER_STAGGER = 0.035
// Starting guess of the word's width in em per letter, refined once the glyphs are measured.
const LETTER_WIDTH = 0.52

// The burgundy glow trails the pointer over the card and settles back in the top-left corner
// when it leaves.
const GLOW_SPRING = { stiffness: 60, damping: 20, mass: 1 }

const LINK_HOVER = { x: 8 }
const LINK_TRANSITION = { duration: 0.22, ease: 'easeOut' } as const

const listClassName = 'm-0 flex list-none flex-col gap-1 p-0'
const headingClassName = 'm-0 mb-4 text-[12px] leading-[1.4] tracking-[0.08em] uppercase'
const linkClassName =
  'text-secondary inline-flex min-h-8 items-center text-sm tracking-[0.04em] uppercase aria-disabled:cursor-default'

/** Pointer-following glow: springs after the mouse and settles at the origin when disabled. */
function useGlowFollow(enabled: boolean) {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const glowX = useSpring(pointerX, GLOW_SPRING)
  const glowY = useSpring(pointerY, GLOW_SPRING)

  useEffect(() => {
    if (enabled) return
    pointerX.jump(0)
    pointerY.jump(0)
    glowX.jump(0)
    glowY.jump(0)
  }, [enabled, pointerX, pointerY, glowX, glowY])

  return {
    glowX,
    glowY,
    follow(event: PointerEvent<HTMLDivElement>) {
      if (!enabled || event.pointerType !== 'mouse') return
      const rect = event.currentTarget.getBoundingClientRect()
      pointerX.set(event.clientX - rect.left)
      pointerY.set(event.clientY - rect.top)
    },
    release() {
      pointerX.set(0)
      pointerY.set(0)
    },
  }
}

interface FooterLink {
  href: string
  label: string
}

/** Footer link column; a link without a destination yet renders disabled. */
function FooterLinks({ links, hover }: { links: FooterLink[]; hover?: typeof LINK_HOVER }) {
  return (
    <ul className={listClassName}>
      {links.map((link) => (
        <li key={link.label}>
          <m.a
            className={linkClassName}
            href={link.href || undefined}
            role={link.href ? undefined : 'link'}
            aria-disabled={!link.href || undefined}
            whileHover={link.href ? hover : undefined}
            transition={LINK_TRANSITION}
          >
            {link.label}
          </m.a>
        </li>
      ))}
    </ul>
  )
}

interface ContactWordProps {
  text: string
  href: string
  hovered: boolean
  focused: boolean
  canHover: boolean
  reducedMotion: boolean
}

/** The card-wide "Contact" word whose letters rise while the footer is in use. */
function ContactWord({ text, href, hovered, focused, canHover, reducedMotion }: ContactWordProps) {
  const word = useRef<HTMLAnchorElement>(null)
  const inView = useInView(word, { amount: 0.6 })
  const raised = reducedMotion || focused || (canHover ? hovered : inView)
  const letters = Array.from(text)
  // Width of the word in em with the system font actually used, so it fills the card.
  const [wordEms, setWordEms] = useState<{ word: string; ems: number } | null>(null)
  const fit = wordEms?.word === text ? wordEms.ems : letters.length * LETTER_WIDTH

  useLayoutEffect(() => {
    const element = word.current
    if (!element) return
    const measure = () => {
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      let width = 0
      for (const letter of element.children) width += letter.getBoundingClientRect().width
      if (size > 0 && width > 0) setWordEms({ word: text, ems: width / size })
    }
    measure()
    let active = true
    void document.fonts.ready.then(() => {
      if (active) measure()
    })
    return () => {
      active = false
    }
  }, [text])

  return (
    <a
      ref={word}
      className="flex h-[0.7em] justify-between leading-none font-medium tracking-[-0.04em] whitespace-nowrap"
      style={{ fontSize: `calc(100cqw / ${fit * 1.01})` }}
      href={href}
      aria-label={text}
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
                  ease: REVEAL_EASE,
                }
          }
        >
          {letter}
        </m.span>
      ))}
    </a>
  )
}

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
  const { scrollYProgress } = useScroll({ target: card, offset: ['start end', 'end end'] })
  const clipPath = useTransform(
    scrollYProgress,
    (progress) =>
      `inset(0px calc(${ENTRY_INSET * (1 - progress)}px + ${FINAL_INSET} * ${progress}) 0px round 8px)`,
  )
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const interactive = canHover && !reducedMotion
  const hoverLink = interactive ? LINK_HOVER : undefined
  const glow = useGlowFollow(interactive)

  const pages = [
    { href: homeHref || '#inicio', label: content.homeLabel },
    { href: projectsHref(locale), label: content.projectsLabel },
    { href: aboutHref(locale), label: menuContent[locale].about },
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
        className="text-warm-white bg-graphite relative z-1 overflow-hidden"
        style={{
          clipPath: reducedMotion ? `inset(0px ${FINAL_INSET} 0px round 8px)` : clipPath,
        }}
        onHoverStart={canHover ? () => setHovered(true) : undefined}
        onHoverEnd={
          canHover
            ? () => {
                setHovered(false)
                glow.release()
              }
            : undefined
        }
        onPointerMove={glow.follow}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}
      >
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[85%] -left-[110%] h-[170%] w-[220%] bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_srgb,var(--color-burgundy)_42%,var(--color-graphite)),var(--color-graphite)_62%)]"
          style={{ x: glow.glowX, y: glow.glowY }}
        />
        <div className="relative px-(--page-padding)">
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
                <FooterLinks links={pages} hover={hoverLink} />
              </nav>
              <div className="col-span-2 -ml-3 self-end justify-self-start md:col-span-3 md:col-start-4 md:ml-0 md:justify-self-end">
                <LanguageSwitch
                  content={content}
                  locale={locale}
                  canHover={interactive}
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
                whileHover={interactive ? { y: -2 } : undefined}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <span aria-hidden="true">↑</span>
                {copy.backToTop}
              </m.a>
            </div>
            <div className="border-border border-t" />
            <div className="@container pt-4">
              <ContactWord
                text={copy.contactWord}
                href={menuContact.emailHref}
                hovered={hovered}
                focused={focused}
                canHover={canHover}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>
      </m.div>
    </footer>
  )
}
