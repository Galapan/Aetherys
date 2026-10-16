import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import type { ProjectsContent } from '@/content/projects'
import type { Locale } from '@/content/hero'
import { ProjectCard } from '@/sections/projects/ProjectCard'
import { reveal } from '@/sections/projects/reveal'
import { RuleGrid } from '@/components/ui/RuleGrid'

interface ProjectsPageProps {
  content: ProjectsContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

// Stagger cards are 10% shorter than the original 52vw cards (aspect 1133/720
// on lg, height = width * 720/1133; base aspect 50/27 below lg).
// Each next card starts at 7/8 of the previous one, so the overlap is height / 8.
const deckClasses =
  'flex flex-col gap-[clamp(32px,5vw,80px)] [--stagger-w:clamp(255px,44.19vw,1020px)] [--stagger-h:calc(var(--stagger-w)_*_720_/_1133)] [--stagger-overlap:calc(var(--stagger-h)_/_-8)] lg:gap-0'

function cardPlacement(index: number) {
  return [
    'aspect-[50/27] lg:aspect-[1133/720] lg:w-[var(--stagger-w)]',
    index % 2 === 0 ? 'lg:self-start' : 'lg:self-end',
    index > 0 ? 'lg:mt-[var(--stagger-overlap)]' : '',
  ].join(' ')
}

const headingClasses =
  'text-graphite lg:text-warm-white m-0 text-center text-[64px] leading-[1.1] font-medium uppercase tracking-[-0.03em] lg:text-[clamp(3rem,4.2vw,4.5rem)]'

interface DeckHeadingProps {
  label: string
  title: string
  year?: string
  reducedMotion: boolean
}

function DeckHeading({ label, title, year, reducedMotion }: DeckHeadingProps) {
  return (
    <m.h2 id="proyectos-heading" className={headingClasses} {...reveal(0.2, reducedMotion)}>
      <span
        className="inline-flex items-baseline gap-[clamp(16px,2vw,40px)]"
        style={{ perspective: '400px' }}
      >
        <span className="text-[12px] leading-[1.4] tracking-[0.08em] uppercase">{label}</span>
        <span className="inline-flex">
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={title}
              className="inline-block"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -24 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              /{title}
            </m.span>
          </AnimatePresence>
        </span>
        {year && (
          <span className="text-[12px] leading-[1.4] tracking-[0.08em] uppercase">{year}</span>
        )}
      </span>
    </m.h2>
  )
}

/** Tracks which card sits closest to the viewport centre. */
function useActiveCard(deckRef: RefObject<HTMLDivElement | null>) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return

    const cards = Array.from(deck.querySelectorAll<HTMLElement>('[data-project-index]'))
    let frame = 0
    const syncActiveProject = () => {
      frame = 0
      const reference = window.innerHeight * 0.5
      let bestIndex = 0
      let bestDistance = Number.POSITIVE_INFINITY
      cards.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - reference)
        if (distance < bestDistance) {
          bestDistance = distance
          bestIndex = Number(el.dataset.projectIndex)
        }
      })
      setActiveIndex(bestIndex)
    }
    const scheduleSync = () => {
      if (frame) return
      frame = requestAnimationFrame(syncActiveProject)
    }

    syncActiveProject()
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
    }
  }, [deckRef])

  return activeIndex
}

export function ProjectsPage({ content, locale, reducedMotion, canHover }: ProjectsPageProps) {
  const deckRef = useRef<HTMLDivElement>(null)
  const activeIndex = useActiveCard(deckRef)
  const total = content.cards.length
  const activeCard = content.cards[activeIndex] ?? content.cards[0]

  return (
    <section
      id="proyectos"
      tabIndex={-1}
      className="text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh scroll-mt-[calc(var(--header-height)+24px)] pt-[calc(var(--header-height)+clamp(32px,5vw,96px))] pb-[clamp(80px,9vw,144px)]"
      aria-labelledby="proyectos-heading"
    >
      <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
      <div className="relative px-[var(--page-padding)]">
        <div className="bg-warm-white pointer-events-none relative z-20 mb-8 flex min-h-14 items-center justify-start lg:sticky lg:top-[50svh] lg:mx-auto lg:mb-0 lg:h-0 lg:min-h-0 lg:w-fit lg:justify-center lg:bg-transparent lg:mix-blend-difference lg:will-change-transform">
          <DeckHeading
            label={content.sideLabel}
            title={activeCard?.title ?? content.eyebrow}
            year={activeCard?.year}
            reducedMotion={reducedMotion}
          />
        </div>
        <div ref={deckRef} className={deckClasses}>
          {content.cards.map((card, index) => (
            <ProjectCard
              key={card.id}
              card={card}
              index={index}
              locale={locale}
              reducedMotion={reducedMotion}
              canHover={canHover}
              className={cardPlacement(index)}
              sizes="(min-width: 1024px) 44vw, 100vw"
              style={{ zIndex: total - index }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
