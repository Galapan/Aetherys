import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { heroMark, type HeroContent } from '../../content/hero'
import { ShowreelFilm } from './ShowreelFilm'
import './Showreel.css'

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
        className="showreel-trigger"
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
        <span className="showreel-trigger__art" aria-hidden="true">
          <img src={heroMark.fallback} alt="" />
          <span className="showreel-trigger__play">↗</span>
        </span>
        <span className="showreel-trigger__caption">
          <span>{content.showreel.label}</span>
          <span aria-hidden="true">00:20</span>
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
  const [ready, setReady] = useState(reducedMotion)
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
    element?.querySelector<HTMLElement>('.showreel-film')?.focus({ preventScroll: true })
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
    setReady(false)
    setDestination(returnFrame())
    setClosing(true)
    if (reducedMotion) onClosed()
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('[tabindex="0"]')
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <dialog
      ref={dialog}
      className="showreel-dialog"
      aria-labelledby="showreel-title"
      aria-describedby="showreel-description showreel-instructions"
      onKeyDown={containFocus}
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
      <p id="showreel-description" className="visually-hidden">
        {content.showreel.summary}
      </p>
      <p id="showreel-instructions" className="visually-hidden">
        {content.showreel.instructions}
      </p>
      <motion.div
        className="showreel-scrim"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: closing ? 0 : 1, backdropFilter: closing ? 'blur(0px)' : 'blur(16px)' }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      />
      <motion.div
        className="showreel-player"
        initial={{ ...(reducedMotion ? target : origin) }}
        animate={{ ...(closing ? destination : target) }}
        transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={() => (closing ? onClosed() : setReady(true))}
      >
        <motion.div
          className="showreel-player__heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
            delay: reducedMotion || closing ? 0 : 0.5,
          }}
        >
          <span>
            {content.brand} <span>{content.showreel.label}</span>
          </span>
        </motion.div>
        <ShowreelFilm content={content} active={ready && !closing} reducedMotion={reducedMotion} />
      </motion.div>
    </dialog>
  )
}
