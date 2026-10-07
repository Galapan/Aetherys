import type { ReactNode, RefObject } from 'react'
import { m } from 'framer-motion'
import type { PageSnapshot } from './useMenuScene'
import type { SceneTransition } from './menuMotion'

interface PageSurfaceProps {
  ref: RefObject<HTMLDivElement | null>
  snapshot: PageSnapshot | null
  gap: number
  compact: boolean
  expanded: boolean
  reducedMotion: boolean
  hasPendingLocale: boolean
  sceneTransition: SceneTransition
  onAnimationComplete: () => void
  children: ReactNode
}

export function PageSurface({
  ref: pageRef,
  snapshot,
  gap,
  compact,
  expanded,
  reducedMotion,
  hasPendingLocale,
  sceneTransition,
  onAnimationComplete,
  children,
}: PageSurfaceProps) {
  return (
    <div style={{ height: snapshot?.documentHeight }}>
      <m.div
        ref={pageRef}
        className="bg-graphite relative isolate min-h-svh origin-center"
        initial={false}
        animate={createPageAnimation(snapshot, gap, compact, expanded)}
        transition={{
          ...sceneTransition,
          filter: {
            duration: reducedMotion || hasPendingLocale ? 0 : 0.2,
            delay: 0,
            ease: [0.42, 0, 0.58, 1],
          },
        }}
        onAnimationComplete={onAnimationComplete}
        style={createFixedPageStyle(snapshot)}
      >
        <div style={createScrollOffset(snapshot)}>{children}</div>
      </m.div>
    </div>
  )
}

function createPageAnimation(
  snapshot: PageSnapshot | null,
  gap: number,
  compact: boolean,
  expanded: boolean,
) {
  return {
    scaleX: compact && snapshot ? 1 - (gap * 2) / snapshot.width : 1,
    scaleY: compact && snapshot ? 1 - (gap * 2) / snapshot.height : 1,
    borderRadius: compact ? 4 : 0,
    filter: expanded ? 'blur(20px)' : 'blur(0px)',
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
