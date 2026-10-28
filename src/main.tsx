import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { domMax, LazyMotion, MotionConfig } from 'framer-motion'
import { SmoothScroll } from './components/layout/SmoothScroll'
import './index.css'
import App from './App.tsx'

// Last input modality, for the focus ring. The menu and page transitions move focus by script
// after a click or tap, and browsers then paint the keyboard ring; index.css hides it until a
// key is pressed again, so keyboard users keep it.
const root = document.documentElement
window.addEventListener('pointerdown', () => (root.dataset.input = 'pointer'), {
  capture: true,
  passive: true,
})
window.addEventListener('keydown', () => (root.dataset.input = 'keyboard'), { capture: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domMax} strict>
      {/* Safety net: Motion skips transform/layout animation when the OS asks for reduced
          motion. Components still read the live preference via useMotionPreferences. */}
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <App />
        </SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
