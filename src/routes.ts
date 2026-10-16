import type { Locale } from './content/hero'

// Single source of truth for page URLs. Static files live under /media/ so no
// folder in public/ can shadow a page route in production.
export const routes = {
  home: '/',
  projects: '/proyectos',
} as const

export type Route = { kind: 'home' } | { kind: 'projects' } | { kind: 'project'; slug: string }

export function readPath(): string {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? routes.home : path
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
