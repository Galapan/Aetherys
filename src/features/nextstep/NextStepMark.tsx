import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
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
      // Multiplied like tinted glass, so the words behind stay dark instead of washed out.
      className="h-full w-full overflow-visible mix-blend-multiply"
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

// The static mark lives outside the boundary, so a failed scene only needs to report it.
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

// The single-pass glass compiles one small program, in parallel where the browser supports
// KHR_parallel_shader_compile, and no longer stalls the page. So it mounts at the first idle
// moment instead of waiting for a pause in scrolling, which left the static mark showing on
// arrival at the end of a long page.
const IDLE_TIMEOUT_MS = 1000

/**
 * Mounts the scene once its chunk has loaded and the main thread is idle: right after load,
 * or after the hero intro on the page that plays one, so it never competes with it.
 */
function useSceneReady(deferred: boolean) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready || deferred) return
    let active = true
    let idle = 0
    const markReady = () => {
      if (active) setReady(true)
    }
    const scheduleIdle = () => {
      if (!active) return
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(markReady, { timeout: IDLE_TIMEOUT_MS })
      } else {
        markReady()
      }
    }
    // A failed chunk still mounts, so the boundary reports it and the static mark stays.
    loadScene().then(scheduleIdle, markReady)
    return () => {
      active = false
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [deferred, ready])

  return ready
}

interface NextStepMarkProps {
  heading: NextStepContent['heading']
  /** Holds the scene back while the hero intro plays. */
  deferred?: boolean
}

export function NextStepMark({ heading, deferred = false }: NextStepMarkProps) {
  const ready = useSceneReady(deferred)
  // The canvas stays blank while the chunk loads and the shaders compile, and again after a
  // lost context; the static mark covers it until the glass has actually been drawn.
  const [drawn, setDrawn] = useState(false)
  const hide = useCallback(() => setDrawn(false), [])

  return (
    <div className="relative aspect-[205/160] w-full" aria-hidden="true">
      {ready && (
        <SceneBoundary onError={hide}>
          <Suspense fallback={null}>
            <NextStepScene heading={heading} onDrawn={setDrawn} />
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
