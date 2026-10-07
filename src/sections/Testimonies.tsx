import { useState, useSyncExternalStore, type RefObject } from 'react'
import {
  AnimatePresence,
  m,
  useAnimationFrame,
  useInView,
  useIsPresent,
  useMotionValue,
} from 'framer-motion'
import { testimonyImages, type TestimoniesContent, type Testimony } from '../content/testimonies'
import { RuleGrid } from '../components/ui/RuleGrid'

const ease = [0.22, 1, 0.36, 1] as const
const interval = 10_000
const transitionSpeed = 0.75
// Neutral graphite icon, never a fabricated portrait.
const profileIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="#101014" stroke-width="2"><circle cx="32" cy="23" r="10"/><path d="M12 55v-5a20 20 0 0 1 40 0v5"/></g></svg>')}`

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function readVisibility() {
  return !document.hidden
}

function Slide({
  item,
  animateEntry,
  reducedMotion,
}: {
  item: Testimony
  animateEntry: boolean
  reducedMotion: boolean
}) {
  const present = useIsPresent()
  const image = testimonyImages[item.id]
  const timing = (duration: number, delay = 0) => ({
    duration: reducedMotion ? 0 : duration / transitionSpeed,
    delay: reducedMotion ? 0 : delay / transitionSpeed,
    ease,
  })

  let letterIndex = 0
  return (
    <m.figure
      className="col-start-1 row-start-1 m-0 min-w-0"
      initial={animateEntry && !reducedMotion ? 'enter' : false}
      animate="visible"
      aria-hidden={!present || undefined}
      exit={reducedMotion ? undefined : 'exit'}
    >
      <blockquote className="m-0 max-w-[34ch] text-[clamp(1.75rem,3.2vw,3.5rem)] leading-[1.2] font-normal tracking-[-0.035em]">
        <span className="sr-only">{item.quote}</span>
        <span aria-hidden="true">
          {item.quote.split(' ').map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 ? ' ' : null}
              <span className="mb-[-0.12em] inline-block overflow-clip pb-[0.12em] align-top">
                {Array.from(word).map((letter) => {
                  const index = letterIndex++
                  return (
                    <m.span
                      key={index}
                      className="inline-block"
                      variants={{
                        enter: { y: '110%' },
                        visible: {
                          y: '0%',
                          transition: timing(0.55, 0.16 + index * 0.0025),
                        },
                        exit: {
                          y: '-110%',
                          transition: timing(0.3, index * 0.0015),
                        },
                      }}
                    >
                      {letter}
                    </m.span>
                  )
                })}
              </span>
            </span>
          ))}
        </span>
      </blockquote>
      <figcaption className="mt-8 flex min-h-[72px] items-center gap-4">
        <m.div
          className="bg-warm-white size-[72px] shrink-0 overflow-clip"
          variants={{
            enter: { clipPath: 'inset(0 100% 0 0)' },
            visible: { clipPath: 'inset(0 0% 0 0)', transition: timing(0.55, 0.12) },
            exit: { clipPath: 'inset(0 0 0 100%)', transition: timing(0.4) },
          }}
        >
          <img
            src={image || profileIcon}
            alt={item.imageAlt}
            className="block h-full w-full object-cover data-[placeholder=true]:p-3"
            width={72}
            height={72}
            decoding="async"
            data-placeholder={!image}
            onError={(event) => {
              const element = event.currentTarget
              if (element.src === profileIcon) return
              element.src = profileIcon
              element.dataset.placeholder = 'true'
            }}
          />
        </m.div>
        <div className="overflow-clip">
          <m.div
            variants={{
              enter: { y: '110%', opacity: 0 },
              visible: { y: '0%', opacity: 1, transition: timing(0.55, 0.22) },
              exit: { y: '-110%', opacity: 0, transition: timing(0.3) },
            }}
          >
            <p className="m-0 text-[12px] leading-[1.4] tracking-[0.04em] uppercase">{item.name}</p>
            <p className="text-secondary m-0 mt-1 text-[12px] leading-[1.4]">{item.detail}</p>
          </m.div>
        </div>
      </figcaption>
    </m.figure>
  )
}

export function Testimonies({
  content,
  reducedMotion,
  sectionRef,
}: {
  content: TestimoniesContent
  reducedMotion: boolean
  sectionRef: RefObject<HTMLElement | null>
}) {
  const visible = useInView(sectionRef, { amount: 0.35 })
  const pageVisible = useSyncExternalStore(subscribeVisibility, readVisibility)
  const [active, setActive] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)
  const progress = useMotionValue(0)
  const count = content.items.length
  const playing = visible && pageVisible && !reducedMotion

  function change(direction: number) {
    progress.set(0)
    setHasChanged(true)
    setActive((current) => (current + direction + count) % count)
  }

  useAnimationFrame((_, delta) => {
    if (!playing || count < 2) return
    const next = progress.get() + Math.min(delta, 64) / interval
    if (next >= 1) change(1)
    else progress.set(next)
  })

  return (
    <section
      ref={sectionRef}
      id="testimonies"
      className="bg-graphite text-warm-white relative isolate z-1 min-h-svh scroll-mt-[var(--header-height)] pt-20 pb-[60svh] md:pt-26 lg:pt-36"
      tabIndex={-1}
      aria-labelledby="testimonies-heading"
    >
      <RuleGrid className="absolute inset-0 z-[-1]" />
      <div className="container">
        <div role="group" aria-label={content.carouselLabel}>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 max-[479px]:grid-cols-1 md:grid-cols-[1fr_auto_minmax(120px,25%)] md:gap-6">
            <h2
              id="testimonies-heading"
              className="m-0 text-[12px] leading-[1.4] font-medium tracking-[0.08em]"
            >
              {content.eyebrow}
            </h2>
            <div className="flex items-center gap-1 max-[479px]:justify-self-end">
              <button
                className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
                type="button"
                aria-label={content.previous}
                onClick={() => change(-1)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <span
                className="text-secondary text-[12px] whitespace-nowrap tabular-nums"
                aria-hidden="true"
              >
                {String(active + 1).padStart(3, '0')} / {String(count).padStart(3, '0')}
              </span>
              <button
                className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
                type="button"
                aria-label={content.next}
                onClick={() => change(1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div
              className="bg-border col-span-full h-px overflow-clip md:col-auto"
              aria-hidden="true"
            >
              <m.span
                className="bg-warm-white block h-full origin-left"
                style={{ scaleX: reducedMotion ? 0 : progress }}
              />
            </div>
          </div>
          <div
            className="mt-[clamp(64px,12svh,144px)] grid md:mx-[8.333%]"
            aria-live={playing ? 'off' : 'polite'}
            aria-atomic="true"
          >
            {/* Reserve the tallest quote so automatic changes never move the page. */}
            <div
              className="pointer-events-none invisible col-start-1 row-start-1 m-0 grid min-w-0"
              aria-hidden="true"
            >
              {content.items.map((item) => (
                <div key={item.id} className="col-start-1 row-start-1 m-0 min-w-0">
                  <p className="m-0 max-w-[34ch] text-[clamp(1.75rem,3.2vw,3.5rem)] leading-[1.2] font-normal tracking-[-0.035em]">
                    {item.quote}
                  </p>
                  <div className="mt-8 flex min-h-[72px] items-center gap-4" />
                </div>
              ))}
            </div>
            <AnimatePresence initial={false} mode="sync">
              <Slide
                key={`${content.eyebrow}-${content.items[active].id}`}
                item={content.items[active]}
                animateEntry={hasChanged}
                reducedMotion={reducedMotion}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
