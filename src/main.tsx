import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { domMax, LazyMotion } from 'framer-motion'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domMax} strict>
      <App />
    </LazyMotion>
  </StrictMode>,
)
