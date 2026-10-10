import { useLayoutEffect, type ReactNode, type RefObject } from 'react'
import { m } from 'framer-motion'
import type { PageSnapshot } from './useMenuScene'
import type { SceneTransition } from './menuMotion'

interface PageSurfaceProps {
  ref: RefObject<HTMLDivElement | null>
  snapshot: PageSnapshot | null
  gap: number
  compact: boolean
  sceneTransition: SceneTransition
  children: ReactNode
}

export function PageSurface({
  ref: pageRef,
  snapshot,
  gap,
  compact,
  sceneTransition,
  children,
}: PageSurfaceProps) {
  useLayoutEffect(() => {
    // Scroll the frozen viewport itself so sticky children retain their viewport position.
    if (pageRef.current) pageRef.current.scrollTop = snapshot?.scrollY ?? 0
  }, [pageRef, snapshot?.scrollY, snapshot?.width, snapshot?.height])

  return (
    <div style={{ height: snapshot?.documentHeight }}>
      <m.div
        ref={pageRef}
        className={`bg-graphite relative isolate min-h-svh origin-center ${snapshot ? 'rounded will-change-transform' : ''}`}
        initial={false}
        animate={createPageAnimation(snapshot, gap, compact)}
        transition={sceneTransition}
        style={createFixedPageStyle(snapshot)}
      >
        <div>{children}</div>
      </m.div>
    </div>
  )
}

function createPageAnimation(snapshot: PageSnapshot | null, gap: number, compact: boolean) {
  return {
    scaleX: compact && snapshot ? 1 - (gap * 2) / snapshot.width : 1,
    scaleY: compact && snapshot ? 1 - (gap * 2) / snapshot.height : 1,
  }
}

function createFixedPageStyle(snapshot: PageSnapshot | null) {
  return snapshot
    ? {
        position: 'fixed' as const,
        top: 0,
        left: snapshot.pageLeft,
        width: snapshot.width,
        height: snapshot.height,
        minHeight: 0,
        overflow: 'hidden' as const,
      }
    : undefined
}
