import { useRef, useState, useSyncExternalStore } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { NextStepContent } from '@/content/nextStep'
import { testimonyImages } from '@/content/testimonies'
import { buttonClassName } from '@/components/ui/Button'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { NextStepMark } from '@/features/nextstep/NextStepMark'

interface NextStepProps {
  content: NextStepContent
  contactHref: string
  reducedMotion: boolean
  canHover: boolean
  /** Holds the 3D mark back while the hero intro plays (Home only). */
  deferScene?: boolean
}

// Scroll-linked convergence: as the composition rises into view the words slide in towards
// the mark and settle once it reaches the viewport centre. Vertical placement never changes.
// Mobile keeps the subtle drift measured from the reference; on desktop the first and third
// words travel further and end half hidden behind the mark, while "tu" stays put.
const MOBILE_LEFT_OFFSET = ['-0.5em', '0em']
const MOBILE_RIGHT_OFFSET = ['0.35em', '0em']
const DESKTOP_LEFT_OFFSET = ['-2em', '0em']
const DESKTOP_RIGHT_OFFSET = ['2em', '0em']
const STATIC_OFFSET = ['0em', '0em']

// CTA hover from the reference: the portraits fan out and lift on a soft spring, the button
// dips as if pressed.
const PHOTO_SPRING = { type: 'spring', stiffness: 160, damping: 22, mass: 0.9 } as const
const BUTTON_PRESS = { duration: 0.5, ease: REVEAL_EASE } as const
const BUTTON_SCALE = 0.97
// The label counter-scales on the same curve so the text keeps its size while the button dips.
const LABEL_VARIANTS = { rest: { scale: 1 }, active: { scale: 1 / BUTTON_SCALE } }

/** side: -1 for the left portrait, 1 for the right one. */
function photoVariants(side: -1 | 1) {
  return {
    rest: { x: 0, y: 0, rotate: 7 * side },
    active: { x: 13 * side, y: -4, rotate: 11.5 * side },
  }
}

const desktopQuery = '(min-width: 768px)'

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(desktopQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getDesktop() {
  return window.matchMedia(desktopQuery).matches
}

export function NextStep({
  content,
  contactHref,
  reducedMotion,
  canHover,
  deferScene = false,
}: NextStepProps) {
  const composition = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: composition,
    offset: ['start end', 'center center'],
  })
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktop)
  const mobileLeftX = useTransform(scrollYProgress, [0, 1], MOBILE_LEFT_OFFSET)
  const mobileRightX = useTransform(scrollYProgress, [0, 1], MOBILE_RIGHT_OFFSET)
  const desktopLeftX = useTransform(scrollYProgress, [0, 1], DESKTOP_LEFT_OFFSET)
  const desktopRightX = useTransform(scrollYProgress, [0, 1], DESKTOP_RIGHT_OFFSET)
  const staticX = useTransform(scrollYProgress, [0, 1], STATIC_OFFSET)
  const firstWordX = desktop ? desktopLeftX : mobileLeftX
  const secondWordX = desktop ? staticX : mobileLeftX
  const thirdWordX = desktop ? desktopRightX : mobileRightX
  const [ctaHovered, setCtaHovered] = useState(false)
  const [ctaFocused, setCtaFocused] = useState(false)
  const ctaActive = !reducedMotion && (ctaHovered || ctaFocused)
  const ctaMotion = {
    variants: { rest: { scale: 1 }, active: { scale: BUTTON_SCALE } },
    transition: BUTTON_PRESS,
    onHoverStart: canHover ? () => setCtaHovered(true) : undefined,
    onHoverEnd: canHover ? () => setCtaHovered(false) : undefined,
    onFocus: () => setCtaFocused(true),
    onBlur: () => setCtaFocused(false),
  }
  const ctaLabel = (
    <m.span className="block" variants={LABEL_VARIANTS} transition={BUTTON_PRESS}>
      {content.callToAction}
    </m.span>
  )

  return (
    <section
      id="next-step"
      className="bg-warm-white text-graphite relative isolate z-1 min-h-svh scroll-mt-[calc(var(--header-height)+24px)] overflow-x-clip [color-scheme:light]"
      tabIndex={-1}
      aria-labelledby="next-step-heading"
    >
      <RuleGrid className="absolute inset-0 z-0" spanClassName="bg-grid-burgundy" />
      <div className="relative container flex min-h-svh flex-col items-center justify-center pt-[clamp(144px,30svh,360px)] pb-[clamp(80px,14svh,160px)]">
        {/* Box of the visible mark: everything is placed in em around it so the composition
            scales as one piece. 199/147 is the traced path's aspect ratio. Mobile stacks the
            four words inside a larger mark; tablet and up spread them around it. */}
        <div
          ref={composition}
          className="relative z-0 aspect-[199/147] w-[8.4em] text-[clamp(2rem,9vw,3.5rem)] leading-[0.92] font-normal tracking-[-0.03em] text-[color-mix(in_srgb,var(--color-graphite)_86%,var(--color-warm-white))] md:w-[5.2em] md:text-[clamp(2.5rem,5.6vw,7rem)] md:leading-[0.98]"
        >
          <h2
            id="next-step-heading"
            aria-label={content.heading.join(' ')}
            className="absolute inset-0 m-0"
          >
            {/* Desktop centres the first and third words on the mark's outer edges, so half
                of each sits behind the glass. */}
            <m.span
              data-heading-word
              aria-hidden="true"
              className="absolute top-[1.7em] left-[0.6em] whitespace-nowrap md:top-0 md:left-[1.7em] md:-translate-x-1/2"
              style={reducedMotion ? undefined : { x: firstWordX }}
            >
              {content.heading[0]}
            </m.span>
            <m.span
              data-heading-word
              aria-hidden="true"
              className="absolute top-[2.56em] left-[0.42em] whitespace-nowrap md:top-[0.88em] md:left-[-1em]"
              style={reducedMotion ? undefined : { x: secondWordX }}
            >
              {content.heading[1]}
            </m.span>
            <m.span
              data-heading-word
              aria-hidden="true"
              className="absolute top-[3.54em] left-[3em] whitespace-nowrap md:top-[1.75em] md:left-[4.6em] md:-translate-x-1/2"
              style={reducedMotion ? undefined : { x: thirdWordX }}
            >
              {content.heading[2]}
            </m.span>
            <span
              data-heading-word
              aria-hidden="true"
              className="absolute top-[4.46em] left-[2.6em] whitespace-nowrap md:top-auto md:bottom-[0.2em] md:left-1/2 md:-translate-x-1/2"
            >
              {content.heading[3]}
            </span>
          </h2>
          {/* The canvas keeps margin around the mark for the pointer tilt. Centred by flex
              rather than a transform or z-index, which would isolate it: the static mark
              multiplies over the words beneath it, as the glass does, instead of veiling them. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[12.7em] shrink-0 md:w-[7.85em]">
              <NextStepMark heading={content.heading} deferred={deferScene} />
            </div>
          </div>
        </div>
        <m.div
          className="relative z-2 mt-[clamp(64px,10svh,112px)] flex flex-col items-center"
          initial="rest"
          animate={ctaActive ? 'active' : 'rest'}
        >
          <div className="relative z-0 -mb-[26px] flex items-end justify-center gap-3">
            <m.img
              src={testimonyImages.bastian}
              alt={content.bastianAlt}
              className="h-[76px] w-[58px] rounded-lg object-cover"
              width={58}
              height={76}
              loading="lazy"
              decoding="async"
              style={{ rotate: -7 }}
              variants={photoVariants(-1)}
              transition={PHOTO_SPRING}
            />
            <m.img
              src={testimonyImages.cesar}
              alt={content.cesarAlt}
              className="h-[76px] w-[58px] rounded-lg object-cover"
              width={58}
              height={76}
              loading="lazy"
              decoding="async"
              style={{ rotate: 7 }}
              variants={photoVariants(1)}
              transition={PHOTO_SPRING}
            />
          </div>
          <m.a className={`${buttonClassName} relative z-1`} href={contactHref} {...ctaMotion}>
            {ctaLabel}
          </m.a>
        </m.div>
      </div>
    </section>
  )
}
