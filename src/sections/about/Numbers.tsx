import { useEffect, useRef } from 'react'
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { AboutStat } from '@/content/about'
import { LineReveal } from '@/components/ui/LineReveal'
import { AboutEyebrow } from './AboutEyebrow'
import { LightSection } from '@/components/ui/LightSection'

interface NumbersProps {
  eyebrow: string
  intro: string
  stats: AboutStat[]
  reducedMotion: boolean
  canHover: boolean
}

// Same hover zoom as the technology rail in Services.
const statEnter = { duration: 0.5, ease: REVEAL_EASE }
const statLeave = { duration: 0.4, ease: REVEAL_EASE }
const statSpring = { type: 'spring', stiffness: 120, damping: 20, mass: 0.85 } as const
// Odometer entrance from the reference, played once: every number starts at 0 and its digit
// wheels spin continuously (partial digits show mid-roll) before settling, units fastest.
// Stats start one after another as the row enters the viewport.
const ROLL_DURATION = 1.5
const STAT_STAGGER = 0.35
/** Extra full turns per column, from the units column leftwards. */
const COLUMN_TURNS = [3, 2, 1]

interface RollingColumnProps {
  digit: number
  turns: number
  progress: MotionValue<number>
}

function RollingColumn({ digit, turns, progress }: RollingColumnProps) {
  const steps = turns * 10 + digit
  const y = useTransform(progress, (value) => `${-value * steps}em`)
  return (
    <span className="block h-[1em] overflow-hidden">
      <m.span className="flex flex-col" style={{ y }}>
        {Array.from({ length: steps + 1 }, (_, index) => (
          <span key={index} className="block h-[1em]">
            {index % 10}
          </span>
        ))}
      </m.span>
    </span>
  )
}

interface RollingNumberProps {
  value: number
  visible: boolean
  delay: number
  reducedMotion: boolean
}

function RollingNumber({ value, visible, delay, reducedMotion }: RollingNumberProps) {
  const progress = useMotionValue(reducedMotion ? 1 : 0)
  const digits = String(value).split('').map(Number)

  useEffect(() => {
    if (reducedMotion) {
      progress.set(1)
      return
    }
    if (!visible) return
    const controls = animate(progress, 1, { duration: ROLL_DURATION, delay, ease: REVEAL_EASE })
    return () => controls.stop()
  }, [visible, delay, reducedMotion, progress])

  return (
    <span className="inline-flex leading-none" aria-hidden="true">
      {digits.map((digit, index) => (
        <RollingColumn
          key={index}
          digit={digit}
          turns={COLUMN_TURNS[digits.length - 1 - index] ?? 0}
          progress={progress}
        />
      ))}
    </span>
  )
}

// Centred on each corner so neighbouring cells share one cross.
const corners = [
  'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
]

export function Numbers({ eyebrow, intro, stats, reducedMotion, canHover }: NumbersProps) {
  const list = useRef<HTMLDListElement>(null)
  // Starts as the row enters, like the reference, rather than once it is fully in view.
  const visible = useInView(list, { once: true, amount: 0.15 })
  // Hover zoom from the technology rail in Services; without hover the labels stay visible.
  const interactive = canHover && !reducedMotion

  return (
    <LightSection labelledBy="numeros-heading" className="py-[clamp(80px,10vw,144px)]">
      {/* Full-bleed like RuleGrid, so percentages land on its lines (fifths of the inner width). */}
      <div className="relative px-[var(--page-padding)]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-0">
          <AboutEyebrow
            id="numeros-heading"
            text={eyebrow}
            reducedMotion={reducedMotion}
            className="shrink-0 md:w-[40%] lg:w-[60%]"
          />
          <p className="m-0 max-w-[46ch] text-[16px] leading-[1.6]">
            <LineReveal text={intro} reducedMotion={reducedMotion} />
          </p>
        </div>
        {/* From the second grid line to the fifth on desktop: one column per stat. */}
        <dl
          ref={list}
          className="m-0 mt-[clamp(48px,8vw,128px)] grid grid-cols-3 lg:ms-[20%] lg:w-[60%]"
        >
          {stats.map((stat, index) => (
            <m.div
              key={stat.id}
              className="relative flex min-h-[clamp(120px,14vw,250px)] items-center justify-center px-2"
              initial={false}
              animate={interactive ? 'rest' : 'static'}
              whileHover={interactive ? 'hover' : undefined}
            >
              {corners.map((corner) => (
                <span
                  key={corner}
                  className={`text-secondary pointer-events-none absolute z-2 text-[14px] leading-none font-light ${corner}`}
                  aria-hidden="true"
                >
                  +
                </span>
              ))}
              <m.span
                className="pointer-events-none absolute inset-0 z-0 origin-center bg-[color-mix(in_srgb,var(--color-graphite)_4%,transparent)] opacity-0"
                aria-hidden="true"
                variants={{
                  rest: { opacity: 0, scale: 0.02, transition: statLeave },
                  hover: { opacity: 1, scale: 1, transition: statEnter },
                  static: { opacity: 0, scale: 1, transition: { duration: 0 } },
                }}
              />
              <m.dt
                className="absolute inset-x-2 bottom-[clamp(16px,2.2vw,34px)] z-1 text-center text-[12px] leading-[1.4] tracking-[0.08em] uppercase"
                variants={{
                  rest: { opacity: 0, y: 12, transition: statLeave },
                  hover: { opacity: 1, y: 0, transition: { ...statSpring, delay: 0.28 } },
                  static: { opacity: 1, y: 0, transition: { duration: 0 } },
                }}
              >
                {stat.label}
              </m.dt>
              <m.dd
                className="relative z-1 m-0 text-[clamp(2.25rem,3.6vw,3.5rem)] font-medium tracking-[-0.03em] tabular-nums"
                variants={{
                  rest: { scale: 1, opacity: 0.62, transition: statSpring },
                  hover: { scale: 0.82, opacity: 1, transition: statSpring },
                  static: { scale: 1, opacity: 1, transition: { duration: 0 } },
                }}
              >
                <span className="sr-only">{stat.value}</span>
                <RollingNumber
                  value={stat.value}
                  visible={visible}
                  delay={index * STAT_STAGGER}
                  reducedMotion={reducedMotion}
                />
              </m.dd>
            </m.div>
          ))}
        </dl>
      </div>
    </LightSection>
  )
}
