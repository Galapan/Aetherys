import type { Locale } from './content/hero'

// Single source of truth for page URLs. Static files live under /media/ so no
// folder in public/ can shadow a page route in production.
export const routes = {
  home: '/',
  projects: '/proyectos',
} as const

export type Route = { kind: 'home' } | { kind: 'projects' } | { kind: 'project'; slug: string }

export function normalizePath(pathname: string): string {
  const path = pathname.replace(/\/+$/, '')
  return path === '' ? routes.home : path
}

export function readPath(): string {
  return normalizePath(window.location.pathname)
}

/** True for paths rendered by this app, as opposed to static files under /media/. */
export function isPageRoute(path: string): boolean {
  return path === routes.home || parseRoute(path).kind !== 'home'
}

export function parseRoute(path: string): Route {
  if (path === routes.projects) return { kind: 'projects' }
  const match = new RegExp(`^${routes.projects}/([^/]+)$`).exec(path)
  if (match) return { kind: 'project', slug: decodeURIComponent(match[1]) }
  return { kind: 'home' }
}

export function withLocale(path: string, locale: Locale): string {
  return locale === 'en' ? `${path}?lang=en` : path
}
