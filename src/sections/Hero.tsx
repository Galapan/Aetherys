import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import { animate, m, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import type { HeroContent } from '../content/hero'

interface HeroProps {
  content: HeroContent
  entering: boolean
  reducedMotion: boolean
}

const curtainEase = [0.76, 0, 0.24, 1] as const

// Scroll distance (px) the highlights stay parked and fully visible at the tope
// before the disappear animation starts.
const HIGHLIGHTS_HOLD_PX = 80

export function Hero({ content, entering, reducedMotion }: HeroProps) {
  const { scrollY } = useScroll()
  const highlightsOpacity = useMotionValue(1)
  const highlightsRef = useRef<HTMLUListElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  // Scroll offset at which the highlights reach the tope and stop moving.
  const topeScrollY = useRef(0)
  // useMotionValueEvent only hands us the latest value, so keep the previous one
  // ourselves to detect the direction.
  const lastScrollY = useRef(0)
  const hidden = useRef(false)

  // Measure the pinned logo so the text can sit on its centre. The frame is
  // sticky at top:0 with rows `1fr auto`, so the logo centre is not the viewport
  // centre and hard-coding it would drift between breakpoints.
  useEffect(() => {
    function measure() {
      const el = highlightsRef.current
      if (!el) return

      const half = el.getBoundingClientRect().height / 2
      const logoEl = document.querySelector<HTMLElement>('.sticky-stage__mark .hero-mark-reveal')
      const placeholder = placeholderRef.current

      // Prefer the real logo; the placeholder reserves its box as a proxy.
      let logoRect = logoEl?.getBoundingClientRect()
      if ((!logoRect || logoRect.height === 0) && placeholder) {
        logoRect = placeholder.getBoundingClientRect()
      }

      if (!logoRect || logoRect.height === 0) {
        const stickTop = parseFloat(getComputedStyle(el).top) || 0
        topeScrollY.current = el.getBoundingClientRect().top + window.scrollY - stickTop
        return
      }

      const logoCenter = logoRect.top + logoRect.height / 2
      // Park the block with its centre on the logo's centre.
      el.style.setProperty('--highlights-tope', `${logoCenter - half}px`)

      if (placeholder) {
        const box = placeholder.getBoundingClientRect()
        const stageCenter = box.top + box.height / 2
        // Drop the resting position onto the logo, so it is already parked and
        // never travels before fading.
        el.style.setProperty('--highlights-nudge', `${logoCenter - stageCenter}px`)
      }
      topeScrollY.current = 0
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (reducedMotion) return
    const previous = lastScrollY.current
    lastScrollY.current = latest
    const goingDown = latest > previous

    if (hidden.current) {
      // Any upward movement brings them back.
      if (!goingDown) {
        hidden.current = false
        animate(highlightsOpacity, 1, { duration: 0.35, ease: 'easeOut' })
      }
      return
    }

    // Going down: stay parked and visible until the hold distance is covered.
    const hold = Math.max(0, topeScrollY.current) + HIGHLIGHTS_HOLD_PX
    if (goingDown && latest > hold) {
      hidden.current = true
      animate(highlightsOpacity, 0, { duration: 0.35, ease: 'easeOut' })
    }
  })

  function reveal(delay: number) {
    return {
      initial: entering ? { opacity: 0, y: 24 } : (false as const),
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: entering ? 0.8 : 0,
        delay: entering ? delay : 0,
        ease: 'easeOut' as const,
      },
    }
  }

  return (
    <section
      className="pointer-events-none relative container flex min-h-[calc(100svh-var(--header-height))] max-w-none flex-col pb-[calc(24px+var(--foot-space))] [--page-padding:clamp(20px,1.85vw,32px)]"
      aria-labelledby="hero-heading"
    >
      {entering &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-20 overflow-hidden motion-reduce:hidden"
            aria-hidden="true"
          >
            <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-8">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  className={`relative ${index < 2 || index > 5 ? 'hidden md:block' : ''}`}
                  key={index}
                >
                  <m.span
                    className="bg-warm-white absolute top-0 left-0 h-[calc(50%+1px)] w-[calc(100%+1px)] border-r border-[color-mix(in_srgb,var(--color-graphite)_14%,transparent)]"
                    initial={{ y: '0%' }}
                    animate={{ y: '-101%' }}
                    transition={{
                      duration: 1.35,
                      delay: 3.55 + Math.abs(index - 3.5) * 0.1,
                      ease: curtainEase,
                    }}
                  />
                  <m.span
                    className="bg-warm-white absolute bottom-0 left-0 h-[calc(50%+1px)] w-[calc(100%+1px)] border-r border-[color-mix(in_srgb,var(--color-graphite)_14%,transparent)]"
                    initial={{ y: '0%' }}
                    animate={{ y: '101%' }}
                    transition={{
                      duration: 1.35,
                      delay: 3.55 + Math.abs(index - 3.5) * 0.1,
                      ease: curtainEase,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="text-burgundy absolute inset-0 grid place-items-center">
              <m.span
                className="flex overflow-hidden px-[2px] py-1 text-[26px] leading-[1.3] font-medium tracking-[-0.055em] md:text-[32px]"
                initial={{ scaleX: 1, opacity: 1 }}
                animate={{ scaleX: 0.035, opacity: 0 }}
                transition={{ delay: 1.7, duration: 0.6, ease: curtainEase }}
              >
                {Array.from(content.brand).map((letter, index) => (
                  <m.span
                    key={index}
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      delay: 0.15 + index * 0.035,
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {letter}
                  </m.span>
                ))}
              </m.span>
              <m.span
                className="absolute size-3 before:absolute before:top-[5px] before:h-[2px] before:w-3 before:bg-current before:content-[''] after:absolute after:left-[5px] after:h-3 after:w-[2px] after:bg-current after:content-['']"
                initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 0, 180, 180],
                  scale: [0.6, 1, 1, 0.3],
                }}
                transition={{
                  delay: 2.2,
                  duration: 1.25,
                  times: [0, 0.16, 0.8, 1],
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>,
          document.body,
        )}
      <div className="grid min-h-[144px] flex-1 place-items-center py-12 md:min-h-[192px] lg:min-h-[224px]">
        <div
          className="pointer-events-none col-start-1 row-start-1 aspect-square max-h-[48svh] w-[min(100%,480px)]"
          aria-hidden="true"
          ref={placeholderRef}
        />
        <m.ul
          ref={highlightsRef}
          className="text-warm-white pointer-events-none sticky top-[var(--highlights-tope,40svh)] z-1 col-start-1 row-start-1 m-0 flex max-w-full list-none flex-col flex-wrap items-center justify-center gap-2 p-0 text-center text-[clamp(12px,0.9vw,15px)] leading-[1.4] font-medium tracking-[0.04em] uppercase text-shadow-[0_1px_3px_var(--color-graphite),0_0_8px_var(--color-graphite)] md:flex-row md:gap-3"
          {...reveal(4.1)}
        >
          {content.highlights.map((phrase, index) => (
            <m.li
              key={phrase}
              className={`pointer-events-auto whitespace-nowrap ${index > 0 ? "md:before:mr-3 md:before:content-['·']" : ''}`}
              style={{ opacity: reducedMotion ? 1 : highlightsOpacity }}
            >
              {phrase}
            </m.li>
          ))}
        </m.ul>
      </div>
      <div className="grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-[var(--grid-gap)] gap-y-8 pb-12">
        <m.h1
          id="hero-heading"
          className="pointer-events-auto col-span-full m-0 max-w-[18ch] text-left text-[clamp(2.25rem,3.3vw,3.4rem)] leading-[1.2] font-medium tracking-[-0.04em] text-pretty lg:row-start-1 lg:self-end"
          {...reveal(4)}
        >
          {content.heading}
        </m.h1>
      </div>
    </section>
  )
}
