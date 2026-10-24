import { useState, type RefObject } from 'react'
import { m, useInView, useTransform, type MotionValue } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import { teamPhotos } from '@/content/about'
import type { Testimony } from '@/content/testimonies'
import { Button } from '@/components/ui/Button'
import { LightSection } from '@/components/ui/LightSection'
import { LineReveal } from '@/components/ui/LineReveal'
import { AboutEyebrow } from './AboutEyebrow'
import { useStackCarousel } from './useStackCarousel'

interface TeamProps {
  eyebrow: string
  intro: string
  callToAction: string
  carouselLabel: string
  carouselHint: string
  members: Testimony[]
  contactHref: string
  reducedMotion: boolean
  canHover: boolean
}

// As in the reference, a covered portrait stays pinned at the left edge while the next card
// slides over it: it shrinks a little around its vertical centre and darkens into the back.
const COVERED_SCALE = 0.9
const COVERED_SHADE = 0.7
// Rendered width of a card, mirroring --team-card below, so srcset picks the right portrait.
const CARD_SIZES = '(min-width: 1024px) clamp(260px, 26.5vw, 480px), clamp(220px, 64vw, 300px)'

interface TeamCardProps {
  member: Testimony
  index: number
  offset: MotionValue<number>
  step: MotionValue<number>
  visible: boolean
  reducedMotion: boolean
}

/**
 * Cards keep their slot until the track scrolls past it; then they pin to the left edge and
 * the following card slides over them, so the team stacks instead of leaving the frame.
 */
function TeamCard({ member, index, offset, step, visible, reducedMotion }: TeamCardProps) {
  const photo = teamPhotos[member.id]
  const x = useTransform(() => Math.max(index * step.get() - offset.get(), 0))
  const covered = useTransform(() => {
    const size = step.get()
    if (size <= 0) return 0
    return Math.min(Math.max((offset.get() - index * size) / size, 0), 1)
  })
  const scale = useTransform(covered, [0, 1], [1, COVERED_SCALE])
  const shade = useTransform(covered, [0, 1], [0, COVERED_SHADE])

  return (
    <m.li
      className="bg-warm-white relative w-[var(--team-card)] origin-left [grid-area:1/1]"
      style={{ x, scale }}
      initial={reducedMotion ? false : { opacity: 0, y: 48 }}
      animate={visible || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration: reducedMotion ? 0 : 0.9, delay: index * 0.08, ease: REVEAL_EASE }}
    >
      <div className="bg-graphite/5 relative aspect-[3/4] overflow-hidden rounded">
        {photo && (
          <img
            className="h-full w-full object-cover select-none"
            style={{ objectPosition: photo.position }}
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={CARD_SIZES}
            alt={member.imageAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        )}
        <m.span
          className="bg-graphite pointer-events-none absolute inset-0"
          style={{ opacity: shade }}
          aria-hidden="true"
        />
      </div>
      <p className="text-burgundy m-0 mt-4 text-[14px] leading-[1.4] font-medium tracking-[0.02em] uppercase md:text-[16px]">
        /{member.name}
      </p>
      <p className="text-secondary m-0 mt-1 pr-4 text-[14px] leading-[1.4]">{member.detail}</p>
    </m.li>
  )
}

interface TeamScrollbarProps {
  barRef: RefObject<HTMLDivElement | null>
  shown: boolean
  left: MotionValue<string>
  share: number
  dragging: boolean
  reducedMotion: boolean
  handlers: ReturnType<typeof useStackCarousel>['thumbHandlers']
}

/** Full-bleed to the page edge like the track; thick and square as in the reference. */
function TeamScrollbar({
  barRef,
  shown,
  left,
  share,
  dragging,
  reducedMotion,
  handlers,
}: TeamScrollbarProps) {
  return (
    <m.div
      ref={barRef}
      className="bg-graphite/10 relative mt-3 h-1"
      aria-hidden="true"
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
    >
      <m.span
        className="bg-graphite/55 absolute inset-y-0 block cursor-grab touch-none"
        style={{ left, width: `${share * 100}%` }}
        {...handlers}
      >
        {/* Turns burgundy while dragging, like the reference's accent thumb. */}
        <m.span
          className="bg-burgundy pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: dragging ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
        />
      </m.span>
    </m.div>
  )
}

function trackCursor(scrollable: boolean, dragging: boolean) {
  if (!scrollable) return ''
  return dragging ? 'cursor-grabbing' : 'cursor-grab'
}

export function Team({
  eyebrow,
  intro,
  callToAction,
  carouselLabel,
  carouselHint,
  members,
  contactHref,
  reducedMotion,
  canHover,
}: TeamProps) {
  const {
    track,
    bar,
    offset,
    step,
    thumbLeft,
    thumbShare,
    scrollable,
    dragging,
    trackHandlers,
    thumbHandlers,
  } = useStackCarousel(members.length, reducedMotion)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  // The scrollbar only shows while the carousel is in use, as in the reference.
  const barShown = !canHover || hovered || dragging || focused
  // Off-screen cards are clipped by the track, so the whole set enters together.
  const visible = useInView(track, { once: true, amount: 0.3 })

  return (
    <LightSection
      labelledBy="equipo-heading"
      className="overflow-x-clip pt-[clamp(48px,6vw,96px)] pb-[clamp(80px,10vw,144px)]"
    >
      {/* Full-bleed like RuleGrid: the copy sits on the first line and the carousel starts on
          the third (40% of the inner width), as in the reference. */}
      <div className="relative flex flex-col gap-10 px-[var(--page-padding)] lg:flex-row lg:gap-0">
        <div className="flex flex-col gap-10 lg:w-[40%] lg:shrink-0 lg:pe-6 lg:pb-16">
          <AboutEyebrow id="equipo-heading" text={eyebrow} reducedMotion={reducedMotion} />
          <div className="flex flex-col gap-6 lg:mt-auto">
            <p className="m-0 max-w-[40ch] text-[16px] leading-[1.6]">
              <LineReveal text={intro} reducedMotion={reducedMotion} />
            </p>
            <Button className="w-fit" href={contactHref} lift={canHover && !reducedMotion}>
              {callToAction}
            </Button>
          </div>
        </div>
        {/* Bleeds to the right edge of the page, like the reference carousel. */}
        <m.div
          className="-me-[var(--page-padding)] min-w-0 flex-1 [--team-card:clamp(220px,64vw,300px)] lg:[--team-card:clamp(260px,26.5vw,480px)]"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <m.div
            ref={track}
            className={`focus-visible:outline-graphite overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 ${trackCursor(scrollable, dragging)}`}
            style={{ touchAction: 'pan-y' }}
            role="group"
            aria-roledescription="carousel"
            aria-label={carouselLabel}
            aria-describedby={scrollable ? 'equipo-hint' : undefined}
            tabIndex={scrollable ? 0 : undefined}
            {...trackHandlers}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <ul className="m-0 grid list-none p-0">
              {members.map((member, index) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  index={index}
                  offset={offset}
                  step={step}
                  visible={visible}
                  reducedMotion={reducedMotion}
                />
              ))}
            </ul>
          </m.div>
          <p id="equipo-hint" className="sr-only">
            {carouselHint}
          </p>
          {scrollable && (
            <TeamScrollbar
              barRef={bar}
              shown={barShown}
              left={thumbLeft}
              share={thumbShare}
              dragging={dragging}
              reducedMotion={reducedMotion}
              handlers={thumbHandlers}
            />
          )}
        </m.div>
      </div>
    </LightSection>
  )
}
