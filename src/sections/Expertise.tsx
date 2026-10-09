import { SectionTitleReveal } from '../components/ui/SectionTitleReveal'
import { useEffect, useRef, useState } from 'react'
import { m, useAnimate, useAnimationFrame, useInView, useMotionValue } from 'framer-motion'
import type { ExpertiseContent } from '../content/expertise'
import { RuleGrid } from '../components/ui/RuleGrid'

interface ExpertiseProps {
  content: ExpertiseContent
  reducedMotion: boolean
  canHover: boolean
}

export function Expertise({ content, reducedMotion, canHover }: ExpertiseProps) {
  const [scope, animate] = useAnimate()
  const introVisible = useInView(scope, { once: true, amount: 0.35 })
  const rail = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLUListElement>(null)
  const railVisible = useInView(rail)
  const [repeats, setRepeats] = useState(1)
  const groupWidth = useRef(0)
  const pageVisible = useRef(!document.hidden)
  const cruiseSpeed = useRef(0)
  const currentSpeed = useRef(0)
  const targetSpeed = useRef(0)
  const hovering = useRef(false)
  const moving = !reducedMotion
  const x = useMotionValue(0)

  useEffect(() => {
    if (!introVisible || reducedMotion) return
    const controls = animate([
      ['.expertise__copy', { y: '110%' }, { duration: 0 }],
      ['.expertise__copy', { y: '0%' }, { duration: 0.75, at: 0.4, ease: [0.22, 1, 0.36, 1] }],
    ])
    return () => {
      controls.stop()
      // Restore readable content on preference changes and StrictMode cleanup.
      animate('.expertise__copy', { y: '0%' }, { duration: 0 })
    }
  }, [animate, introVisible, reducedMotion, content])

  useEffect(() => {
    const element = group.current
    const railElement = rail.current
    if (!element || !railElement || !moving) {
      groupWidth.current = 0
      cruiseSpeed.current = 0
      currentSpeed.current = 0
      targetSpeed.current = 0
      hovering.current = false
      x.set(0)
      return
    }
    const measure = () => {
      const periodWidth = element.getBoundingClientRect().width
      const naturalWidth = periodWidth / repeats
      const viewportWidth = railElement.getBoundingClientRect().width
      const nextRepeats = Math.max(1, Math.ceil(viewportWidth / naturalWidth))
      groupWidth.current = periodWidth
      cruiseSpeed.current = periodWidth / (content.cards.length * repeats) / 5.5
      if (!hovering.current) targetSpeed.current = cruiseSpeed.current
      x.set(0)
      if (nextRepeats !== repeats) setRepeats(nextRepeats)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(railElement)
    const onVisibility = () => {
      pageVisible.current = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [content.cards.length, moving, repeats, x])

  useAnimationFrame((_, delta) => {
    if (!moving || !railVisible || !pageVisible.current || !groupWidth.current) return
    const elapsed = Math.min(delta, 64) / 1000
    const smoothing = 1 - Math.exp(-elapsed / 0.5)
    currentSpeed.current += (targetSpeed.current - currentSpeed.current) * smoothing
    x.set((x.get() - elapsed * currentSpeed.current) % groupWidth.current)
  })

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
          if (canHover && moving) {
            hovering.current = true
            targetSpeed.current = 0
          }
        }}
        onPointerLeave={() => {
          if (canHover && moving) {
            hovering.current = false
            targetSpeed.current = cruiseSpeed.current
          }
        }}
      >
        <m.div className={`flex ${moving ? 'w-max' : 'w-full'}`} style={{ x: moving ? x : 0 }}>
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
                  <li
                    key={`${cycle}-${card.id}`}
                    className={`bg-dark-gray text-warm-white relative aspect-square flex-[0_0_auto] overflow-hidden rounded-lg ${moving ? 'w-[clamp(230px,23.6vw,410px)]' : 'w-[75%] justify-self-center'}`}
                    aria-hidden={cycle > 0 || undefined}
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
                    <h3 className="absolute inset-0 z-1 m-0 grid place-content-center p-6 text-center text-[clamp(1.75rem,3vw,3rem)] leading-[1.1] font-medium tracking-[-0.02em]">
                      {card.title}
                    </h3>
                  </li>
                )),
              )}
            </ul>
          ))}
        </m.div>
      </div>
    </section>
  )
}
