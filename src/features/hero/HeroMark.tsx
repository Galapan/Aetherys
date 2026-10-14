import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { heroMark } from '../../content/hero'

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

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}

export function HeroMark({ entering }: { entering: boolean }) {
  const [sceneReady, setSceneReady] = useState(false)
  const [showFallback, setShowFallback] = useState(true)
  const onReady = useCallback(() => setSceneReady(true), [])

  return (
    <div className="relative aspect-square max-h-[48svh] w-full" aria-hidden="true">
      {entering ? (
        <Fallback />
      ) : (
        <>
          <m.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: sceneReady ? 1 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <SceneBoundary>
              <Suspense fallback={null}>
                <HeroScene fallback={<Fallback />} onReady={onReady} />
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
      )}
    </div>
  )
}
