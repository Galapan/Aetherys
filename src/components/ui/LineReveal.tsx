import { Fragment, memo, useLayoutEffect, useRef, useState } from 'react'
import { m, useInView } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'

interface LineRevealProps {
  text: string
  reducedMotion: boolean
  /** Seconds before the first line rises once the text is in view. */
  delay?: number
}

const LINE_STAGGER = 0.09

/** Content-derived keys: each word plus its occurrence, so repeated words stay distinct. */
function keyWords(text: string) {
  const seen = new Map<string, number>()
  return text.split(' ').map((word) => {
    const occurrence = (seen.get(word) ?? 0) + 1
    seen.set(word, occurrence)
    return { word, key: `${word}:${occurrence}` }
  })
}

/**
 * Masked line reveal from the about reference: each rendered line rises out of its own clip,
 * one after another. Words are grouped into lines by measuring where the browser wrapped them.
 * Memoized, so a section's hover or visibility state never re-renders its words.
 */
export const LineReveal = memo(function LineReveal({
  text,
  reducedMotion,
  delay = 0,
}: LineRevealProps) {
  const scope = useRef<HTMLSpanElement>(null)
  const visible = useInView(scope, { once: true, amount: 0.3 })
  const [lines, setLines] = useState<number[]>([])
  const words = keyWords(text)

  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    function measure() {
      const tops = Array.from(root!.children, (child) => (child as HTMLElement).offsetTop)
      const rows = [...new Set(tops)]
      const next = tops.map((top) => rows.indexOf(top))
      setLines((current) =>
        current.length === next.length && current.every((line, index) => line === next[index])
          ? current
          : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [text])

  return (
    <span ref={scope} className="block">
      {words.map(({ word, key }, index) => (
        <Fragment key={key}>
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
            <m.span
              className="inline-block"
              initial={reducedMotion ? false : { y: '110%' }}
              animate={{ y: visible || reducedMotion ? '0%' : '110%' }}
              transition={{
                duration: reducedMotion ? 0 : 0.9,
                delay: reducedMotion ? 0 : delay + (lines[index] ?? 0) * LINE_STAGGER,
                ease: REVEAL_EASE,
              }}
            >
              {word}
            </m.span>
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
})
