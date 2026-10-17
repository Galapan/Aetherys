import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { domMax, LazyMotion, MotionConfig } from 'framer-motion'
import { SmoothScroll } from './components/layout/SmoothScroll'
import './index.css'
import App from './App.tsx'

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
