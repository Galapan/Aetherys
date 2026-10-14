import { Component, lazy, Suspense, useCallback, useRef, useState, type ReactNode } from 'react'
import { m, useInView } from 'framer-motion'
import { heroMark } from '../../content/hero'
import type { NextStepContent } from '../../content/nextStep'

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

export function NextStepMark({ heading }: { heading: NextStepContent['heading'] }) {
  const container = useRef<HTMLDivElement>(null)
  const nearViewport = useInView(container, { once: true, margin: '100% 0px' })
  const [sceneReady, setSceneReady] = useState(false)
  const [showFallback, setShowFallback] = useState(true)
  const onReady = useCallback(() => setSceneReady(true), [])

  return (
    <div ref={container} className="relative aspect-[205/160] w-full" aria-hidden="true">
      {nearViewport ? (
        <>
          <m.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: sceneReady ? 1 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <SceneBoundary>
              <Suspense fallback={null}>
                <NextStepScene fallback={<Fallback />} heading={heading} onReady={onReady} />
              </Suspense>
            </SceneBoundary>
          </m.div>
          {showFallback && (
            <m.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: sceneReady ? 0 : 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onAnimationComplete={() => {
                if (sceneReady) setShowFallback(false)
              }}
            >
              <Fallback />
            </m.div>
          )}
        </>
      ) : (
        <Fallback />
      )}
    </div>
  )
}
