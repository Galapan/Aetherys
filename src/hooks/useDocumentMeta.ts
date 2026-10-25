import { useEffect } from 'react'
import { content as aboutContent } from '@/content/about'
import { content as contactContent } from '@/content/contact'
import { content, type Locale } from '@/content/hero'
import { content as projectsContent, findProject } from '@/content/projects'
import type { Route } from '@/routes'

function documentTitle(route: Route, locale: Locale): string {
  const { brand, title } = content[locale]
  if (route.kind === 'project') {
    const project = findProject(projectsContent[locale], route.slug)
    if (project) return `${project.title} — ${brand}`
  }
  if (route.kind === 'contact') return `${contactContent[locale].title} — ${brand}`
  if (route.kind === 'about') return `${aboutContent[locale].title} — ${brand}`
  return title
}

/** Keeps the document language, title and description in step with the page and locale. */
export function useDocumentMeta(route: Route, locale: Locale) {
  const title = documentTitle(route, locale)
  const { description } = content[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [locale, title, description])
}
