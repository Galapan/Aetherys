import type { ReactNode, RefObject } from 'react'
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
        <div style={createScrollOffset(snapshot)}>{children}</div>
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
        inset: 0,
        height: snapshot.height,
        minHeight: 0,
        overflow: 'hidden' as const,
      }
    : undefined
}

function createScrollOffset(snapshot: PageSnapshot | null) {
  return snapshot ? { transform: `translateY(-${snapshot.scrollY}px)` } : undefined
}
