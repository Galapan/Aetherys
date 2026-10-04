import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { heroMark, type HeroContent } from '../../content/hero'

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
          className="relative grid h-[72px] place-items-center bg-[linear-gradient(130deg,var(--color-graphite),var(--color-burgundy))]"
          aria-hidden="true"
        >
          <img className="h-12 w-[60px]" src={heroMark.fallback} alt="" />
          <span className="absolute right-3 bottom-2 text-[22px]">↗</span>
        </span>
        <span className="flex justify-between gap-3 p-2.5 text-[10px] tracking-[0.05em]">
          <span>{content.showreel.label}</span>
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
  const [target, setTarget] = useState(playerFrame)
  const [closing, setClosing] = useState(false)
  const [destination, setDestination] = useState(origin)

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
      <h2 id="showreel-title" className="visually-hidden">
        {content.brand} {content.showreel.label}
      </h2>
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--color-graphite)_62%,transparent)]"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: closing ? 0 : 1, backdropFilter: closing ? 'blur(0px)' : 'blur(16px)' }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
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
