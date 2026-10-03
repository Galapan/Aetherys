import { useRef, useSyncExternalStore } from 'react'
import { m, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { ProcessContent, ProcessStep } from '../content/process'

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

  return (
    <m.li
      className="process__step"
      style={{ y: scroll && !mobile ? entranceY : 0 }}
      initial={false}
    >
      <div className="process__panel">
        <m.div
          className="process__fill"
          style={{ clipPath: scroll ? clipPath : 'inset(0% 0% 0% 0%)' }}
        >
          <h3 className="process__panel-line">
            <span className="process__index">{step.index}</span>
            <span className="process__title">{step.title}</span>
          </h3>
        </m.div>
      </div>
      <m.div className="process__body" style={{ opacity: scroll && mobile ? bodyOpacity : 1 }}>
        <p className="process__mask process__mask--date">
          <m.span className="process__date" style={{ y: scroll ? dateY : 0 }}>
            {step.date}
          </m.span>
        </p>
        <p className="process__mask">
          <m.span className="process__description" style={{ y: scroll ? copyY : 0 }}>
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
      className="process"
      data-static={!pinned}
      aria-labelledby="process-heading"
    >
      <div className="rule-grid process__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div ref={stage} className="process__stage">
        <div className="process__frame">
          <div className="rule-grid process__grid process__grid--frame" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="process__intro">
            <h2 id="process-heading" className="process__eyebrow">
              {content.eyebrow}
            </h2>
          </div>
          <ol className="process__steps">
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
