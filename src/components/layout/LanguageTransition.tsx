import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

interface LanguageTransitionProps {
  label: string
  reducedMotion: boolean
  onCovered: () => void
  onFinished: () => void
}

const curtainEase = [0.76, 0, 0.24, 1] as const

export function LanguageTransition({
  label,
  reducedMotion,
  onCovered,
  onFinished,
}: LanguageTransitionProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const callbacks = useRef({ onCovered, onFinished })
  const committed = useRef(false)
  const controls = useAnimationControls()
  // Keep the strip count stable during a resize in the middle of the wipe.
  const [columns] = useState(() => (window.matchMedia('(min-width: 768px)').matches ? 8 : 4))

  useLayoutEffect(() => {
    callbacks.current = { onCovered, onFinished }
  }, [onCovered, onFinished])

  useLayoutEffect(() => {
    const modal = dialog.current
    modal?.showModal()
    modal?.focus()
    return () => modal?.close()
  }, [])

  useEffect(() => {
    let cancelled = false
    function commit() {
      if (committed.current) return
      committed.current = true
      callbacks.current.onCovered()
    }
    function finish() {
      dialog.current?.close()
      callbacks.current.onFinished()
    }
    async function run() {
      try {
        if (reducedMotion) {
          commit()
          finish()
          return
        }
        await controls.start('covered')
        if (cancelled) return
        commit()
        await controls.start('revealed')
        if (!cancelled) finish()
      } catch {
        // An interrupted animation must never trap the visitor behind the curtain.
        if (!cancelled) {
          commit()
          finish()
        }
      }
    }
    void run()
    return () => {
      cancelled = true
      controls.stop()
    }
  }, [controls, reducedMotion])

  return (
    <dialog
      ref={dialog}
      className="language-transition"
      aria-label={label}
      aria-busy="true"
      tabIndex={-1}
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Tab') event.preventDefault()
      }}
    >
      <div
        className="language-transition-columns"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: columns }, (_, index) => (
          <motion.span
            key={index}
            custom={index}
            initial={{ y: '101%' }}
            animate={controls}
            variants={{
              covered: (column: number) => ({
                y: '0%',
                transition: { duration: 0.55, delay: column * 0.055, ease: curtainEase },
              }),
              revealed: (column: number) => ({
                y: '-101%',
                transition: { duration: 0.65, delay: column * 0.055, ease: curtainEase },
              }),
            }}
          />
        ))}
      </div>
    </dialog>
  )
}
