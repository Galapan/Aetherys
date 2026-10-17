import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { heroMark } from '@/content/hero'
import type { NextStepContent } from '@/content/nextStep'

const loadScene = () => import('./NextStepScene')
const NextStepScene = lazy(loadScene)

// Share of the canvas width the scene gives the viewBox (fov 35 at z 5), so the fallback
// matches the 3D mark's size and the swap does not jump.
const SCENE_VIEW_FRACTION = 0.609

function Fallback() {
  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="140 110 205 160"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `scale(${heroMark.scale * SCENE_VIEW_FRACTION})` }}
    >
      <path
        d={heroMark.path}
        fill="color-mix(in srgb, var(--color-warm-white) 86%, var(--color-graphite))"
        opacity="0.8"
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
// compete with the intro.
const WARM_UP_DELAY_MS = 6000
// Creating the context and compiling the glass shaders blocks the main thread and cannot be
// interrupted, so it waits for a pause in scrolling instead of landing mid-gesture.
const SCROLL_QUIET_MS = 1200

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
    let quiet = 0
    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(markReady, { timeout: 2000 })
      } else {
        markReady()
      }
    }
    // Every scroll restarts the quiet window and drops a pending idle mount.
    const onScroll = () => {
      window.clearTimeout(quiet)
      if (idle) {
        window.cancelIdleCallback(idle)
        idle = 0
      }
      quiet = window.setTimeout(scheduleIdle, SCROLL_QUIET_MS)
    }
    const timer = window.setTimeout(() => {
      // Fetch the chunk now, so the mount itself is not delayed into the next scroll.
      void loadScene()
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }, WARM_UP_DELAY_MS)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      window.clearTimeout(quiet)
      window.removeEventListener('scroll', onScroll)
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
