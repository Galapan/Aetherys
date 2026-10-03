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
import './Testimonies.css'

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
      className="testimonies__slide"
      initial={animateEntry && !reducedMotion ? 'enter' : false}
      animate="visible"
      aria-hidden={!present || undefined}
      exit={reducedMotion ? undefined : 'exit'}
    >
      <blockquote className="testimonies__quote">
        <span className="visually-hidden">{item.quote}</span>
        <span aria-hidden="true">
          {item.quote.split(' ').map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 ? ' ' : null}
              <span className="testimonies__word">
                {Array.from(word).map((letter) => {
                  const index = letterIndex++
                  return (
                    <m.span
                      key={index}
                      className="testimonies__letter"
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
      <figcaption className="testimonies__author">
        <m.div
          className="testimonies__portrait"
          variants={{
            enter: { clipPath: 'inset(0 100% 0 0)' },
            visible: { clipPath: 'inset(0 0% 0 0)', transition: timing(0.55, 0.12) },
            exit: { clipPath: 'inset(0 0 0 100%)', transition: timing(0.4) },
          }}
        >
          <img
            src={image || profileIcon}
            alt={item.imageAlt}
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
        <div className="testimonies__identity-mask">
          <m.div
            className="testimonies__identity"
            variants={{
              enter: { y: '110%', opacity: 0 },
              visible: { y: '0%', opacity: 1, transition: timing(0.55, 0.22) },
              exit: { y: '-110%', opacity: 0, transition: timing(0.3) },
            }}
          >
            <p className="testimonies__name">{item.name}</p>
            <p className="testimonies__detail">{item.detail}</p>
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
      className="testimonies"
      tabIndex={-1}
      aria-labelledby="testimonies-heading"
    >
      <div className="rule-grid testimonies__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="container">
        <div className="testimonies__carousel" role="group" aria-label={content.carouselLabel}>
          <div className="testimonies__top">
            <h2 id="testimonies-heading" className="testimonies__eyebrow">
              {content.eyebrow}
            </h2>
            <div className="testimonies__controls">
              <button type="button" aria-label={content.previous} onClick={() => change(-1)}>
                <span aria-hidden="true">←</span>
              </button>
              <span className="testimonies__count" aria-hidden="true">
                {String(active + 1).padStart(3, '0')} / {String(count).padStart(3, '0')}
              </span>
              <button type="button" aria-label={content.next} onClick={() => change(1)}>
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="testimonies__progress" aria-hidden="true">
              <m.span style={{ scaleX: reducedMotion ? 0 : progress }} />
            </div>
          </div>
          <div
            className="testimonies__slides"
            aria-live={playing ? 'off' : 'polite'}
            aria-atomic="true"
          >
            {/* Reserve the tallest quote so automatic changes never move the page. */}
            <div className="testimonies__sizing" aria-hidden="true">
              {content.items.map((item) => (
                <div key={item.id} className="testimonies__size">
                  <p className="testimonies__quote">{item.quote}</p>
                  <div className="testimonies__author" />
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
