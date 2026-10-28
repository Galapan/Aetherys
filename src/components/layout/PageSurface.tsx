import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react'
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
  // Whether the open animation finished: the menu panel then covers the page completely, so
  // it stops painting (videos, marquees) until the menu starts closing.
  const [covered, setCovered] = useState(false)

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
        onAnimationComplete={() => setCovered(compact)}
        style={{
          ...createFixedPageStyle(snapshot),
          visibility: compact && covered ? 'hidden' : undefined,
        }}
      >
        <div>{children}</div>
      </m.div>
    </div>
  )
}

// No filter on the page: a blur paints past its rounded clip, so it would ring the card with a
// light halo that vanishes at once when the covered page stops painting.
function createPageAnimation(snapshot: PageSnapshot | null, gap: number, compact: boolean) {
  if (!compact || !snapshot) return { scaleX: 1, scaleY: 1 }
  return {
    scaleX: 1 - (gap * 2) / snapshot.width,
    scaleY: 1 - (gap * 2) / snapshot.height,
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
