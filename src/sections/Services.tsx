import { SectionTitleReveal } from '../components/ui/SectionTitleReveal'
import { useEffect, useRef } from 'react'
import {
  m,
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
import { RuleGrid } from '../components/ui/RuleGrid'

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
    <li ref={element} className="overflow-hidden">
      <m.span
        className="block pr-10"
        style={{ x: interactive ? x : 0, opacity: interactive ? opacity : 1 }}
      >
        {item}
      </m.span>
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
  return (
    <article
      className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-4 gap-y-6 md:grid-cols-[1fr_3fr_4fr] md:gap-x-6 lg:grid-cols-12"
      aria-labelledby={`service-${service.id}`}
    >
      <span className="m-0 text-[12px] leading-[1.4] font-normal" aria-hidden="true">
        /{index + 1}
      </span>
      <h3
        id={`service-${service.id}`}
        className="m-0 justify-self-end text-right text-[12px] leading-[1.4] font-normal tracking-[0.08em] uppercase md:justify-self-start md:text-left lg:col-span-2"
      >
        <span className="text-burgundy mr-1" aria-hidden="true">
          +
        </span>
        {service.title}
      </h3>
      <p className="m-0 hidden max-w-[25ch] text-[18px] leading-[1.6] lg:col-span-4 lg:block">
        {service.description}
      </p>
      <ul className="col-span-full m-0 list-none p-0 text-[clamp(1.25rem,2.15vw,2rem)] leading-[1.25] tracking-[-0.035em] md:col-start-3 lg:col-span-5">
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
      // One item every 4 seconds. The rail is full-bleed, so it covers more
      // ground than the card rail and needs a brisker cadence to feel even.
      cruiseSpeed.current = width.current / technologies.length / 4
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
    <div className="mx-[calc(50%-50vw)] mt-12 w-screen lg:mt-16">
      <div
        ref={rail}
        className="focus-visible:outline-graphite overflow-hidden py-2 focus-visible:outline-2 focus-visible:outline-offset-4"
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
        <m.div
          className={`flex ${reducedMotion ? 'w-full' : 'w-max'}`}
          style={{ x: reducedMotion ? 0 : x }}
        >
          {(reducedMotion ? [false] : [false, true]).map((duplicate) => (
            <ul
              key={String(duplicate)}
              ref={duplicate ? undefined : group}
              className={`m-0 list-none p-0 ${reducedMotion ? 'grid w-full grid-cols-2 gap-x-0 gap-y-4 md:grid-cols-4 lg:grid-cols-5' : 'flex shrink-0'}`}
              aria-label={duplicate ? undefined : content.technologyLabel}
              aria-hidden={duplicate || undefined}
            >
              {technologies.map(({ id, name }) => {
                const Icon = icons[id]
                return (
                  <m.li
                    key={id}
                    className={`text-graphite before:text-burgundy after:text-burgundy relative flex min-h-[176px] flex-[0_0_clamp(160px,14vw,200px)] flex-col items-center justify-center before:absolute before:top-0 before:left-0 before:z-2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-[15px] before:leading-none before:content-['+'_/_''] after:absolute after:bottom-0 after:left-0 after:z-2 after:-translate-x-1/2 after:translate-y-1/2 after:text-[15px] after:leading-none after:content-['+'_/_''] ${reducedMotion ? 'w-auto' : 'w-[clamp(160px,14vw,200px)]'}`}
                    initial={false}
                    animate={interactive ? 'rest' : 'static'}
                    whileHover={interactive ? 'hover' : undefined}
                  >
                    <m.span
                      className="pointer-events-none absolute inset-0 z-0 origin-center bg-[color-mix(in_srgb,var(--color-graphite)_4%,transparent)] opacity-0"
                      aria-hidden="true"
                      variants={{
                        rest: { opacity: 0, scale: 0.02, transition: technologyLeave },
                        hover: { opacity: 1, scale: 1, transition: technologyEnter },
                        static: { opacity: 0, scale: 1, transition: { duration: 0 } },
                      }}
                    />
                    <m.span
                      className="relative z-1 flex size-11 shrink-0 items-center justify-center"
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
                      <Icon className="size-14 flex-[0_0_56px]" focusable="false" />
                    </m.span>
                    <m.span
                      className="absolute inset-x-2 bottom-[34px] z-1 text-center text-[14px] leading-[1.4]"
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
                    </m.span>
                  </m.li>
                )
              })}
            </ul>
          ))}
        </m.div>
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
    <section
      id="servicios"
      tabIndex={-1}
      className="bg-warm-white text-graphite focus-visible:outline-graphite relative z-1 scroll-mt-[calc(var(--header-height)+24px)] overflow-x-clip pb-[max(80px,var(--services-section-gap))] [--services-section-gap:40svh] focus-visible:outline-2 focus-visible:outline-offset-4 md:pb-[max(104px,var(--services-section-gap))] lg:pb-[max(144px,var(--services-section-gap))]"
      aria-labelledby="services-heading"
    >
      <RuleGrid className="absolute inset-0" spanClassName="bg-grid-burgundy" />
      <div className="relative container">
        <div className="mb-20 grid gap-6 md:mb-26 md:grid-cols-[3fr_9fr] lg:grid-cols-12">
          <h2
            id="services-heading"
            className="text-burgundy m-0 text-[12px] leading-[1.4] font-medium tracking-[0.08em] lg:col-span-3"
          >
            <SectionTitleReveal text={content.eyebrow} reducedMotion={reducedMotion} />
          </h2>
          <p className="m-0 max-w-[62ch] text-[18px] leading-[1.6] lg:col-span-7">
            {content.introduction}
          </p>
        </div>
        <div className="grid gap-16">
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
        <div className="mt-26 grid gap-6 md:grid-cols-[7fr_5fr] lg:mt-36">
          <h3 className="m-0 max-w-[25ch] text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.15] font-normal tracking-[-0.035em]">
            {content.technologyHeading}
          </h3>
          <p className="m-0 max-w-[62ch] text-[18px] leading-[1.6]">
            {content.technologyDescription}
          </p>
        </div>
        <TechnologyRail {...props} />
      </div>
    </section>
  )
}
