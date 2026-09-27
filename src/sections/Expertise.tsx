import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate, useAnimationFrame, useInView, useMotionValue } from 'framer-motion'
import type { ExpertiseContent } from '../content/expertise'

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
      ['.expertise__cover', { opacity: 1, scaleX: 1 }, { duration: 0 }],
      ['.expertise__copy', { y: '110%' }, { duration: 0 }],
      ['.expertise__cover', { scaleX: 0 }, { duration: 0.65, ease: [0.22, 1, 0.36, 1] }],
      ['.expertise__copy', { y: '0%' }, { duration: 0.75, at: 0.4, ease: [0.22, 1, 0.36, 1] }],
    ])
    return () => {
      controls.stop()
      // Restore readable content on preference changes and StrictMode cleanup.
      animate('.expertise__cover', { opacity: 0 }, { duration: 0 })
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
    <section id="expertise" className="expertise" aria-labelledby="expertise-heading">
      <div className="rule-grid expertise__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div ref={scope} className="expertise__intro container">
        <h2 id="expertise-heading" className="expertise__eyebrow">
          {content.eyebrow}
          <span className="expertise__cover" aria-hidden="true" />
        </h2>
        <div className="expertise__text-row">
          <div className="expertise__mask">
            <p className="expertise__copy expertise__heading">{content.heading}</p>
          </div>
          <div className="expertise__mask">
            <p className="expertise__copy expertise__description">{content.description}</p>
          </div>
        </div>
      </div>
      <div
        ref={rail}
        className="expertise__rail"
        data-moving={moving}
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
        <motion.div className="expertise__track" style={{ x: moving ? x : 0 }}>
          {(moving ? [false, true] : [false]).map((duplicate) => (
            <ul
              key={String(duplicate)}
              ref={duplicate ? undefined : group}
              className="expertise__cards"
              aria-hidden={duplicate || undefined}
            >
              {Array.from({ length: moving ? repeats : 1 }, (_, cycle) =>
                content.cards.map((card) => (
                  <li
                    key={`${cycle}-${card.id}`}
                    className="expertise__card"
                    aria-hidden={cycle > 0 || undefined}
                  >
                    {card.image && (
                      <img
                        src={card.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width={card.imageWidth}
                        height={card.imageHeight}
                      />
                    )}
                    <h3>{card.title}</h3>
                  </li>
                )),
              )}
            </ul>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
