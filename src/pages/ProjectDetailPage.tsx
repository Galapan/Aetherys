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

// Mirrors the header: blends the label with whatever image sits behind it.
const backLinkClasses = `pointer-events-auto inline-flex min-h-11 items-center text-[14px] leading-[1.4] tracking-[0.08em] uppercase`

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
      <div className="text-warm-white pointer-events-none absolute inset-x-0 top-0 z-3 container max-w-none pt-[calc(var(--header-height)+clamp(12px,2vw,24px))] mix-blend-difference [--page-padding:clamp(20px,1.85vw,32px)]">
        <m.a
          href={projectsHref(locale)}
          className={backLinkClasses}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M13 8H3m0 0 4-4m-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{content.detail.back}</span>
        </m.a>
      </div>
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
        <div className="pointer-events-none absolute inset-0 z-2 flex flex-col justify-center">
          <m.h1
            id="proyecto-heading"
            className="text-warm-white container max-w-none text-[clamp(2.5rem,5vw,5rem)] leading-[1.02] font-medium tracking-[-0.04em] uppercase"
            {...reveal(reducedMotion, 0.05)}
          >
            <span aria-hidden="true">/</span>
            {card.title}
          </m.h1>
        </div>
      </m.div>
      <div
        className={
          card.summary
            ? 'container pt-[clamp(48px,7vw,96px)]'
            : 'container flex min-h-[50svh] flex-col justify-center'
        }
      >
        {meta && (
          <m.p
            className={`${secondaryGraphite} text-[12px] leading-[1.4] tracking-[0.08em] uppercase`}
            {...reveal(reducedMotion, 0.15)}
          >
            {meta}
          </m.p>
        )}
        {card.summary && (
          <m.p
            className="mt-[clamp(16px,2vw,24px)] max-w-[62ch] text-[18px] leading-[1.6]"
            {...reveal(reducedMotion, 0.2)}
          >
            {card.summary}
          </m.p>
        )}
      </div>
      {card.presentation && (
        <m.img
          className="mt-[clamp(48px,7vw,96px)] block h-auto w-full"
          src={card.presentation.src}
          srcSet={card.presentation.srcSet}
          sizes="100vw"
          alt={card.presentation.alt}
          width={card.presentation.width}
          height={card.presentation.height}
          loading="lazy"
          decoding="async"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' }}
        />
      )}
      <div className="container mt-[clamp(24px,4vw,48px)] flex flex-col gap-3 sm:flex-row sm:justify-end">
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
