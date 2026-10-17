import { useEffect, useEffectEvent, useRef, useSyncExternalStore, type RefObject } from 'react'
import { animate, type AnimationPlaybackControls } from 'framer-motion'

interface MarqueeOptions {
  /** False under reduced motion or when the rail renders as a static grid. */
  enabled: boolean
  /** The rail is inside the viewport. */
  visible: boolean
  /** Hover or focus: ease the rail to a stop. */
  halted: boolean
  /** Seconds for the track to travel one period. */
  duration: number
}

// Exponential approach with a 0.5s time constant, normalised to land exactly at the end of
// its 1.5s, like the per-frame smoothing the rails used before.
const settle = (progress: number) => (1 - Math.exp(-3 * progress)) / (1 - Math.exp(-3))

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function readVisibility() {
  return !document.hidden
}

/**
 * Endless horizontal rail. The track holds two identical groups, so one period is exactly
 * -50% of its width; the loop runs as a compositor animation, off the main thread. */
export function useMarquee<T extends HTMLElement>({
  enabled,
  visible,
  halted,
  duration,
}: MarqueeOptions): RefObject<T | null> {
  const track = useRef<T>(null)
  const loop = useRef<AnimationPlaybackControls | null>(null)
  const phase = useRef(0)
  const speed = useRef(1)
  const pageVisible = useSyncExternalStore(subscribeVisibility, readVisibility)
  const running = visible && pageVisible
  const isRunning = useEffectEvent(() => running)

  useEffect(() => {
    const element = track.current
    if (!element || !enabled || duration <= 0) return
    const controls = animate(
      element,
      { transform: ['translateX(0%)', 'translateX(-50%)'] },
      { duration, ease: 'linear', repeat: Infinity },
    )
    // A new period length keeps the rail where it was instead of jumping back to the start.
    controls.time = phase.current * duration
    controls.speed = speed.current
    if (!isRunning()) controls.pause()
    loop.current = controls
    return () => {
      phase.current = (controls.time % duration) / duration
      loop.current = null
      controls.stop()
      element.style.transform = ''
    }
  }, [duration, enabled])

  useEffect(() => {
    if (running) loop.current?.play()
    else loop.current?.pause()
  }, [running])

  useEffect(() => {
    const target = halted ? 0 : 1
    if (speed.current === target) return
    const tween = animate(speed.current, target, {
      duration: 1.5,
      ease: settle,
      onUpdate: (value) => {
        speed.current = value
        if (loop.current) loop.current.speed = value
      },
    })
    return () => tween.stop()
  }, [halted])

  return track
}
