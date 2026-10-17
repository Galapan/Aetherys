import { useEffect, useRef, type ReactNode } from 'react'
import { cancelFrame, frame, type FrameData } from 'framer-motion'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'

interface SmoothScrollProps {
  children: ReactNode
}

const options = {
  // Lenis advances inside Framer Motion's frame loop (see SmoothScroll), so scroll
  // position and scroll-linked animations share one rAF and one timestamp.
  autoRaf: false,
  lerp: 0.1,
  respectReducedMotion: true,
  syncTouch: false,
}

function SmoothAnchorNavigation() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    const instance = lenis

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return

      const clickedElement = event.target
      const anchor =
        clickedElement instanceof Element
          ? clickedElement.closest<HTMLAnchorElement>('a[href]')
          : null

      if (
        !anchor ||
        anchor.hasAttribute('data-skip-link') ||
        anchor.closest('dialog') ||
        anchor.hasAttribute('download') ||
        (anchor.target !== '' && anchor.target !== '_self')
      )
        return

      const destination = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      if (
        destination.origin !== current.origin ||
        destination.pathname !== current.pathname ||
        destination.search !== current.search ||
        !destination.hash
      )
        return

      let id: string
      try {
        id = decodeURIComponent(destination.hash.slice(1))
      } catch {
        return
      }

      const target = document.getElementById(id)
      if (!target) return

      event.preventDefault()
      if (destination.hash !== current.hash) {
        window.history.pushState(null, '', destination.href)
      }
      instance.scrollTo(target)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [lenis])

  return null
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update({ timestamp }: FrameData) {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  return (
    <ReactLenis root options={options} ref={lenisRef}>
      <SmoothAnchorNavigation />
      {children}
    </ReactLenis>
  )
}
