import { useEffect, type ReactNode } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'

interface SmoothScrollProps {
  children: ReactNode
}

const options = {
  autoRaf: true,
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
  return (
    <ReactLenis root options={options}>
      <SmoothAnchorNavigation />
      {children}
    </ReactLenis>
  )
}
