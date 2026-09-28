import { useRef, useSyncExternalStore } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { ProcessContent, ProcessStep } from '../content/process'

interface ProcessProps {
  content: ProcessContent
  reducedMotion: boolean
}

const wideQuery = '(min-width: 768px)'
const ease = [0.22, 1, 0.36, 1] as const

// Each step owns a slice of the pinned scroll so the three reveal in sequence.
// They finish around 0.6 so there is scroll left over with the bars already full.
const spans: [number, number][] = [
  [0.1, 0.26],
  [0.24, 0.4],
  [0.38, 0.58],
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

function stepVariants(index: number) {
  return {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.4, delayChildren: index * 0.04 } },
    static: { opacity: 1, transition: { duration: 0 } },
  }
}

const lineVariants = {
  hidden: { y: '110%' },
  shown: { y: '0%', transition: { duration: 0.75, ease } },
  static: { y: '0%', transition: { duration: 0 } },
}

// The panel fills left to right like a progress bar: the right inset closes to 0.
const panelVariants = {
  hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
  shown: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.9, ease } },
  static: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0 } },
}

interface StepBlockProps {
  step: ProcessStep
  index: number
  pinned: boolean
  reducedMotion: boolean
  progress: MotionValue<number>
}

function StepBlock({ step, index, pinned, reducedMotion, progress }: StepBlockProps) {
  const block = useRef<HTMLLIElement>(null)
  const [from, to] = spans[index] ?? [0, 1]
  const reveal = useTransform(progress, [from, to], [0, 1], { clamp: true })
  const opacity = useTransform(reveal, [0, 1], [0, 1])
  const rightInset = useTransform(reveal, [0, 1], [100, 0])
  const clipPath = useTransform(rightInset, (value) => `inset(0% ${value}% 0% 0%)`)
  const copyY = useTransform(reveal, [0.22, 1], ['110%', '0%'])
  // scroll: the pinned frame drives each step. view: one-shot reveal on enter.
  // static: reduced motion, so everything renders in its final state.
  const mode = reducedMotion ? 'static' : pinned ? 'scroll' : 'view'
  const scroll = mode === 'scroll'
  const revealOnView = mode === 'view'

  return (
    <motion.li
      ref={block}
      className="process__step"
      style={scroll ? { opacity } : undefined}
      initial={revealOnView ? 'hidden' : false}
      whileInView={revealOnView ? 'shown' : undefined}
      viewport={revealOnView ? { once: true, amount: 0.5 } : undefined}
      variants={stepVariants(index)}
    >
      <div className="process__panel">
        <motion.div
          className="process__fill"
          style={scroll ? { clipPath } : undefined}
          variants={panelVariants}
        >
          <h3 className="process__panel-line">
            <span className="process__index">{step.index}</span>
            <span className="process__title">{step.title}</span>
          </h3>
        </motion.div>
      </div>
      <div className="process__body">
        <p className="process__mask process__mask--date">
          <motion.span
            className="process__date"
            style={scroll ? { y: copyY } : undefined}
            variants={lineVariants}
          >
            {step.date}
          </motion.span>
        </p>
        <p className="process__mask">
          <motion.span
            className="process__description"
            style={scroll ? { y: copyY } : undefined}
            variants={lineVariants}
          >
            {step.description}
          </motion.span>
        </p>
      </div>
    </motion.li>
  )
}

export function Process({ content, reducedMotion }: ProcessProps) {
  const stage = useRef<HTMLDivElement>(null)
  const wide = useWide()
  // Pinning only pays off where the three blocks sit side by side. On mobile and
  // with reduced motion the steps stay in normal flow.
  const pinned = wide && !reducedMotion
  // 'start end' starts the fill as soon as the staircase enters the viewport, so
  // the bars are already running before the frame pins against the top edge.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end end'] })

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
                reducedMotion={reducedMotion}
                progress={scrollYProgress}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
