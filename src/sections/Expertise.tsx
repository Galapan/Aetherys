import { SectionTitleReveal } from '@/components/ui/SectionTitleReveal'
import { useEffect, useRef, useState } from 'react'
import {
  m,
  useAnimate,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { ExpertiseContent } from '@/content/expertise'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { useMarquee } from '@/hooks/useMarquee'

interface ExpertiseProps {
  content: ExpertiseContent
  reducedMotion: boolean
  canHover: boolean
}

type ExpertiseCard = ExpertiseContent['cards'][number]

// Seconds the rail takes to advance one card at rest.
const SECONDS_PER_CARD = 5.5
// Titles travel this much faster than their images, drifting across the card.
const TITLE_PARALLAX = 0.16

export function Expertise({ content, reducedMotion, canHover }: ExpertiseProps) {
  const [scope, animate] = useAnimate()
  const introVisible = useInView(scope, { once: true, amount: 0.35 })
  const rail = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLUListElement>(null)
  const [repeats, setRepeats] = useState(1)
  const moving = !reducedMotion
  const railWidth = useMotionValue(0)
  const marquee = useMarquee({
    enabled: moving,
    duration: content.cards.length * repeats * SECONDS_PER_CARD,
    group,
    viewport: rail,
  })
  const trackX = marquee.x

  useEffect(() => {
    const root = scope.current
    if (!introVisible || reducedMotion || !root) return
    const controls = animate([
      ['.expertise__copy', { transform: 'translateY(110%)' }, { duration: 0 }],
      [
        '.expertise__copy',
        { transform: 'translateY(0%)' },
        { duration: 0.75, at: 0.4, ease: REVEAL_EASE },
      ],
    ])
    return () => {
      controls.stop()
      // Restore readable content on preference changes and StrictMode cleanup. On
      // unmount the scope is already detached and a selector animation would throw.
      if (root.isConnected) animate('.expertise__copy', { transform: 'none' }, { duration: 0 })
    }
  }, [animate, introVisible, reducedMotion, content, scope])

  useEffect(() => {
    const element = group.current
    const railElement = rail.current
    if (!element || !railElement || !moving) return
    // Repeat the cards until one period covers the rail, so the loop never shows a gap.
    const measure = () => {
      const naturalWidth = element.getBoundingClientRect().width / repeats
      const viewportWidth = railElement.getBoundingClientRect().width
      railWidth.set(viewportWidth)
      const nextRepeats = Math.max(1, Math.ceil(viewportWidth / naturalWidth))
      if (nextRepeats !== repeats) setRepeats(nextRepeats)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(railElement)
    return () => observer.disconnect()
  }, [moving, repeats, railWidth])

  return (
    <section
      id="expertise"
      className="bg-warm-white text-graphite relative z-1 scroll-mt-[calc(var(--header-height)+24px)] pb-20 md:pb-26 lg:pb-36"
      aria-labelledby="expertise-heading"
    >
      <RuleGrid className="absolute inset-0" spanClassName="bg-grid-burgundy" />
      <div ref={scope} className="relative container">
        <h2
          id="expertise-heading"
          className="text-burgundy relative m-0 mb-8 table text-[12px] leading-[1.4] font-medium tracking-[0.08em]"
        >
          <SectionTitleReveal text={content.eyebrow} reducedMotion={reducedMotion} />
        </h2>
        <div className="mb-12 grid gap-6 md:grid-cols-[7fr_5fr] lg:mb-16">
          <div className="overflow-hidden">
            <p className="expertise__copy m-0 text-[18px] leading-[1.6] font-medium">
              {content.heading}
            </p>
          </div>
          <div className="overflow-hidden">
            <p className="expertise__copy m-0 max-w-[46ch] text-[18px] leading-[1.6]">
              {content.description}
            </p>
          </div>
        </div>
      </div>
      <div
        ref={rail}
        className={`relative overflow-hidden ${moving ? '' : 'container'}`}
        onPointerEnter={() => {
          if (canHover) marquee.setHalted(true)
        }}
        onPointerLeave={() => marquee.setHalted(false)}
      >
        <m.div
          className={`flex ${moving ? 'w-max' : 'w-full'}`}
          style={moving ? { x: trackX } : undefined}
        >
          {(moving ? [false, true] : [false]).map((duplicate) => (
            <ul
              key={String(duplicate)}
              ref={duplicate ? undefined : group}
              className={
                moving
                  ? 'm-0 flex list-none gap-6 p-0 pr-6'
                  : 'm-0 grid w-full list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-6 lg:grid-cols-4'
              }
              aria-hidden={duplicate || undefined}
            >
              {Array.from({ length: moving ? repeats : 1 }, (_, cycle) =>
                content.cards.map((card) => (
                  <ExpertiseCardItem
                    key={`${cycle}-${card.id}`}
                    card={card}
                    moving={moving}
                    hidden={cycle > 0}
                    trackX={trackX}
                    railWidth={railWidth}
                  />
                )),
              )}
            </ul>
          ))}
        </m.div>
      </div>
    </section>
  )
}

interface ExpertiseCardItemProps {
  card: ExpertiseCard
  moving: boolean
  hidden: boolean
  trackX: MotionValue<number>
  railWidth: MotionValue<number>
}

function ExpertiseCardItem({ card, moving, hidden, trackX, railWidth }: ExpertiseCardItemProps) {
  const item = useRef<HTMLLIElement>(null)
  // Offset the title by its card's distance from the rail's centre; transforms leave
  // offsetLeft untouched, so reading it each frame does not force layout.
  const titleX = useTransform(() => {
    const element = item.current
    if (!moving || !element) return 0
    const center = trackX.get() + element.offsetLeft + element.offsetWidth / 2
    return (center - railWidth.get() / 2) * TITLE_PARALLAX
  })

  return (
    <li
      ref={item}
      className={`bg-dark-gray text-warm-white relative aspect-square flex-[0_0_auto] overflow-hidden rounded-lg ${moving ? 'w-[clamp(230px,23.6vw,410px)]' : 'w-[75%] justify-self-center'}`}
      aria-hidden={hidden || undefined}
    >
      {card.image && (
        <img
          src={card.image}
          alt=""
          className="block h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={card.imageWidth}
          height={card.imageHeight}
        />
      )}
      <m.h3
        className="absolute inset-0 z-1 m-0 grid place-content-center p-6 text-center text-[clamp(1.75rem,3vw,3rem)] leading-[1.1] font-medium tracking-[-0.02em]"
        style={moving ? { x: titleX } : undefined}
      >
        {card.title}
      </m.h3>
    </li>
  )
}
