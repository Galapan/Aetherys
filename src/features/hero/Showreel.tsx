import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { HeroContent } from '../../content/hero'

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
  const returnFocus = useRef(false)
  const [origin, setOrigin] = useState<Frame | null>(null)

  useEffect(() => {
    if (origin === null && returnFocus.current) {
      returnFocus.current = false
      trigger.current?.focus({ preventScroll: true })
    }
  }, [origin])

  return (
    <>
      <motion.button
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
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover blur-[1px]"
            src={content.showreel.video}
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
      </motion.button>
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

function ShowreelDialog({ content, reducedMotion, origin, returnFrame, onClosed }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [target, setTarget] = useState(playerFrame)
  const [closing, setClosing] = useState(false)
  const [destination, setDestination] = useState(origin)
  const [isPlaying, setIsPlaying] = useState(false)

  useLayoutEffect(() => {
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${padding + scrollbar}px`
    element?.showModal()
    element?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
    }
  }, [])

  useEffect(() => {
    const resize = () => setTarget(playerFrame())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function close() {
    if (closing) return
    setDestination(returnFrame())
    setClosing(true)
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
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <h2 id="showreel-title" className="sr-only">
        {content.brand} {content.showreel.label}
      </h2>
      <motion.div
        className="pointer-events-auto absolute inset-0 bg-[color-mix(in_srgb,var(--color-graphite)_62%,transparent)]"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: closing ? 0 : 1, backdropFilter: closing ? 'blur(0px)' : 'blur(16px)' }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        onClick={close}
      />
      <motion.div
        className="absolute rounded-lg bg-[var(--color-graphite)] shadow-[0_24px_100px_color-mix(in_srgb,var(--color-graphite)_65%,transparent)]"
        initial={{ ...(reducedMotion ? target : origin) }}
        animate={{ ...(closing ? destination : target) }}
        transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.76, 0, 0.24, 1] }}
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
        <motion.div
          className="absolute inset-x-0 bottom-[calc(100%+12px)] flex items-center justify-between gap-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
            delay: reducedMotion || closing ? 0 : 0.5,
          }}
        >
          <span>
            {content.brand}{' '}
            <span className="ml-2 text-[10px] tracking-[0.08em] text-[var(--color-secondary)] md:ml-4">
              {content.showreel.label}
            </span>
          </span>
          <button type="button" onClick={close} aria-label={content.close}>
            {content.close}
          </button>
        </motion.div>
      </motion.div>
    </dialog>
  )
}
