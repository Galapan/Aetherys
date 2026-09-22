import { useSyncExternalStore } from 'react'

const reducedQuery = '(prefers-reduced-motion: reduce)'
const hoverQuery = '(hover: hover) and (pointer: fine)'

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(reducedQuery), window.matchMedia(hoverQuery)]
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

function readReducedMotion() {
  return window.matchMedia(reducedQuery).matches
}

function readHover() {
  return window.matchMedia(hoverQuery).matches
}

export function useMotionPreferences() {
  return {
    reducedMotion: useSyncExternalStore(subscribe, readReducedMotion),
    canHover: useSyncExternalStore(subscribe, readHover),
  }
}
