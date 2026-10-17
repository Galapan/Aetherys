import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { m, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'
import type { ProjectCard as ProjectCardData, ProjectsContent } from '@/content/projects'
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

// --deck-card-h is the card height: full-width 50/27 cards below lg, 8/5 stagger cards
// of --stagger-w on lg. The first and last cards start and end centred in the
// viewport, under the sticky title.
const sectionClasses =
  'text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh scroll-mt-[calc(var(--header-height)+24px)] [--stagger-w:clamp(255px,45.9vw,1060px)] [--deck-card-h:calc((100vw_-_2_*_var(--page-padding))_*_27_/_50)] lg:[--deck-card-h:calc(var(--stagger-w)_*_5_/_8)] pt-[max(calc(var(--header-height)_+_24px),calc(50svh_-_var(--deck-card-h)_/_2))] pb-[calc(50svh_-_var(--deck-card-h)_/_2)]'

// Below lg the single column keeps a wide gap so one card holds the centre at a time.
// On lg the cards alternate sides and each next one tucks 1/36 of a card under the
// previous one, so the swap between titles lands where the two cards meet.
const deckClasses = 'flex flex-col gap-[max(28svh,160px)] lg:gap-0'

function cardPlacement(index: number) {
  return [
    'aspect-[50/27] lg:aspect-[8/5] lg:w-[var(--stagger-w)]',
    index % 2 === 0 ? 'lg:self-start' : 'lg:self-end',
    index > 0 ? 'lg:mt-[calc(var(--deck-card-h)_/_-36)]' : '',
  ].join(' ')
}

// One roll row per card: the title on one line with its meta (label, year) beside it
// on lg and above it below lg. --roll-pitch is the row height and the roll step.
const rollClasses =
  'text-warm-white relative -translate-y-1/2 h-[var(--roll-pitch)] text-[clamp(2rem,10vw,3.5rem)] leading-[1.1] font-medium uppercase tracking-[-0.03em] [--roll-pitch:calc(1.1em+24px)] lg:text-[clamp(3rem,3.8vw,4.5rem)] lg:[--roll-pitch:1.15em]'

const rowGridClasses =
  "grid grid-cols-[auto_auto] items-baseline gap-x-4 gap-y-1 [grid-template-areas:'label_year'_'title_title'] lg:grid-cols-[auto_auto_auto] lg:gap-x-[clamp(12px,1.2vw,24px)] lg:[grid-template-areas:'label_title_year']"

const metaClasses = 'text-[12px] leading-[1.4] tracking-[0.08em] uppercase'

// Each title holds while the viewport centre is within ±HOLD of its card (in card
// spacings) and wipes out/in over the next WIPE, so the swap lands between cards.
const HOLD = 0.2
const WIPE = 0.6

// The roll trails the scroll slightly so native touch scroll does not make it jump.
const rollSpring = { stiffness: 140, damping: 28, mass: 0.6, restDelta: 0.0005 }

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

interface TitleRollRowProps {
  card: ProjectCardData
  label: string
  index: number
  progress: MotionValue<number>
}

function TitleRollRow({ card, label, index, progress }: TitleRollRowProps) {
  // Both the outgoing and the incoming title are cut from the bottom edge: the
  // outgoing one loses its lower part first, the incoming one shows its top first.
  const clipPath = useTransform(progress, (value) => {
    const hidden = easeInOut(Math.min(Math.max((Math.abs(value - index) - HOLD) / WIPE, 0), 1))
    return `inset(0 0 ${hidden * 100}% 0)`
  })

  return (
    <m.div
      className="absolute inset-x-0 flex h-[var(--roll-pitch)] items-center justify-center whitespace-nowrap"
      style={{ top: `calc(var(--roll-pitch) * ${index})`, clipPath }}
    >
      <div className={rowGridClasses}>
        <span className="justify-self-center [grid-area:title]">/{card.title}</span>
        <span className={`justify-self-start [grid-area:label] ${metaClasses}`}>{label}</span>
        {card.year && (
          <span className={`justify-self-end [grid-area:year] ${metaClasses}`}>{card.year}</span>
        )}
      </div>
    </m.div>
  )
}

interface TitleRollProps {
  cards: ProjectCardData[]
  label: string
  progress: MotionValue<number>
  reducedMotion: boolean
}

/** Sticky stack of every card title that rolls up with the deck's scroll progress. */
function TitleRoll({ cards, label, progress, reducedMotion }: TitleRollProps) {
  const transform = useTransform(
    progress,
    (value) => `translateY(calc(var(--roll-pitch) * ${-value}))`,
  )

  return (
    <div
      className="pointer-events-none sticky top-[50svh] z-20 h-0 mix-blend-difference"
      aria-hidden="true"
    >
      <m.div {...reveal(0.2, reducedMotion)}>
        <div className={rollClasses}>
          <m.div className="absolute inset-0" style={{ transform }}>
            {cards.map((card, index) => (
              <TitleRollRow
                key={card.id}
                card={card}
                label={label}
                index={index}
                progress={progress}
              />
            ))}
          </m.div>
        </div>
      </m.div>
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

  // Lenis emits from its own frame for wheel, keyboard, touch and programmatic scroll.
  useLenis(syncProgress)
  const smoothProgress = useSpring(progress, rollSpring)

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
    // Start on the restored scroll position instead of rolling through every title.
    smoothProgress.jump(progress.get())
    window.addEventListener('resize', scheduleSync)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleSync)
    }
  }, [deckRef, syncProgress, smoothProgress, progress])

  return reducedMotion ? progress : smoothProgress
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
            />
          ))}
        </div>
      </div>
    </section>
  )
}
