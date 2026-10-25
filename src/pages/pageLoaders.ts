import { useEffect } from 'react'

// The home page ships in the entry chunk; the other pages load on demand.
export const pageLoaders = {
  projects: () => import('@/pages/ProjectsPage'),
  project: () => import('@/pages/ProjectDetailPage'),
  contact: () => import('@/pages/ContactPage'),
  about: () => import('@/pages/AboutPage'),
}

function preloadPages() {
  for (const load of Object.values(pageLoaders)) load().catch(() => {})
}

/** Fetches every page chunk once the browser is idle, so a page change never waits on them. */
export function usePagePreload() {
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preloadPages, { timeout: 5000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(preloadPages, 3000)
    return () => window.clearTimeout(id)
  }, [])
}
