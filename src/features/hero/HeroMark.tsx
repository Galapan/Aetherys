import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { heroMark } from '@/content/hero'

const HeroScene = lazy(() => import('./HeroScene'))

function Fallback() {
  return (
    <img
      className="h-full w-full object-contain p-[12%]"
      src={heroMark.fallback}
      alt=""
      style={{ transform: `scale(${heroMark.scale})` }}
    />
  )
}

// The static mark lives outside the boundary, so a failed scene only has to vanish.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

interface HeroMarkProps {
  /** Holds the scene back, so its mount and shader link wait for the intro to end. */
  deferred?: boolean
  onDrawn?: () => void
}

export function HeroMark({ deferred = false, onDrawn }: HeroMarkProps) {
  // The canvas stays blank while the chunk loads and the shaders compile, and after a lost
  // context; the static mark covers it until the glass has actually been drawn.
  const [drawn, setDrawn] = useState(false)
  const handleDrawn = useCallback(
    (value: boolean) => {
      setDrawn(value)
      if (value) onDrawn?.()
    },
    [onDrawn],
  )

  return (
    <div className="relative aspect-square max-h-[48svh] w-full" aria-hidden="true">
      {!deferred && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene onDrawn={handleDrawn} />
          </Suspense>
        </SceneBoundary>
      )}
      {!drawn && (
        <div className="absolute inset-0">
          <Fallback />
        </div>
      )}
    </div>
  )
}
