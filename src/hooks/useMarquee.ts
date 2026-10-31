import { useCallback, useEffect, useMemo, useRef, type PointerEvent, type RefObject } from 'react'
import { useAnimationFrame, useMotionValue, type MotionValue } from 'framer-motion'

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

// Time constant of the drift easing to a stop on hover and back when it ends.
const HALT_SMOOTHING = 0.5

/** Keeps an offset within one period, in (-period, 0]. */
function wrap(offset: number, period: number): number {
  const next = offset % period
  return next > 0 ? next - period : next
}

/**
 * Endless horizontal rail driven frame by frame. It drifts left at a constant speed, which
 * page scroll leaves untouched; a touch drag moves it by hand and the drift resumes on
 * release. Visibility and halting live in refs, so entering the viewport or passing under a resting
 * cursor while scrolling never re-renders the rail's cards.
 */
export function useMarquee({ enabled, duration, group, viewport }: MarqueeOptions): Marquee {
  const x = useMotionValue(0)
  const period = useRef(0)
  const drift = useRef(1)
  const visible = useRef(false)
  const halted = useRef(false)
  const drag = useRef<{ id: number; pointerX: number } | null>(null)
  const setHalted = useCallback((value: boolean) => {
    halted.current = value
  }, [])

  // Touch only: the finger moves the track directly, with no flick carried past release.
  // Mouse and pen keep the hover behaviour.
  const swipe = useMemo<Marquee['swipe']>(() => {
    const release = () => {
      drag.current = null
    }
    return {
      onPointerDown(event) {
        if (!enabled || event.pointerType !== 'touch' || drag.current) return
        drag.current = { id: event.pointerId, pointerX: event.clientX }
      },
      onPointerMove(event) {
        const current = drag.current
        const width = period.current
        if (!current || event.pointerId !== current.id || width <= 0) return
        x.set(wrap(x.get() + event.clientX - current.pointerX, width))
        current.pointerX = event.clientX
      },
      onPointerUp(event) {
        if (drag.current?.id === event.pointerId) release()
      },
      // The browser took the gesture as a vertical scroll.
      onPointerCancel: release,
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
    drift.current +=
      ((halted.current ? 0 : 1) - drift.current) * (1 - Math.exp(-seconds / HALT_SMOOTHING))
    // Two identical groups: wrapping by one period is invisible.
    x.set(wrap(x.get() - ((drift.current * width) / duration) * seconds, width))
  })

  return { x, setHalted, swipe }
}
