import { useCallback, useEffect, useMemo, useRef, type PointerEvent, type RefObject } from 'react'
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
  /** Touch drag handlers for the rail, which also needs `touch-action: pan-y`. */
  swipe: {
    onPointerDown: (event: PointerEvent) => void
    onPointerMove: (event: PointerEvent) => void
    onPointerUp: (event: PointerEvent) => void
    onPointerCancel: () => void
  }
}

// Rail px/s added per px/s of page scroll; scrolling up past the resting speed reverses it.
const SCROLL_GAIN = 0.12
const MAX_SPEED = 480
// Time constant of the velocity easing, so boosts and reversals blend in and fade out.
const VELOCITY_SMOOTHING = 0.5
// Time constant of the drift easing to a stop on hover and back when it ends.
const HALT_SMOOTHING = 0.5
// Cap on a released flick's speed; the velocity easing then settles it back into the drift.
const FLICK_SPEED = 2000
// A finger resting longer than this before lifting counts as stopped.
const STILL_MS = 100

/** Keeps an offset within one period, in (-period, 0]. */
function wrap(offset: number, period: number): number {
  const next = offset % period
  return next > 0 ? next - period : next
}

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
  const drag = useRef<{ id: number; pointerX: number; time: number; speed: number } | null>(null)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const setHalted = useCallback((value: boolean) => {
    halted.current = value
  }, [])

  // Touch only: the finger moves the track directly and its release speed carries on as
  // the rail's velocity. Mouse and pen keep the hover behaviour.
  const swipe = useMemo<Marquee['swipe']>(() => {
    const release = (speed: number) => {
      if (!drag.current) return
      drag.current = null
      velocity.current = Math.max(-FLICK_SPEED, Math.min(FLICK_SPEED, speed))
    }
    return {
      onPointerDown(event) {
        if (!enabled || event.pointerType !== 'touch' || drag.current) return
        drag.current = {
          id: event.pointerId,
          pointerX: event.clientX,
          time: event.timeStamp,
          speed: 0,
        }
      },
      onPointerMove(event) {
        const current = drag.current
        const width = period.current
        if (!current || event.pointerId !== current.id || width <= 0) return
        const dx = event.clientX - current.pointerX
        const elapsed = event.timeStamp - current.time
        x.set(wrap(x.get() + dx, width))
        // Rail velocity runs opposite to the finger: a leftward swipe is a positive speed.
        if (elapsed > 0) current.speed = (-dx / elapsed) * 1000
        current.pointerX = event.clientX
        current.time = event.timeStamp
      },
      onPointerUp(event) {
        const current = drag.current
        if (current?.id !== event.pointerId) return
        // A finger that stopped before lifting releases without a flick.
        release(event.timeStamp - current.time > STILL_MS ? 0 : current.speed)
      },
      // The browser took the gesture as a vertical scroll.
      onPointerCancel() {
        release(0)
      },
    }
  }, [enabled, x])

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
    if (!enabled || !visible.current || drag.current || width <= 0 || duration <= 0) return
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
    x.set(wrap(x.get() - velocity.current * seconds, width))
  })

  return { x, setHalted, swipe }
}
