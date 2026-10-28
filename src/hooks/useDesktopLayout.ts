import { useSyncExternalStore } from 'react'

// Tablet and up (AGENTS.md §6 breakpoints), read dynamically like useMotionPreferences.
const desktopQuery = '(min-width: 768px)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(desktopQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function readDesktop() {
  return window.matchMedia(desktopQuery).matches
}

export function useDesktopLayout() {
  return useSyncExternalStore(subscribe, readDesktop)
}
