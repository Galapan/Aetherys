import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

export interface PageSnapshot {
  scrollY: number
  height: number
  width: number
  documentHeight: number
  headerTop: number
  headerLeft: number
  headerRight: number
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
  const [expanded, setExpanded] = useState(false)
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const destination = useRef<string | null>(null)
  const restoreScroll = useRef(0)
  const reducedMotionRef = useRef(reducedMotion)
  const mounted = snapshot !== null

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  useLayoutEffect(() => {
    if (!mounted) return
    const modal = dialogRef.current
    const opener = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modal?.showModal()
    const resize = () =>
      setSnapshot(
        (previous) =>
          previous && {
            ...previous,
            width: document.documentElement.clientWidth,
            height: window.innerHeight,
          },
      )
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      modal?.close()
      document.body.style.overflow = previousOverflow
      window.scrollTo({ top: restoreScroll.current, behavior: 'instant' })
      const id = destination.current
      destination.current = null
      if (id) {
        const url = new URL(window.location.href)
        url.hash = id
        window.history.pushState(null, '', url)
        const target = document.getElementById(id)
        target?.focus({ preventScroll: true })
        target?.scrollIntoView({
          block: 'start',
          behavior: reducedMotionRef.current ? 'instant' : 'smooth',
        })
      } else opener?.focus({ preventScroll: true })
    }
  }, [mounted])

  function openMenu(header: HTMLElement | null, page: HTMLDivElement | null) {
    if (mounted) return
    const brand = header?.querySelector('.brand')?.getBoundingClientRect()
    const button = triggerRef.current?.getBoundingClientRect()
    restoreScroll.current = window.scrollY
    closing.current = false
    setSnapshot({
      scrollY: window.scrollY,
      width: document.documentElement.clientWidth,
      height: window.innerHeight,
      documentHeight: page?.offsetHeight ?? document.body.scrollHeight,
      headerTop: Math.max(18, brand?.top ?? 18),
      headerLeft: brand?.left ?? 20,
      headerRight:
        document.documentElement.clientWidth -
        (button?.right ?? document.documentElement.clientWidth - 20),
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
