import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useLenis } from 'lenis/react'

export interface PageSnapshot {
  scrollY: number
  height: number
  width: number
  pageLeft: number
  scrollbarWidth: number
  documentHeight: number
  headerTop: number
  headerLeft: number
  headerRight: number
  headerColor: string
  menuColor: string
  triggerOffsetY: number
}

interface MenuScene {
  snapshot: PageSnapshot | null
  expanded: boolean
  mounted: boolean
  dialogRef: RefObject<HTMLDialogElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  openMenu: (header: HTMLElement | null, page: HTMLDivElement | null) => void
  closeMenu: (id?: string) => void
  resetScene: () => void
  onAnimationComplete: () => void
}

export function useMenuScene(reducedMotion: boolean): MenuScene {
  const lenis = useLenis()
  const [expanded, setExpanded] = useState(false)
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const destination = useRef<string | null>(null)
  const restoreScroll = useRef(0)
  const reducedMotionRef = useRef(reducedMotion)
  const source = useRef<{ header: HTMLElement | null; page: HTMLDivElement | null } | null>(null)
  const mounted = snapshot !== null

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  useLayoutEffect(() => {
    if (!mounted) return
    const modal = dialogRef.current
    const opener = triggerRef.current
    const previousOverflow = document.body.style.overflow
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    modal?.showModal()
    const resize = () => {
      setSnapshot(
        (previous) =>
          previous && {
            ...previous,
            width: window.innerWidth - previous.scrollbarWidth - previous.pageLeft,
            height: window.innerHeight,
          },
      )
    }
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      modal?.close()
      document.body.style.overflow = previousOverflow
      if (lenis) {
        lenis.start()
        lenis.scrollTo(restoreScroll.current, { immediate: true })
      } else {
        window.scrollTo({ top: restoreScroll.current, behavior: 'instant' })
      }
      const id = destination.current
      destination.current = null
      if (id) {
        const url = new URL(window.location.href)
        url.hash = id
        window.history.pushState(null, '', url)
        const target = document.getElementById(id)
        const needsTabIndex = target && !target.hasAttribute('tabindex')
        if (needsTabIndex) target.setAttribute('tabindex', '-1')
        target?.focus({ preventScroll: true })
        if (needsTabIndex) target.removeAttribute('tabindex')
        if (target && lenis) {
          lenis.scrollTo(target, { immediate: reducedMotionRef.current })
        } else {
          target?.scrollIntoView({
            block: 'start',
            behavior: reducedMotionRef.current ? 'instant' : 'smooth',
          })
        }
      } else opener?.focus({ preventScroll: true })
    }
  }, [mounted, lenis])

  useLayoutEffect(() => {
    if (!mounted) return
    const content = source.current?.page?.firstElementChild
    if (!(content instanceof HTMLElement)) return
    const documentHeight = content.offsetHeight
    const page = source.current?.page
    const pageRect = page?.getBoundingClientRect()
    const brand = source.current?.header?.querySelector('.brand')?.getBoundingClientRect()
    const button = triggerRef.current?.getBoundingClientRect()
    setSnapshot((previous) => {
      if (!previous || !pageRect || !page || !brand || !button) return previous
      const scaleX = pageRect.width / parseFloat(page.style.width)
      const scaleY = pageRect.height / parseFloat(page.style.height)
      const headerLeft = (brand.left - pageRect.left) / scaleX
      const headerRight = previous.width - (button.right - pageRect.left) / scaleX
      const headerTop = (brand.top - pageRect.top) / scaleY
      if (
        previous.documentHeight === documentHeight &&
        Math.abs(previous.headerLeft - headerLeft) < 0.01 &&
        Math.abs(previous.headerRight - headerRight) < 0.01 &&
        Math.abs(previous.headerTop - headerTop) < 0.01
      )
        return previous
      return { ...previous, documentHeight, headerLeft, headerRight, headerTop }
    })
  }, [mounted, snapshot?.width, snapshot?.height])

  function openMenu(header: HTMLElement | null, page: HTMLDivElement | null) {
    if (mounted) return
    const brand = header?.querySelector('.brand')?.getBoundingClientRect()
    const button = triggerRef.current?.getBoundingClientRect()
    const pageRect = page?.getBoundingClientRect()
    const pageLeft = pageRect?.left ?? 0
    const width = pageRect?.width ?? document.documentElement.clientWidth
    source.current = { header, page }
    restoreScroll.current = window.scrollY
    closing.current = false
    setSnapshot({
      scrollY: window.scrollY,
      width,
      pageLeft,
      scrollbarWidth: window.innerWidth - width - pageLeft,
      height: window.innerHeight,
      documentHeight: page?.offsetHeight ?? document.body.scrollHeight,
      headerTop: brand?.top ?? 18,
      headerLeft: (brand?.left ?? pageLeft + 20) - pageLeft,
      headerRight: pageLeft + width - (button?.right ?? pageLeft + width - 20),
      headerColor: header ? getComputedStyle(header).color : 'var(--color-warm-white)',
      menuColor: dialogRef.current
        ? getComputedStyle(dialogRef.current).color
        : getComputedStyle(document.documentElement).getPropertyValue('--color-graphite').trim(),
      triggerOffsetY: button && brand ? button.top - brand.top : 0,
    })
    setExpanded(true)
  }

  function closeMenu(id?: string) {
    if (closing.current) return
    closing.current = true
    destination.current = id ?? null
    setExpanded(false)
    if (reducedMotion) setSnapshot(null)
  }

  function resetScene() {
    closing.current = false
    setExpanded(false)
    setSnapshot(null)
  }

  function onAnimationComplete() {
    if (closing.current) setSnapshot(null)
  }

  return {
    snapshot,
    expanded,
    mounted,
    dialogRef,
    triggerRef,
    openMenu,
    closeMenu,
    resetScene,
    onAnimationComplete,
  }
}
