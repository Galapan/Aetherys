import { useRef, useSyncExternalStore } from 'react'
import { m, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { ProcessContent, ProcessStep } from '../content/process'
import { RuleGrid } from '../components/ui/RuleGrid'

interface ProcessProps {
  content: ProcessContent
  reducedMotion: boolean
}

const wideQuery = '(min-width: 768px)'

// The rises begin farther apart and converge to one panel-height per step.
// Adjacent spans keep the fill moving from one bar straight into the next.
const spans: [number, number][] = [
  [0.25, 0.4],
  [0.4, 0.55],
  [0.55, 0.7],
]

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(wideQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function readWide() {
  return window.matchMedia(wideQuery).matches
}

function useWide() {
  return useSyncExternalStore(subscribeWide, readWide)
}

interface StepBlockProps {
  step: ProcessStep
  index: number
  pinned: boolean
  mobile: boolean
  reducedMotion: boolean
  progress: MotionValue<number>
}

function StepBlock({ step, index, pinned, mobile, reducedMotion, progress }: StepBlockProps) {
  const entranceY = useTransform(
    progress,
    [index * 0.035, 0.18 + index * 0.035],
    [`${7.5 + index * 10.5}svh`, '0svh'],
  )
  const [from, to] = spans[index] ?? [0, 1]
  const reveal = useTransform(progress, [from, to], [0, 1], { clamp: true })
  const rightInset = useTransform(reveal, [0, 1], [100, 0])
  const clipPath = useTransform(rightInset, (value) => `inset(0% ${value}% 0% 0%)`)
  const dateY = useTransform(reveal, mobile ? [0, 0.15] : [0.15, 0.55], ['110%', '0%'])
  const copyY = useTransform(reveal, mobile ? [0, 0.25] : [0.3, 0.8], ['110%', '0%'])
  // Mobile keeps all three headers visible and crossfades copy in one shared area.
  // Screen readers retain the complete ordered list, including every description.
  const bodyOpacity = useTransform(
    progress,
    index === spans.length - 1 ? [from, from + 0.025] : [from, from + 0.025, to, to + 0.025],
    index === spans.length - 1 ? [0, 1] : [0, 1, 1, 0],
  )
  const scroll = pinned && !reducedMotion
  const mobilePinned = pinned && mobile

  return (
    <m.li
      className={[
        'relative grid min-w-0 grid-rows-[auto_1fr]',
        index === 1 && 'md:mt-[var(--process-stagger)]',
        index === 2 && 'md:mt-[calc(var(--process-stagger)*2)]',
        mobilePinned && 'grid-rows-[calc(var(--process-panel-height)*3)_1fr] [grid-area:1/1]',
        pinned &&
          "after:bg-graphite after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[var(--process-scroll-height)] after:content-['']",
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ y: scroll && !mobile ? entranceY : 0 }}
      initial={false}
    >
      <div
        className={[
          'min-h-[var(--process-panel-height)] bg-[color-mix(in_srgb,var(--color-burgundy)_20%,transparent)]',
          mobilePinned &&
            'self-start bg-[color-mix(in_srgb,var(--color-burgundy)_20%,var(--color-warm-white))]',
          mobilePinned && index === 1 && 'mt-[var(--process-panel-height)]',
          mobilePinned && index === 2 && 'mt-[calc(var(--process-panel-height)*2)]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <m.div
          className="bg-burgundy text-warm-white flex min-h-[var(--process-panel-height)] items-center px-[clamp(24px,2.6vw,40px)]"
          style={{ clipPath: scroll ? clipPath : 'inset(0% 0% 0% 0%)' }}
        >
          <h3 className="m-0 flex items-baseline gap-[clamp(8px,1vw,16px)] whitespace-nowrap">
            <span className="text-warm-white block leading-[1.1] font-medium tracking-[-0.02em] text-[var(--process-type-size)]">
              {step.index}
            </span>
            <span className="block leading-[1.1] font-medium tracking-[-0.02em] text-[var(--process-type-size)] uppercase">
              {step.title}
            </span>
          </h3>
        </m.div>
      </div>
      <m.div
        className={`bg-graphite text-warm-white grid content-start gap-3 px-[clamp(24px,2.6vw,40px)] pt-[30px] pb-6 [--process-copy-measure:56ch] ${mobilePinned ? 'bg-transparent' : ''}`}
        style={{ opacity: scroll && mobile ? bodyOpacity : 1 }}
      >
        <p className="m-0 block max-w-[var(--process-copy-measure)] overflow-hidden">
          <m.span
            className="text-warm-white block text-left text-[15px] leading-[1.4] font-semibold tracking-[0.08em] uppercase"
            style={{ y: scroll ? dateY : 0 }}
          >
            {step.date}
          </m.span>
        </p>
        <p className="m-0 block max-w-[var(--process-copy-measure)] overflow-hidden">
          <m.span
            className="block text-justify text-[18px] leading-[1.6] hyphens-auto text-[color-mix(in_srgb,var(--color-warm-white)_68%,transparent)] max-md:text-left"
            style={{ y: scroll ? copyY : 0 }}
          >
            {step.description}
          </m.span>
        </p>
      </m.div>
    </m.li>
  )
}

export function Process({ content, reducedMotion }: ProcessProps) {
  const stage = useRef<HTMLDivElement>(null)
  const wide = useWide()
  // Both layouts scrub through the steps; reduced motion uses normal document flow.
  const pinned = !reducedMotion
  // Entry uses the first quarter of the scroll; color starts after the frame pins.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end end'] })
  const progress = useSpring(
    scrollYProgress,
    wide ? { stiffness: 180, damping: 30, mass: 0.5 } : { stiffness: 500, damping: 32, mass: 0.5 },
  )

  return (
    <section
      id="proceso"
      tabIndex={-1}
      className="bg-warm-white text-graphite focus-visible:outline-graphite relative z-1 scroll-mt-[calc(var(--header-height)+24px)] overflow-clip [--process-scroll-height:320svh] focus-visible:outline-2 focus-visible:outline-offset-4 max-md:[--process-scroll-height:640svh]"
      aria-labelledby="process-heading"
    >
      <RuleGrid className="absolute inset-0" spanClassName="bg-grid-burgundy" />
      <div
        ref={stage}
        className={[
          'relative',
          pinned
            ? 'h-[calc(var(--process-scroll-height)+40svh)]'
            : 'h-auto pb-20 md:pb-26 lg:pb-36',
        ].join(' ')}
      >
        <div
          className={
            pinned
              ? 'sticky top-[25%] grid h-[75svh] grid-rows-[auto_1fr]'
              : 'static grid h-auto grid-rows-[auto_1fr]'
          }
        >
          <RuleGrid className="absolute inset-0 z-1" />
          <div className="relative mb-[clamp(24px,4svh,48px)] grid content-start gap-6 px-[var(--page-padding)] md:grid-cols-[7fr_5fr]">
            <h2
              id="process-heading"
              className="text-burgundy relative m-0 table text-[16px] leading-[1.4] font-medium tracking-[0.08em]"
            >
              {content.eyebrow}
            </h2>
          </div>
          <ol
            className={[
              'm-0 grid list-none grid-cols-[minmax(0,1fr)] gap-12 p-0 [--process-panel-gap:2px] [--process-panel-height:36px] [--process-stagger:calc(var(--process-panel-height)+var(--process-panel-gap))] [--process-type-size:clamp(0.875rem,1.15vw,1.125rem)] md:grid-cols-3 md:gap-0 md:[--process-panel-gap:0px] md:[--process-panel-height:clamp(30px,2.35vw,42px)]',
              pinned && !wide && 'bg-graphite gap-0',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {content.steps.map((step, index) => (
              <StepBlock
                key={step.id}
                step={step}
                index={index}
                pinned={pinned}
                mobile={!wide}
                reducedMotion={reducedMotion}
                progress={progress}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
