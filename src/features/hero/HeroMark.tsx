import { Component, lazy, Suspense, type ReactNode } from 'react'
import { heroMark } from '../../content/hero'

const HeroScene = lazy(() => import('./HeroScene'))

function Fallback() {
  return (
    <img
      className="hero-mark-fallback"
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

export function HeroMark() {
  return (
    <div className="hero-mark" aria-hidden="true">
      <SceneBoundary>
        <Suspense fallback={<Fallback />}>
          <HeroScene fallback={<Fallback />} />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
