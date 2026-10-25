import { useCallback, useEffect, useRef, type RefObject } from 'react'
import {
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useVelocity,
  type MotionValue,
} from 'framer-motion'

interface MarqueeOptions {
  /** False under reduced motion or when the rail renders as a static grid. */
  enabled: boolean
  /** Seconds for the track to travel one period at rest. */
  duration: number
  /** First of the two identical groups in the track; its width is one period. */
  group: RefObject<HTMLElement | null>
  /** The rail's clipping box: the track only moves while it is inside the viewport. */
  viewport: RefObject<HTMLElement | null>
}

interface Marquee {
  /** The track's x offset in pixels, always within one period. */
  x: MotionValue<number>
  /** Hover or focus: ease the resting drift to a stop, or back once it ends. */
  setHalted: (halted: boolean) => void
}

// Rail px/s added per px/s of page scroll; scrolling up past the resting speed reverses it.
const SCROLL_GAIN = 0.12
const MAX_SPEED = 480
// Time constant of the velocity easing, so boosts and reversals blend in and fade out.
const VELOCITY_SMOOTHING = 0.5
// Time constant of the drift easing to a stop on hover and back when it ends.
const HALT_SMOOTHING = 0.5

/**
 * Endless horizontal rail driven frame by frame. It drifts left at rest; page scroll adds
 * its velocity, so scrolling down speeds it up and scrolling up turns it back for a moment.
 * Visibility and halting live in refs, so entering the viewport or passing under a resting
 * cursor while scrolling never re-renders the rail's cards.
 */
export function useMarquee({ enabled, duration, group, viewport }: MarqueeOptions): Marquee {
  const x = useMotionValue(0)
  const period = useRef(0)
  const velocity = useRef(0)
  const drift = useRef(1)
  const visible = useRef(false)
  const halted = useRef(false)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const setHalted = useCallback((value: boolean) => {
    halted.current = value
  }, [])

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      visible.current = false
    }
  }, [viewport])

  useEffect(() => {
    const element = group.current
    if (!element || !enabled) return
    const measure = () => {
      period.current = element.offsetWidth
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, group])

  useAnimationFrame((_, delta) => {
    const width = period.current
    if (!enabled || !visible.current || width <= 0 || duration <= 0) return
    // A long gap (background tab, dropped frames) must not fling the rail.
    const seconds = Math.min(delta, 100) / 1000
    // Halting eases only the resting drift; scrolling still pushes the rail.
    drift.current +=
      ((halted.current ? 0 : 1) - drift.current) * (1 - Math.exp(-seconds / HALT_SMOOTHING))
    const target = Math.max(
      -MAX_SPEED,
      Math.min(MAX_SPEED, (drift.current * width) / duration + scrollVelocity.get() * SCROLL_GAIN),
    )
    velocity.current += (target - velocity.current) * (1 - Math.exp(-seconds / VELOCITY_SMOOTHING))
    // Two identical groups: wrapping by one period is invisible.
    const next = (x.get() - velocity.current * seconds) % width
    x.set(next > 0 ? next - width : next)
  })

  return { x, setHalted }
}
