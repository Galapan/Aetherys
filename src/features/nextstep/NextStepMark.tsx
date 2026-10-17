import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { heroMark } from '@/content/hero'
import type { NextStepContent } from '@/content/nextStep'

const NextStepScene = lazy(() => import('./NextStepScene'))

function Fallback() {
  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="140 110 205 160"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `scale(${heroMark.scale})` }}
    >
      <path
        d={heroMark.path}
        fill="color-mix(in srgb, var(--color-warm-white) 55%, var(--color-graphite))"
        opacity="0.62"
      />
    </svg>
  )
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}

// Past the ~5.4s hero entrance, so the WebGL context and shader compile never
// compete with the intro or the first scroll from the hero.
const WARM_UP_DELAY_MS = 6000

/** Mounts the scene once the page is quiet after the intro, or when it nears the viewport. */
function useSceneReady() {
  const frame = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = frame.current
    if (!element || ready) return
    const markReady = () => setReady(true)
    let idle = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markReady()
      },
      { rootMargin: '150% 0px' },
    )
    observer.observe(element)
    const timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(markReady, { timeout: 2000 })
      } else {
        markReady()
      }
    }, WARM_UP_DELAY_MS)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [ready])

  return { frame, ready }
}

export function NextStepMark({ heading }: { heading: NextStepContent['heading'] }) {
  const { frame, ready } = useSceneReady()

  return (
    <div ref={frame} className="relative aspect-[205/160] w-full" aria-hidden="true">
      {ready ? (
        <SceneBoundary>
          <Suspense fallback={<Fallback />}>
            <NextStepScene fallback={<Fallback />} heading={heading} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <Fallback />
      )}
    </div>
  )
}
