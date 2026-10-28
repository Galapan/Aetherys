import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { m, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'
import {
  hasProjectPage,
  type ProjectCard as ProjectCardData,
  type ProjectsContent,
} from '@/content/projects'
import type { Locale } from '@/content/hero'
import { ProjectCard } from '@/sections/projects/ProjectCard'
import { RuleGrid } from '@/components/ui/RuleGrid'

interface ProjectsPageProps {
  content: ProjectsContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

// --deck-card-h is the card height: full-width 50/27 cards below lg, 8/5 stagger cards
// of --stagger-w on lg. The first and last cards start and end centred in the
// viewport, under the sticky title.
const sectionClasses =
  'text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh scroll-mt-[calc(var(--header-height)+24px)] [--stagger-w:clamp(255px,45.9vw,1060px)] [--deck-card-h:calc((100vw_-_2_*_var(--page-padding))_*_27_/_50)] lg:[--deck-card-h:calc(var(--stagger-w)_*_5_/_8)] pt-[max(calc(var(--header-height)_+_24px),calc(50svh_-_var(--deck-card-h)_/_2))] pb-[calc(50svh_-_var(--deck-card-h)_/_2)]'

// Below lg the single column keeps a wide gap so one card holds the centre at a time.
// On lg the cards alternate sides with a clear vertical gap of ~17% of a card between
// them, as in the reference, so each card gets its own moment under the title.
const deckClasses = 'flex flex-col gap-[max(28svh,160px)] lg:gap-0'

function cardPlacement(index: number) {
  return [
    'aspect-[50/27] lg:aspect-[8/5] lg:w-[var(--stagger-w)]',
    index % 2 === 0 ? 'lg:self-start' : 'lg:self-end',
    index > 0 ? 'lg:mt-[calc(var(--deck-card-h)_*_0.17)]' : '',
  ].join(' ')
}

// One roll row per card: the title on one line with its meta (label, year) beside it
// on lg and above it below lg. --roll-pitch is the row height and the roll step. The
// box is a one-row window with room around the text: rows slide up through it, so the
// outgoing title leaves by its top edge while the incoming one rises in from the bottom
// edge, with a clear gap between the two.
const rollClasses =
  'text-warm-white relative -translate-y-1/2 h-[var(--roll-pitch)] overflow-hidden text-[clamp(2rem,10vw,3.5rem)] leading-[1.1] font-medium uppercase tracking-[-0.03em] [--roll-pitch:calc(1.7em+24px)] lg:text-[clamp(3rem,3.8vw,4.5rem)] lg:[--roll-pitch:1.7em]'

const rowGridClasses =
  "grid grid-cols-[auto_auto] items-baseline gap-x-4 gap-y-1 [grid-template-areas:'label_year'_'title_title'] lg:grid-cols-[auto_auto_auto] lg:gap-x-[clamp(12px,1.2vw,24px)] lg:[grid-template-areas:'label_title_year']"

const metaClasses = 'text-[12px] leading-[1.4] tracking-[0.08em] uppercase'

// From the reference: a project without its page yet shows its title faded, with the
// coming-soon label centred under it instead of the side label and year.
const comingSoonGridClasses = 'grid justify-items-center gap-y-1 opacity-55'

interface TitleRollRowProps {
  card: ProjectCardData
  label: string
  comingSoon: string
  index: number
}

function TitleRollRow({ card, label, comingSoon, index }: TitleRollRowProps) {
  return (
    <div
      className="absolute inset-x-0 flex h-[var(--roll-pitch)] items-center justify-center whitespace-nowrap"
      style={{ top: `calc(var(--roll-pitch) * ${index})` }}
    >
      {hasProjectPage(card) ? (
        <TitleRowGrid card={card} label={label} />
      ) : (
        <div className={comingSoonGridClasses}>
          <span>/{card.title}</span>
          <span className={metaClasses}>{comingSoon}</span>
        </div>
      )}
    </div>
  )
}

function TitleRowGrid({ card, label }: Pick<TitleRollRowProps, 'card' | 'label'>) {
  return (
    <div className={rowGridClasses}>
      <span className="justify-self-center [grid-area:title]">/{card.title}</span>
      <span className={`justify-self-start [grid-area:label] ${metaClasses}`}>{label}</span>
      {card.year && (
        <span className={`justify-self-end [grid-area:year] ${metaClasses}`}>{card.year}</span>
      )}
    </div>
  )
}

interface TitleRollProps {
  cards: ProjectCardData[]
  label: string
  comingSoon: string
  progress: MotionValue<number>
  reducedMotion: boolean
}

/**
 * Sticky one-row window over every card title. The rows move linearly with the deck's
 * scroll progress, one pitch per card spacing, so the strip glides in step with Lenis. */
function TitleRoll({ cards, label, comingSoon, progress, reducedMotion }: TitleRollProps) {
  const transform = useTransform(
    progress,
    (value) => `translateY(calc(var(--roll-pitch) * ${-value}))`,
  )

  // The track runs from the first card's centre to the last one's, so the window sticks
  // to the viewport centre only in between: the first and last titles stay on the middle
  // of their cards and scroll in and out with them.
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[calc(var(--deck-card-h)/2)] bottom-[calc(var(--deck-card-h)/2)]"
      aria-hidden="true"
    >
      <div className="sticky top-[50svh] z-20 h-0 mix-blend-difference">
        <div className={rollClasses}>
          {/* The strip is rewritten every scroll frame, so it keeps its own layer while it
              glides. Reduced motion steps it card by card, which needs no standing layer. */}
          <m.div
            className={`absolute inset-0 ${reducedMotion ? '' : 'will-change-transform'}`}
            style={{ transform }}
          >
            {cards.map((card, index) => (
              <TitleRollRow
                key={card.id}
                card={card}
                label={label}
                comingSoon={comingSoon}
                index={index}
              />
            ))}
          </m.div>
        </div>
      </div>
    </div>
  )
}

/**
 * Continuous card index at the viewport centre (1.5 = halfway between the centres
 * of cards 1 and 2), in step with Lenis. Reduced motion snaps it to whole cards. */
function useDeckProgress(deckRef: RefObject<HTMLDivElement | null>, reducedMotion: boolean) {
  const progress = useMotionValue(0)
  const cards = useRef<HTMLElement[]>([])

  const syncProgress = useCallback(() => {
    const half = window.innerHeight * 0.5
    const scrollY = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const reference = scrollY + half
    // Card centres in page coordinates, clamped to the centres the viewport can reach,
    // so the first title shows at the top of the page and the last one at the bottom.
    const centres = cards.current.map((el) => {
      const rect = el.getBoundingClientRect()
      const centre = scrollY + rect.top + rect.height / 2
      return Math.min(Math.max(centre, half), maxScroll + half)
    })
    let value = 0
    for (let i = 0; i < centres.length - 1; i++) {
      if (reference <= centres[i]) break
      const spacing = Math.max(centres[i + 1] - centres[i], 1)
      value = i + Math.min((reference - centres[i]) / spacing, 1)
    }
    progress.set(reducedMotion ? Math.round(value) : value)
  }, [progress, reducedMotion])

  // Lenis advances inside Motion's frame loop and emits for wheel, keyboard, touch and
  // programmatic scroll, so the roll is written in the same frame as the scroll.
  useLenis(syncProgress)

  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return
    cards.current = Array.from(deck.querySelectorAll<HTMLElement>('[data-project-index]'))

    let frame = 0
    const scheduleSync = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        syncProgress()
      })
    }

    syncProgress()
    window.addEventListener('resize', scheduleSync)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleSync)
    }
  }, [deckRef, syncProgress])

  return progress
}

export function ProjectsPage({ content, locale, reducedMotion, canHover }: ProjectsPageProps) {
  const deckRef = useRef<HTMLDivElement>(null)
  const progress = useDeckProgress(deckRef, reducedMotion)
  const total = content.cards.length

  return (
    <section
      id="proyectos"
      tabIndex={-1}
      className={sectionClasses}
      aria-labelledby="proyectos-heading"
    >
      <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
      <div className="relative px-[var(--page-padding)]">
        <h2 id="proyectos-heading" className="sr-only">
          {content.eyebrow}
        </h2>
        <TitleRoll
          cards={content.cards}
          label={content.sideLabel}
          comingSoon={content.comingSoon}
          progress={progress}
          reducedMotion={reducedMotion}
        />
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
              sizes="(min-width: 1024px) 46vw, 100vw"
              style={{ zIndex: total - index }}
              // The title roll shows the name and the label over these cards.
              comingSoon={
                hasProjectPage(card) ? undefined : { label: content.comingSoon, overlay: false }
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
