import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { m, useScroll, useTransform, type MotionValue } from 'framer-motion'
import type { AboutValue } from '@/content/about'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { SectionTitleReveal } from '@/components/ui/SectionTitleReveal'
import { useDesktopLayout } from '@/hooks/useDesktopLayout'

interface ValuesProps {
  eyebrow: string
  values: AboutValue[]
  reducedMotion: boolean
  canHover: boolean
}

const HOVER_TRANSITION = { duration: 0.35, ease: 'easeOut' } as const
const rowClassName = 'border-border relative border-t'
// Sizes follow the reference at desktop width: ~156px rows and ~5.4vw titles.
// "+" on the first grid line, the title on the second and the description on the fifth, as in
// the reference. The percentages follow RuleGrid's five equal columns.
const columnsClassName =
  'grid-cols-[40px_minmax(0,1fr)] gap-x-4 md:grid-cols-[20%_minmax(0,1fr)_20%] md:gap-x-0'

// Scroll window of each row, as fractions of the pinned stretch. As in the reference, the whole
// staircase plays while the panel is pinned under the header: rows arrive from the right on the
// way down and leave completely on the way back up, before the panel unpins and scrolls away.
// Lower rows start and end later, so the steps narrow progressively.
const STAIR_WINDOWS: [number, number][] = [
  [0.02, 0.5],
  [0.07, 0.6],
  [0.12, 0.7],
  [0.17, 0.78],
  [0.22, 0.86],
  [0.27, 0.92],
]

interface RowProps {
  as?: 'div' | 'li'
  className?: string
  children?: ReactNode
  onHoverStart?: () => void
  onHoverEnd?: () => void
  onTap?: () => void
}

function Row({
  as = 'div',
  className,
  x,
  children,
  ...events
}: RowProps & { x?: MotionValue<string> }) {
  const Element = as === 'li' ? m.li : m.div
  return (
    <Element
      className={`bg-graphite ${rowClassName} ${className ?? ''}`}
      style={x ? { x } : undefined}
      {...events}
    >
      {children}
    </Element>
  )
}

interface StairRowProps extends RowProps {
  index: number
  /** Pinned scroll progress; null leaves the row in place, in the normal page flow. */
  progress: MotionValue<number> | null
}

function SlidingRow({
  index,
  progress,
  ...props
}: RowProps & { index: number; progress: MotionValue<number> }) {
  const range = STAIR_WINDOWS[Math.min(index, STAIR_WINDOWS.length - 1)]
  const x = useTransform(progress, range, ['100%', '0%'], { clamp: true })
  return <Row {...props} x={x} />
}

function StairRow({ index, progress, ...props }: StairRowProps) {
  return progress ? <SlidingRow index={index} progress={progress} {...props} /> : <Row {...props} />
}

interface ValueRowProps {
  value: AboutValue
  index: number
  progress: MotionValue<number> | null
  canHover: boolean
  dimDescriptions: boolean
  duration: number
  /** Touch only: the row picked by the last tap, one at a time. */
  tapped: boolean
  onTap: () => void
}

// Each row owns its hover highlight: the staircase slides rows under a resting cursor while
// the page scrolls, and a section-wide state re-rendered every row on each crossing.
function ValueRow({
  value,
  index,
  progress,
  canHover,
  dimDescriptions,
  duration,
  tapped,
  onTap,
}: ValueRowProps) {
  const [hovered, setHovered] = useState(false)
  const active = canHover ? hovered : tapped
  return (
    <StairRow
      as="li"
      index={index + 1}
      progress={progress}
      onHoverStart={canHover ? () => setHovered(true) : undefined}
      onHoverEnd={canHover ? () => setHovered(false) : undefined}
      onTap={canHover ? undefined : onTap}
    >
      <div
        className={`grid min-h-[clamp(80px,9vw,156px)] items-center px-[var(--page-padding)] py-4 ${columnsClassName}`}
      >
        <span className="text-[20px] leading-none font-light" aria-hidden="true">
          +
        </span>
        {/* Phones scale with the viewport so the longest title fits beside the "+". */}
        <h3 className="m-0 grid text-[clamp(1.5rem,7.5vw,2rem)] leading-[1] font-normal tracking-[-0.02em] uppercase md:text-[clamp(2rem,5.4vw,5.75rem)]">
          <span className="[grid-area:1/1]">{value.title}</span>
          {/* Only the letters change colour on hover: a burgundy copy fades in over
              the title. */}
          <m.span
            className="text-burgundy [grid-area:1/1]"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ ...HOVER_TRANSITION, duration }}
          >
            {value.title}
          </m.span>
        </h3>
        <m.p
          className="col-start-2 m-0 mt-2 max-w-[36ch] text-[clamp(14px,1.05vw,18px)] leading-[1.4] md:col-start-3 md:mt-0"
          initial={false}
          animate={{ opacity: !dimDescriptions || active ? 1 : 0.45 }}
          transition={{ ...HOVER_TRANSITION, duration }}
        >
          {value.description}
        </m.p>
      </div>
    </StairRow>
  )
}

// Phones get the reference's mobile layout: the dark panel scrolls in the normal flow and only
// its label animates. The pinned staircase measured the section and moved every row on each
// scroll frame, which made the page heavy on phones.
export function Values(props: ValuesProps) {
  const desktop = useDesktopLayout()
  return desktop && !props.reducedMotion ? (
    <PinnedValues {...props} />
  ) : (
    <ValuesPanel {...props} progress={null} />
  )
}

function PinnedValues(props: ValuesProps) {
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <ValuesPanel {...props} sectionRef={section} progress={scrollYProgress} />
}

interface ValuesPanelProps extends ValuesProps {
  sectionRef?: RefObject<HTMLElement | null>
  progress: MotionValue<number> | null
}

function ValuesPanel({
  eyebrow,
  values,
  reducedMotion,
  canHover,
  sectionRef,
  progress,
}: ValuesPanelProps) {
  const [tapped, setTapped] = useState<number | null>(null)
  const pinned = progress !== null
  // Without hover every description stays readable; tapping a row highlights its title.
  const dimDescriptions = canHover && !reducedMotion
  const duration = reducedMotion ? 0 : HOVER_TRANSITION.duration

  return (
    <section
      ref={sectionRef}
      // The extra height is the pinned stretch in which the staircase plays.
      className={`bg-warm-white relative z-1 overflow-x-clip ${pinned ? 'h-[calc(100svh+160svh)]' : ''}`}
      aria-labelledby="valores-heading"
    >
      {/* Above the panel, so the guide lines stay visible while the rows slide over them. */}
      <RuleGrid className="absolute inset-0 z-1" spanClassName="bg-grid-burgundy" />
      <div
        className={`text-warm-white ${pinned ? 'sticky top-0 h-svh pt-[var(--header-height)]' : ''}`}
      >
        <StairRow index={0} progress={progress} className="border-t-0">
          <h2
            id="valores-heading"
            className="text-secondary m-0 flex min-h-[clamp(80px,9vw,156px)] items-center px-[var(--page-padding)] py-6 text-[clamp(12px,1vw,16px)] leading-[1.4] font-normal tracking-[0.08em] uppercase"
          >
            <SectionTitleReveal text={eyebrow} reducedMotion={reducedMotion} />
          </h2>
        </StairRow>
        <ul className="m-0 list-none p-0">
          {values.map((value, index) => (
            <ValueRow
              key={value.id}
              value={value}
              index={index}
              progress={progress}
              canHover={canHover}
              dimDescriptions={dimDescriptions}
              duration={duration}
              tapped={tapped === index}
              onTap={() => setTapped(tapped === index ? null : index)}
            />
          ))}
        </ul>
        {/* Last step of the staircase; in the flow layout the panel ends with the last value. */}
        {pinned && (
          <StairRow
            index={values.length + 1}
            progress={progress}
            className="h-[clamp(64px,9vw,156px)]"
          />
        )}
      </div>
    </section>
  )
}
