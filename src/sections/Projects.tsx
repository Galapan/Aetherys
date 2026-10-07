import { useState } from 'react'
import { m } from 'framer-motion'
import type { ProjectCard as ProjectCardData, ProjectsContent } from '../content/projects'

interface ProjectsProps {
  content: ProjectsContent
  reducedMotion: boolean
  canHover: boolean
}

function reveal(index: number, reducedMotion: boolean) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : index * 0.08,
      ease: 'easeOut' as const,
    },
  }
}

const desktopCardAreas = [
  'lg:[grid-area:1/1]',
  'lg:[grid-area:2/1]',
  'lg:[grid-area:1/3]',
  'lg:[grid-area:3/1]',
  'lg:[grid-area:2/3]',
  'lg:[grid-area:3/3]',
]

const markVariantClasses: Record<ProjectCardData['markVariant'], string> = {
  grotesque: 'font-grotesque font-bold tracking-[-0.04em] indent-[-0.04em]',
  contrast: 'font-contrast italic tracking-[0.02em] indent-[0.02em]',
  geometric: 'font-geometric font-light tracking-[0.16em] indent-[0.16em]',
  mono: 'font-mono-mark font-medium tracking-[-0.06em] indent-[-0.06em]',
  slab: 'font-slab font-bold tracking-[0.02em] indent-[0.02em]',
  display: 'font-display font-bold tracking-[-0.02em] indent-[-0.02em]',
}

interface ProjectCardProps {
  card: ProjectCardData
  index: number
  reducedMotion: boolean
  canHover: boolean
}

interface ProjectCardVisualProps {
  card: ProjectCardData
  active: boolean
  transition: {
    duration: number
    ease: readonly [0.22, 1, 0.36, 1]
  }
  reducedMotion: boolean
}

function ProjectCardMedia({ card, active, transition, reducedMotion }: ProjectCardVisualProps) {
  return (
    <>
      <m.img
        className="block h-full w-full object-cover"
        src={card.image}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        width={1200}
        height={675}
        initial={false}
        animate={{ scale: active ? 1.1 : 1, filter: active ? 'blur(3px)' : 'blur(0px)' }}
        transition={transition}
      />
      <m.span
        className={`text-warm-white pointer-events-none absolute inset-0 z-1 grid place-items-center text-[20cqw] leading-none select-none text-shadow-[0_2px_14px_color-mix(in_srgb,var(--color-graphite)_55%,transparent)] ${markVariantClasses[card.markVariant]}`}
        aria-hidden="true"
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ ...transition, duration: reducedMotion ? 0 : 0.4 }}
      >
        {card.mark}
      </m.span>
    </>
  )
}

interface ProjectCardDetailsProps extends ProjectCardVisualProps {
  showCategory: boolean
}

function ProjectCardDetails({ card, active, showCategory, transition }: ProjectCardDetailsProps) {
  return (
    <m.div
      className="text-warm-white pointer-events-none absolute right-[22px] bottom-[22px] left-[22px] z-1 text-shadow-[0_2px_10px_var(--color-graphite),0_1px_3px_var(--color-graphite)]"
      layout
      initial={false}
      style={{ left: active ? 42 : 22, right: active ? 42 : 22 }}
      animate={{ y: active ? -20 : 0 }}
      transition={transition}
    >
      <m.div
        className="flex items-baseline justify-between gap-4 text-[clamp(11px,2.8cqw,15px)] leading-[1.4]"
        initial={false}
        animate={{ y: showCategory ? -40 : 0 }}
        transition={transition}
      >
        <h3 className="font-medium uppercase before:content-['/']">{card.title}</h3>
        {card.year && <span className="shrink-0">{card.year}</span>}
      </m.div>
      <m.div
        className="bg-warm-white text-graphite absolute bottom-0 w-fit max-w-full rounded px-[10px] py-[6px] text-[clamp(10px,2cqw,12px)] leading-[1.4] uppercase text-shadow-none"
        initial={false}
        animate={{ opacity: showCategory ? 1 : 0, y: showCategory ? 0 : 16 }}
        transition={{ ...transition, delay: active ? 0.12 : 0 }}
      >
        {card.category}
      </m.div>
    </m.div>
  )
}

function ProjectCard({ card, index, reducedMotion, canHover }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const active = canHover && !reducedMotion && hovered
  const showCategory = active || !canHover || reducedMotion
  const transition = {
    duration: reducedMotion ? 0 : 0.95,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <m.article
      id={card.id}
      tabIndex={-1}
      className={`text-warm-white [container-type:inline-size] relative aspect-[5/3] w-full scroll-mt-[calc(var(--header-height)+24px)] ${desktopCardAreas[index] ?? ''}`}
      {...reveal(index, reducedMotion)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Keep the hit area fixed while only the visual surface retracts. */}
      <m.div
        className="bg-burgundy text-warm-white absolute inset-0 overflow-hidden rounded-lg"
        initial={false}
        animate={{ clipPath: `inset(${active ? 20 : 0}px round 8px)` }}
        transition={transition}
      >
        <ProjectCardMedia
          card={card}
          active={active}
          transition={transition}
          reducedMotion={reducedMotion}
        />
        <ProjectCardDetails
          card={card}
          active={active}
          showCategory={showCategory}
          transition={transition}
          reducedMotion={reducedMotion}
        />
      </m.div>
    </m.article>
  )
}

export function Projects({ content, reducedMotion, canHover }: ProjectsProps) {
  return (
    <div className="relative px-[var(--page-padding)]">
      <div className="bg-warm-white pointer-events-none relative z-2 mb-8 flex min-h-14 items-center justify-start lg:sticky lg:top-[50svh] lg:mb-0 lg:h-0 lg:min-h-0 lg:justify-center lg:bg-transparent">
        <m.h2
          id="proyectos-heading"
          className="text-burgundy m-0 text-center text-[16px] leading-[1.1] font-medium tracking-[-0.03em] lg:text-[clamp(0.75rem,1.05vw,1.125rem)]"
          {...reveal(0.2, reducedMotion)}
        >
          <span className="relative inline-block pb-[7px]">
            {content.eyebrow}
            <m.span
              className="absolute right-0 bottom-0 left-0 h-px origin-left bg-current"
              initial={reducedMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                delay: reducedMotion ? 0 : 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <m.span
              className="absolute inset-0 origin-top bg-[var(--eyebrow-cover,var(--color-burgundy))]"
              aria-hidden="true"
              initial={{ scaleY: reducedMotion ? 0 : 1 }}
              whileInView={{ scaleY: 0 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{
                duration: reducedMotion ? 0 : 0.75,
                delay: reducedMotion ? 0 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </span>
        </m.h2>
      </div>
      <div className="flex flex-col gap-[clamp(32px,5vw,80px)] lg:grid lg:grid-cols-[40vw_minmax(0,1fr)_40vw] lg:gap-x-0">
        {content.cards.map((card, index) => (
          <ProjectCard
            key={card.id}
            card={card}
            index={index}
            reducedMotion={reducedMotion}
            canHover={canHover}
          />
        ))}
      </div>
    </div>
  )
}
