import { useEffect, useEffectEvent, useState } from 'react'
import { useLenis } from 'lenis/react'
import { isPageRoute, normalizePath, readPath } from '@/routes'

export interface PageDestination {
  href: string
  /** False when the browser already moved through history (back/forward). */
  push: boolean
  /** Scroll offset to restore once the destination page is rendered. */
  scrollY: number
}

interface PageTransitionOptions {
  /** Path of the page currently rendered. */
  path: string
  /** Another full-screen transition (the locale curtain) is running. */
  busy: boolean
  /** History moved within the same page (hash or locale entry): sync without a curtain. */
  onSamePage: () => void
}

function readSavedScroll(state: unknown): number {
  if (state && typeof state === 'object' && 'scrollY' in state) {
    const { scrollY } = state as { scrollY: unknown }
    if (typeof scrollY === 'number') return scrollY
  }
  return 0
}

/**
 * Turns in-app page links and back/forward into curtain transitions. The page only
 * changes once the curtain covers the screen (see Navbar).
 */
export function usePageTransition({ path, busy, onSamePage }: PageTransitionOptions) {
  const lenis = useLenis()
  const [pending, setPending] = useState<PageDestination | null>(null)

  const handleClick = useEffectEvent((event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return

    const clicked = event.target
    const anchor = clicked instanceof Element ? clicked.closest<HTMLAnchorElement>('a[href]') : null
    if (
      !anchor ||
      anchor.hasAttribute('download') ||
      (anchor.target !== '' && anchor.target !== '_self')
    )
      return

    const destination = new URL(anchor.href, window.location.href)
    if (destination.origin !== window.location.origin) return
    const to = normalizePath(destination.pathname)
    if (!isPageRoute(to)) return

    if (to === path) {
      // Hash links on the same page belong to SmoothAnchorNavigation and the menu.
      if (destination.hash || destination.search !== window.location.search) return
      // A link to the page already shown scrolls to its top instead of reloading.
      event.preventDefault()
      if (lenis) lenis.scrollTo(0)
      else window.scrollTo({ top: 0 })
      return
    }

    event.preventDefault()
    if (busy || pending) return
    // Remember where this page was left, so back restores it.
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '')
    setPending({ href: destination.href, push: true, scrollY: 0 })
  })

  const handlePopState = useEffectEvent((event: PopStateEvent) => {
    if (readPath() === path && !pending) {
      onSamePage()
      return
    }
    setPending({
      href: window.location.href,
      push: false,
      scrollY: readSavedScroll(event.state),
    })
  })

  useEffect(() => {
    const click = (event: MouseEvent) => handleClick(event)
    const popState = (event: PopStateEvent) => handlePopState(event)
    document.addEventListener('click', click)
    window.addEventListener('popstate', popState)
    return () => {
      document.removeEventListener('click', click)
      window.removeEventListener('popstate', popState)
    }
  }, [])

  return { pendingPage: pending, finishPage: () => setPending(null) }
}
