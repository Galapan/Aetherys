import { useEffect, useRef, type RefObject } from 'react'
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
  /** The rail is inside the viewport. */
  visible: boolean
  /** Hover or focus: ease the resting drift to a stop. */
  halted: boolean
  /** Seconds for the track to travel one period at rest. */
  duration: number
  /** First of the two identical groups in the track; its width is one period. */
  group: RefObject<HTMLElement | null>
}

// Rail px/s added per px/s of page scroll; scrolling up past the resting speed reverses it.
const SCROLL_GAIN = 0.4
const MAX_SPEED = 1600
// Time constant of the velocity easing, so boosts and reversals blend in and fade out.
const VELOCITY_SMOOTHING = 0.35
// Time constant of the drift easing to a stop on hover and back when it ends.
const HALT_SMOOTHING = 0.5

/**
 * Endless horizontal rail driven frame by frame. It drifts left at rest; page scroll adds
 * its velocity, so scrolling down speeds it up and scrolling up turns it back for a moment.
 * Returns the track's x offset in pixels, always within one period. */
export function useMarquee({
  enabled,
  visible,
  halted,
  duration,
  group,
}: MarqueeOptions): MotionValue<number> {
  const x = useMotionValue(0)
  const period = useRef(0)
  const velocity = useRef(0)
  const drift = useRef(1)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)

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
    if (!enabled || !visible || width <= 0 || duration <= 0) return
    // A long gap (background tab, dropped frames) must not fling the rail.
    const seconds = Math.min(delta, 100) / 1000
    // Halting eases only the resting drift; scrolling still pushes the rail.
    drift.current += ((halted ? 0 : 1) - drift.current) * (1 - Math.exp(-seconds / HALT_SMOOTHING))
    const target = Math.max(
      -MAX_SPEED,
      Math.min(MAX_SPEED, (drift.current * width) / duration + scrollVelocity.get() * SCROLL_GAIN),
    )
    velocity.current += (target - velocity.current) * (1 - Math.exp(-seconds / VELOCITY_SMOOTHING))
    // Two identical groups: wrapping by one period is invisible.
    const next = (x.get() - velocity.current * seconds) % width
    x.set(next > 0 ? next - width : next)
  })

  return x
}
