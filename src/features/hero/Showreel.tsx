import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { m, useInView } from 'framer-motion'
import { useLenis } from 'lenis/react'
import type { HeroContent } from '@/content/hero'

interface ShowreelProps {
  content: HeroContent
  reducedMotion: boolean
  canHover: boolean
}

interface Frame {
  left: number
  top: number
  width: number
  height: number
}

function readFrame(element: HTMLElement): Frame {
  const { left, top, width, height } = element.getBoundingClientRect()
  return { left, top, width, height }
}

function playerFrame(): Frame {
  const width = Math.min(1120, window.innerWidth - 32, (window.innerHeight - 152) * (16 / 9))
  const height = width * (9 / 16)
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  }
}

export function Showreel({ content, reducedMotion, canHover }: ShowreelProps) {
  const trigger = useRef<HTMLButtonElement>(null)
  const preview = useRef<HTMLVideoElement>(null)
  const previewVisible = useInView(preview)
  const returnFocus = useRef(false)
  const [origin, setOrigin] = useState<Frame | null>(null)
  const previewPlaying = previewVisible && origin === null

  // Only decode the preview while it can be seen; the dialog plays the full video.
  useEffect(() => {
    const element = preview.current
    if (!element) return
    const syncPlayback = () => {
      if (!previewPlaying || document.hidden) element.pause()
      else void element.play().catch(() => {})
    }
    syncPlayback()
    document.addEventListener('visibilitychange', syncPlayback)
    return () => document.removeEventListener('visibilitychange', syncPlayback)
  }, [previewPlaying])

  useEffect(() => {
    if (origin === null && returnFocus.current) {
      returnFocus.current = false
      trigger.current?.focus({ preventScroll: true })
    }
  }, [origin])

  return (
    <>
      <m.button
        ref={trigger}
        type="button"
        className="pointer-events-auto absolute right-0 bottom-[calc(100%+16px)] w-[170px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-dark-gray)] p-0 text-[var(--color-warm-white)]"
        aria-label={content.showreel.open}
        aria-haspopup="dialog"
        aria-expanded={origin !== null}
        style={{ visibility: origin ? 'hidden' : 'visible' }}
        whileHover={canHover && !reducedMotion ? { y: -2 } : undefined}
        transition={{ duration: 0.18 }}
        onClick={() => {
          if (!trigger.current) return
          returnFocus.current = true
          setOrigin(readFrame(trigger.current))
        }}
      >
        <span
          className="relative grid aspect-video place-items-center overflow-hidden"
          aria-hidden="true"
        >
          <video
            ref={preview}
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover blur-[1px]"
            src={content.showreel.preview}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <span className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-graphite)_58%,transparent)]" />
          <span className="relative text-xs tracking-[0.08em] text-[var(--color-warm-white)]">
            {content.showreel.label.replace(/^\//, '')}
          </span>
        </span>
      </m.button>
      {origin &&
        createPortal(
          <ShowreelDialog
            content={content}
            reducedMotion={reducedMotion}
            origin={origin}
            returnFrame={() => (trigger.current ? readFrame(trigger.current) : origin)}
            onClosed={() => setOrigin(null)}
          />,
          document.body,
        )}
    </>
  )
}

interface DialogProps {
  content: HeroContent
  reducedMotion: boolean
  origin: Frame
  returnFrame: () => Frame
  onClosed: () => void
}

// Opening blurs the page first, then grows the player out of the trigger to the centre.
// Closing is the reverse: the player shrinks back onto the trigger with a slow start and a
// long settle, while the page clears early in the move instead of waiting for it to land.
const PLAYER_OPEN = { duration: 0.75, ease: [0.76, 0, 0.24, 1] } as const
const PLAYER_CLOSE = { duration: 0.95, ease: [0.8, 0, 0.15, 1] } as const
const SHADE_IN = { duration: 0.3, ease: 'easeOut' } as const
const SHADE_OUT = { duration: 0.4, delay: 0.05, ease: 'easeInOut' } as const

function ShowreelDialog({ content, reducedMotion, origin, returnFrame, onClosed }: DialogProps) {
  const lenis = useLenis()
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [target, setTarget] = useState(playerFrame)
  // Where the player shrinks back to once closing; null while the dialog is open.
  const [destination, setDestination] = useState<Frame | null>(null)
  const closing = destination !== null
  const [isPlaying, setIsPlaying] = useState(false)

  useLayoutEffect(() => {
    const element = dialog.current
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - root.clientWidth
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
    lenis?.stop()
    // Lock the root, not the body: once Lenis clips <html>, an overflowing body becomes its
    // own scroller and the sticky stage foot (the trigger's row) drops out of the viewport,
    // so the player would close towards an off-screen trigger.
    root.style.overflow = 'hidden'
    document.body.style.paddingRight = `${padding + scrollbar}px`
    element?.showModal()
    video.current?.focus({ preventScroll: true })
    return () => {
      element?.close()
      root.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      lenis?.start()
    }
  }, [lenis])

  useEffect(() => {
    const resize = () => setTarget(playerFrame())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function close() {
    if (closing) return
    setDestination(returnFrame())
    if (reducedMotion) onClosed()
  }

  function togglePlayback() {
    const player = video.current
    if (!player) return

    if (player.paused) {
      if (player.ended) player.currentTime = 0
      void player.play().catch(() => setIsPlaying(false))
    } else {
      player.pause()
    }
  }

  return (
    <dialog
      ref={dialog}
      className="pointer-events-auto fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-[var(--color-warm-white)] backdrop:bg-transparent"
      aria-labelledby="showreel-title"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <h2 id="showreel-title" className="sr-only">
        {content.brand} {content.showreel.label}
      </h2>
      <m.div
        className="pointer-events-auto absolute inset-0 bg-[color-mix(in_srgb,var(--color-graphite)_62%,transparent)]"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: closing ? 0 : 1, backdropFilter: closing ? 'blur(0px)' : 'blur(16px)' }}
        transition={reducedMotion ? { duration: 0 } : closing ? SHADE_OUT : SHADE_IN}
        onClick={close}
      />
      <m.div
        className="absolute rounded-lg bg-[var(--color-graphite)] shadow-[0_24px_100px_color-mix(in_srgb,var(--color-graphite)_65%,transparent)]"
        initial={{ ...(reducedMotion ? target : origin) }}
        animate={{ ...(destination ?? target) }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : closing
              ? PLAYER_CLOSE
              : // The player waits for the page to blur before it grows.
                { ...PLAYER_OPEN, delay: SHADE_IN.duration }
        }
        onAnimationComplete={() => {
          if (closing) onClosed()
        }}
      >
        <video
          ref={video}
          className="absolute inset-0 h-full w-full rounded-lg object-contain"
          src={content.showreel.video}
          aria-label={isPlaying ? content.showreel.pause : content.showreel.play}
          aria-pressed={isPlaying}
          role="button"
          tabIndex={0}
          autoPlay={!reducedMotion}
          playsInline
          preload="metadata"
          onClick={togglePlayback}
          onKeyDown={(event) => {
            if (event.code === 'Space' || event.key === 'Enter') {
              event.preventDefault()
              togglePlayback()
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(event) => {
            event.currentTarget.currentTime = 0
          }}
        />
      </m.div>
    </dialog>
  )
}
