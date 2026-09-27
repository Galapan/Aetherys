import { useEffect, useRef } from 'react'
import {
  motion,
  stagger,
  useAnimate,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  SiAstro,
  SiFramer,
  SiJavascript,
  SiNodedotjs,
  SiPnpm,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from 'react-icons/si'
import type { IconType } from 'react-icons'
import { technologies, type Service, type ServicesContent } from '../content/services'

interface ServicesProps {
  content: ServicesContent
  reducedMotion: boolean
  canHover: boolean
}

const icons: Record<(typeof technologies)[number]['id'], IconType> = {
  typescript: SiTypescript,
  react: SiReact,
  framer: SiFramer,
  javascript: SiJavascript,
  tailwind: SiTailwindcss,
  astro: SiAstro,
  node: SiNodedotjs,
  pnpm: SiPnpm,
  vite: SiVite,
}
const ease = [0.22, 1, 0.36, 1] as const
const technologyEnter = { duration: 0.5, ease }
const technologyLeave = { duration: 0.4, ease }
const technologySpring = { type: 'spring', stiffness: 180, damping: 20, mass: 0.85 } as const

function ServiceFeature({
  item,
  pointerY,
  scrollY,
  interactive,
}: {
  item: string
  pointerY: MotionValue<number | null>
  scrollY: MotionValue<number>
  interactive: boolean
}) {
  const element = useRef<HTMLLIElement>(null)
  const influence = useTransform(() => {
    const y = pointerY.get()
    const node = element.current
    if (!interactive || y === null || !node) return null
    const scrollOffset = scrollY.get()
    const list = node.parentElement!.getBoundingClientRect()
    const bounds = node.getBoundingClientRect()
    const pageY = y + scrollOffset
    // Follow the cursor's height across the page, including the space beside the list.
    if (pageY < list.top + scrollOffset - 32 || pageY > list.bottom + scrollOffset + 32) return null
    const distance =
      Math.abs(pageY - (bounds.top + scrollOffset + bounds.height / 2)) / bounds.height
    return Math.exp(-0.5 * (distance / 1.25) ** 2)
  })
  const targetX = useTransform(influence, (value) => (value ?? 0) * 36)
  const targetOpacity = useTransform(influence, (value) =>
    value === null ? 1 : 0.16 + value * 0.84,
  )
  const spring = { stiffness: 90, damping: 22, mass: 1 }
  const x = useSpring(targetX, spring)
  const opacity = useSpring(targetOpacity, spring)

  return (
    <li ref={element}>
      <span className="services__item-text">
        <motion.span
          className="services__item-hover"
          style={{ x: interactive ? x : 0, opacity: interactive ? opacity : 1 }}
        >
          {item}
        </motion.span>
      </span>
    </li>
  )
}

function ServiceRow({
  service,
  index,
  reducedMotion,
  canHover,
  pointerY,
  scrollY,
}: {
  service: Service
  index: number
  reducedMotion: boolean
  canHover: boolean
  pointerY: MotionValue<number | null>
  scrollY: MotionValue<number>
}) {
  const [scope, animate] = useAnimate()
  const visible = useInView(scope, { once: true, amount: 0.2 })

  useEffect(() => {
    if (!visible || reducedMotion) return
    // Only mask text after Motion has initialized; the default markup stays readable.
    const controls = animate([
      ['.services__item-text', { y: '105%', opacity: 0 }, { duration: 0 }],
      [
        '.services__item-text',
        { y: '0%', opacity: 1 },
        { duration: 0.7, delay: stagger(0.055), ease },
      ],
    ])
    return () => {
      controls.stop()
      animate('.services__item-text', { y: '0%', opacity: 1 }, { duration: 0 })
    }
  }, [animate, visible, reducedMotion, service])

  return (
    <article ref={scope} className="services__row" aria-labelledby={`service-${service.id}`}>
      <span className="services__number" aria-hidden="true">
        /{index + 1}
      </span>
      <h3 id={`service-${service.id}`} className="services__title">
        <span aria-hidden="true">+</span>
        {service.title}
      </h3>
      <p className="services__description">{service.description}</p>
      <ul className="services__items">
        {service.items.map((item) => (
          <ServiceFeature
            key={item}
            item={item}
            pointerY={pointerY}
            scrollY={scrollY}
            interactive={canHover && !reducedMotion}
          />
        ))}
      </ul>
    </article>
  )
}

function TechnologyRail({ content, reducedMotion, canHover }: ServicesProps) {
  const interactive = canHover && !reducedMotion
  const rail = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLUListElement>(null)
  const visible = useInView(rail)
  const width = useRef(0)
  const pageVisible = useRef(!document.hidden)
  const hovered = useRef(false)
  const focused = useRef(false)
  const cruiseSpeed = useRef(0)
  const currentSpeed = useRef(0)
  const x = useMotionValue(0)

  useEffect(() => {
    const element = group.current
    x.set(0)
    if (!element || reducedMotion) {
      width.current = 0
      cruiseSpeed.current = 0
      currentSpeed.current = 0
      return
    }
    const measure = () => {
      width.current = element.getBoundingClientRect().width
      // Match the existing card rail's cadence: one item every 5.5 seconds.
      cruiseSpeed.current = width.current / technologies.length / 5.5
      x.set(0)
    }
    const onVisibility = () => {
      pageVisible.current = !document.hidden
    }
    measure()
    onVisibility()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, x])

  useAnimationFrame((_, delta) => {
    if (reducedMotion || !visible || !pageVisible.current || !width.current) return
    const elapsed = Math.min(delta, 64) / 1000
    const targetSpeed = (hovered.current && canHover) || focused.current ? 0 : cruiseSpeed.current
    const smoothing = 1 - Math.exp(-elapsed / 0.5)
    currentSpeed.current += (targetSpeed - currentSpeed.current) * smoothing
    x.set((x.get() - elapsed * currentSpeed.current) % width.current)
  })

  return (
    <div className="services__technologies">
      <div
        ref={rail}
        className="services__rail"
        data-static={reducedMotion}
        role="region"
        aria-label={content.technologyLabel}
        tabIndex={reducedMotion ? undefined : 0}
        onPointerEnter={() => {
          hovered.current = true
        }}
        onPointerLeave={() => {
          hovered.current = false
        }}
        onFocus={() => {
          focused.current = true
        }}
        onBlur={() => {
          focused.current = false
        }}
      >
        <motion.div className="services__track" style={{ x: reducedMotion ? 0 : x }}>
          {(reducedMotion ? [false] : [false, true]).map((duplicate) => (
            <ul
              key={String(duplicate)}
              ref={duplicate ? undefined : group}
              className="services__technology-list"
              aria-label={duplicate ? undefined : content.technologyLabel}
              aria-hidden={duplicate || undefined}
            >
              {technologies.map(({ id, name }) => {
                const Icon = icons[id]
                return (
                  <motion.li
                    key={id}
                    className="services__technology"
                    initial={false}
                    animate={interactive ? 'rest' : 'static'}
                    whileHover={interactive ? 'hover' : undefined}
                  >
                    <motion.span
                      className="services__technology-surface"
                      aria-hidden="true"
                      variants={{
                        rest: { opacity: 0, scale: 0.02, transition: technologyLeave },
                        hover: { opacity: 1, scale: 1, transition: technologyEnter },
                        static: { opacity: 0, scale: 1, transition: { duration: 0 } },
                      }}
                    />
                    <motion.span
                      className="services__technology-icon"
                      aria-hidden="true"
                      variants={{
                        rest: {
                          scale: 1,
                          y: 0,
                          opacity: 0.6,
                          filter: 'brightness(1)',
                          transition: technologySpring,
                        },
                        hover: {
                          scale: 0.82,
                          y: 0,
                          opacity: 1,
                          filter: 'brightness(0)',
                          transition: technologySpring,
                        },
                        static: {
                          scale: 1,
                          y: 0,
                          opacity: 0.6,
                          filter: 'brightness(1)',
                          transition: { duration: 0 },
                        },
                      }}
                    >
                      <Icon focusable="false" />
                    </motion.span>
                    <motion.span
                      className="services__technology-name"
                      variants={{
                        rest: {
                          opacity: 0,
                          y: 12,
                          transition: technologyLeave,
                        },
                        hover: {
                          opacity: 1,
                          y: 0,
                          transition: { ...technologySpring, delay: 0.28 },
                        },
                        static: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0 },
                        },
                      }}
                    >
                      {name}
                    </motion.span>
                  </motion.li>
                )
              })}
            </ul>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export function Services(props: ServicesProps) {
  const { content, reducedMotion, canHover } = props
  const pointerY = useMotionValue<number | null>(null)
  const { scrollY } = useScroll()

  useEffect(() => {
    pointerY.set(null)
    if (!canHover || reducedMotion) return
    const move = (event: PointerEvent) => {
      pointerY.set(event.pointerType === 'touch' ? null : event.clientY)
    }
    const reset = () => pointerY.set(null)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', reset)
    window.addEventListener('blur', reset)
    window.addEventListener('resize', reset)
    document.addEventListener('visibilitychange', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', reset)
      window.removeEventListener('blur', reset)
      window.removeEventListener('resize', reset)
      document.removeEventListener('visibilitychange', reset)
      pointerY.set(null)
    }
  }, [canHover, reducedMotion, pointerY])
  return (
    <section id="servicios" tabIndex={-1} className="services" aria-labelledby="services-heading">
      <div className="rule-grid services__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="container services__inner">
        <div className="services__intro">
          <h2 id="services-heading" className="services__eyebrow">
            {content.eyebrow}
          </h2>
          <p>{content.introduction}</p>
        </div>
        <div className="services__rows">
          {content.services.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              index={index}
              reducedMotion={reducedMotion}
              canHover={props.canHover}
              pointerY={pointerY}
              scrollY={scrollY}
            />
          ))}
        </div>
        <div className="services__technology-intro">
          <h3>{content.technologyHeading}</h3>
          <p>{content.technologyDescription}</p>
        </div>
        <TechnologyRail {...props} />
      </div>
    </section>
  )
}
