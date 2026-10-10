import { Component, lazy, Suspense, type ReactNode } from 'react'
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
  return (
    <div className="relative aspect-[205/160] w-full" aria-hidden="true">
      <SceneBoundary>
        <Suspense fallback={<Fallback />}>
          <NextStepScene fallback={<Fallback />} heading={heading} />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
