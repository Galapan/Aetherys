import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  animate,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type PanInfo,
} from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'

const CARD_GAP = 16

/**
 * Drag, keyboard and scrollbar state of the stacking team carousel. `offset` is how far the
 * track has scrolled and `step` one card plus its gap; both drive the card transforms.
 */
export function useStackCarousel(count: number, reducedMotion: boolean) {
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const panStart = useRef(0)
  const glide = useRef<AnimationPlaybackControls | null>(null)
  const offset = useMotionValue(0)
  const step = useMotionValue(0)
  const max = useMotionValue(0)
  const share = useMotionValue(1)
  const [thumbShare, setThumbShare] = useState(1)
  const [dragging, setDragging] = useState(false)
  const scrollable = thumbShare < 1
  const thumbLeft = useTransform(() => {
    const limit = max.get()
    return `${limit > 0 ? (offset.get() / limit) * (1 - share.get()) * 100 : 0}%`
  })

  useLayoutEffect(() => {
    const element = track.current
    if (!element) return
    function measure() {
      const card = element!.querySelector('li')
      if (!card) return
      const width = card.offsetWidth
      const visible = element!.clientWidth
      const total = (count - 1) * (width + CARD_GAP) + width
      const size = width + CARD_GAP
      // Round the end stop up to a card boundary, so the last position also has a card flush
      // with the left edge, as in the reference.
      const limit = Math.min(Math.ceil(Math.max(total - visible, 0) / size), count - 1) * size
      step.set(size)
      max.set(limit)
      offset.set(Math.min(offset.get(), limit))
      const nextShare = total > 0 ? Math.min(visible / total, 1) : 1
      share.set(nextShare)
      setThumbShare(nextShare)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [count, max, offset, share, step])

  useLayoutEffect(() => () => glide.current?.stop(), [])

  const clamp = (value: number) => Math.min(Math.max(value, 0), max.get())

  function glideTo(target: number) {
    glide.current?.stop()
    if (reducedMotion) offset.set(clamp(target))
    else
      glide.current = animate(offset, clamp(target), {
        type: 'tween',
        duration: 0.7,
        ease: REVEAL_EASE,
      })
  }

  function startPan() {
    glide.current?.stop()
    panStart.current = offset.get()
    setDragging(true)
  }

  function panCards(_: PointerEvent, info: PanInfo) {
    offset.set(clamp(panStart.current - info.offset.x))
  }

  /** Nearest card boundary, so a released carousel settles with a card on the left edge. */
  function snap(value: number) {
    const size = step.get()
    return size > 0 ? Math.round(value / size) * size : value
  }

  function releaseCards(_: PointerEvent, info: PanInfo) {
    setDragging(false)
    glideTo(snap(clamp(offset.get() - info.velocity.x * 0.25)))
  }

  function releaseThumb() {
    setDragging(false)
    glideTo(snap(offset.get()))
  }

  function panThumb(_: PointerEvent, info: PanInfo) {
    const range = (bar.current?.offsetWidth ?? 0) * (1 - thumbShare)
    if (range > 0) offset.set(clamp(panStart.current + (info.offset.x / range) * max.get()))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const size = step.get()
    const current = Math.round(offset.get() / size) * size
    const targets: Record<string, number> = {
      ArrowRight: current + size,
      ArrowLeft: current - size,
      Home: 0,
      End: max.get(),
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    glideTo(targets[event.key])
  }

  return {
    track,
    bar,
    offset,
    step,
    thumbLeft,
    thumbShare,
    scrollable,
    dragging,
    /** Keyboard always; dragging only while the cards overflow the track. */
    trackHandlers: scrollable
      ? { onKeyDown, onPanStart: startPan, onPan: panCards, onPanEnd: releaseCards }
      : { onKeyDown },
    thumbHandlers: { onPanStart: startPan, onPan: panThumb, onPanEnd: releaseThumb },
  }
}
