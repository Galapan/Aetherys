import { useState, type CSSProperties } from 'react'
import { m } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { Locale } from '@/content/hero'
import {
  projectHref,
  projectImageSrcSet,
  projectLogoPaths,
  type ProjectCard as ProjectCardData,
} from '@/content/projects'

const markVariantClasses: Record<ProjectCardData['markVariant'], string> = {
  grotesque: 'font-grotesque font-bold tracking-[-0.04em] indent-[-0.04em]',
  contrast: 'font-contrast italic tracking-[0.02em] indent-[0.02em]',
  geometric: 'font-geometric font-light tracking-[0.16em] indent-[0.16em]',
  mono: 'font-mono-mark font-medium tracking-[-0.06em] indent-[-0.06em]',
  slab: 'font-slab font-bold tracking-[0.02em] indent-[0.02em]',
  display: 'font-display font-bold tracking-[-0.02em] indent-[-0.02em]',
}

interface ProjectCardVisualProps {
  card: ProjectCardData
  sizes?: string
  active: boolean
  transition: {
    duration: number
    ease: typeof REVEAL_EASE
  }
  reducedMotion: boolean
}

function ProjectCardMedia({
  card,
  sizes,
  active,
  transition,
  reducedMotion,
}: ProjectCardVisualProps) {
  const logo = projectLogoPaths[card.slug]

  return (
    <>
      <m.img
        className="block h-full w-full object-cover"
        src={card.image}
        srcSet={projectImageSrcSet(card)}
        sizes={sizes}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        width={1200}
        height={675}
        initial={false}
        animate={{ scale: active ? 1.1 : 1, filter: active ? 'blur(3px)' : 'blur(0px)' }}
        transition={transition}
      />
      {logo ? (
        <m.img
          className="pointer-events-none absolute inset-0 z-1 m-auto max-h-[27.5%] max-w-[min(35cqw,210px)] object-contain"
          src={logo}
          alt=""
          aria-hidden="true"
          width={420}
          height={120}
          loading="lazy"
          decoding="async"
          initial={false}
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ ...transition, duration: reducedMotion ? 0 : 0.4 }}
        />
      ) : (
        <m.span
          className={`text-warm-white pointer-events-none absolute inset-0 z-1 grid place-items-center text-[20cqw] leading-none select-none text-shadow-[0_2px_14px_color-mix(in_srgb,var(--color-graphite)_55%,transparent)] ${markVariantClasses[card.markVariant]}`}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ ...transition, duration: reducedMotion ? 0 : 0.4 }}
        >
          {card.mark}
        </m.span>
      )}
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

interface ProjectCardProps {
  card: ProjectCardData
  index: number
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
  /** Aspect ratio and layout placement owned by the parent deck. */
  className: string
  /** Rendered width hint so the browser picks a small srcset variant. */
  sizes: string
  style?: CSSProperties
}

export function ProjectCard({
  card,
  index,
  locale,
  reducedMotion,
  canHover,
  className,
  sizes,
  style,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const active = canHover && !reducedMotion && hovered
  const showCategory = active || !canHover || reducedMotion
  const transition = {
    duration: reducedMotion ? 0 : 0.95,
    ease: REVEAL_EASE,
  }

  return (
    <m.article
      id={card.id}
      data-project-index={index}
      tabIndex={-1}
      className={`text-warm-white [container-type:inline-size] relative w-full scroll-mt-[calc(var(--header-height)+24px)] ${className}`}
      style={style}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <a
        className="focus-visible:outline-burgundy block h-full w-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
        href={projectHref(card.slug, locale)}
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
            sizes={sizes}
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
      </a>
    </m.article>
  )
}
