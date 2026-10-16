import { m } from 'framer-motion'
import type { Locale } from '@/content/hero'
import {
  projectHref,
  projectsHref,
  projectImageSrcSet,
  projectLogoPaths,
  type ProjectCard,
  type ProjectsContent,
} from '@/content/projects'
import { RuleGrid } from '@/components/ui/RuleGrid'

interface ProjectDetailPageProps {
  card: ProjectCard
  nextCard: ProjectCard
  content: ProjectsContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

function reveal(reducedMotion: boolean, delay = 0) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : delay,
      ease: 'easeOut' as const,
    },
  }
}

const secondaryGraphite = 'text-[color-mix(in_srgb,var(--color-graphite)_78%,transparent)]'

const navLinkClasses = `inline-flex min-h-11 items-center text-[12px] leading-[1.4] tracking-[0.08em] uppercase text-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite`

export function ProjectDetailPage({
  card,
  nextCard,
  content,
  locale,
  reducedMotion,
  canHover,
}: ProjectDetailPageProps) {
  const meta = [card.year, card.category].filter(Boolean).join(' · ')

  return (
    <section
      id="proyecto"
      tabIndex={-1}
      className="text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh pb-[clamp(80px,9vw,144px)]"
      aria-labelledby="proyecto-heading"
    >
      <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
      <m.div
        className="relative h-[50svh] min-h-[260px] w-full overflow-hidden"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' }}
      >
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={card.image}
          srcSet={projectImageSrcSet(card)}
          sizes="100vw"
          alt={card.imageAlt}
          width={1200}
          height={675}
          loading="eager"
          decoding="async"
        />
        {projectLogoPaths[card.slug] && (
          <img
            className="pointer-events-none absolute top-1/2 left-1/2 max-h-[22.5%] max-w-[min(40vw,280px)] -translate-x-1/2 -translate-y-1/2 object-contain"
            src={projectLogoPaths[card.slug]}
            alt=""
            aria-hidden="true"
            width={560}
            height={160}
            loading="eager"
            decoding="async"
          />
        )}
      </m.div>
      <div className="container flex min-h-[50svh] flex-col justify-center">
        <m.h1
          id="proyecto-heading"
          className="text-[clamp(2.75rem,6vw,6rem)] leading-[1.02] font-medium tracking-[-0.04em] uppercase"
          {...reveal(reducedMotion, 0.05)}
        >
          <span className="text-burgundy" aria-hidden="true">
            /
          </span>
          {card.title}
        </m.h1>
        {meta && (
          <m.p
            className={`${secondaryGraphite} mt-[clamp(16px,2vw,24px)] text-[12px] leading-[1.4] tracking-[0.08em] uppercase`}
            {...reveal(reducedMotion, 0.15)}
          >
            {meta}
          </m.p>
        )}
      </div>
      <div className="container mt-[clamp(24px,4vw,48px)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <m.a
          href={projectsHref(locale)}
          className={navLinkClasses}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <span className="text-burgundy" aria-hidden="true">
            /
          </span>
          <span className="ml-1">{content.detail.back}</span>
        </m.a>
        <m.a
          href={projectHref(nextCard.slug, locale)}
          className={`${navLinkClasses} sm:justify-end`}
          aria-label={`${content.detail.next}: ${nextCard.title}`}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <span className="text-burgundy" aria-hidden="true">
            /
          </span>
          <span className="ml-1">{content.detail.next}</span>
          <span className={`${secondaryGraphite} ml-1`}>{nextCard.title}</span>
        </m.a>
      </div>
    </section>
  )
}
