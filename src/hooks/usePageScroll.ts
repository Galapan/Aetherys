import { useLayoutEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'

export interface ScrollTarget {
  /** Offset used when the hash names no element on the new page. */
  y: number
  hash: string
}

/**
 * Document offset from layout boxes. Unlike getBoundingClientRect it ignores
 * transforms, such as the page scale left by the menu while the curtain covers it.
 */
function layoutOffsetTop(element: HTMLElement): number {
  let top = 0
  for (let node: Element | null = element; node instanceof HTMLElement; node = node.offsetParent) {
    top += node.offsetTop
  }
  return top - (Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0)
}

function findAnchor(hash: string): HTMLElement | null {
  if (!hash) return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

/**
 * Places the new page at its destination before the curtain lifts. Returns the function that
 * queues a destination for the next page change.
 */
export function usePageScroll(path: string) {
  const lenis = useLenis()
  const pending = useRef<ScrollTarget | null>(null)

  useLayoutEffect(() => {
    const target = pending.current
    if (!target) return
    pending.current = null
    const anchor = findAnchor(target.hash)
    const top = anchor ? layoutOffsetTop(anchor) : target.y
    if (lenis) {
      // The previous page had another height; refresh Lenis' limit first.
      lenis.resize()
      lenis.scrollTo(top, { immediate: true, force: true })
    } else window.scrollTo({ top, behavior: 'instant' })
  }, [path, lenis])

  return (target: ScrollTarget) => {
    pending.current = target
  }
}
