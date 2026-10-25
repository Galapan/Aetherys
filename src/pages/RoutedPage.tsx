import { lazy } from 'react'
import type { Locale } from '@/content/hero'
import { content as contactContent } from '@/content/contact'
import { content as projectsContent, findProjectIndex } from '@/content/projects'
import type { Route } from '@/routes'
import { HomePage } from './HomePage'
import { pageLoaders } from './pageLoaders'

const ProjectsPage = lazy(() =>
  pageLoaders.projects().then((module) => ({ default: module.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  pageLoaders.project().then((module) => ({ default: module.ProjectDetailPage })),
)
const ContactPage = lazy(() =>
  pageLoaders.contact().then((module) => ({ default: module.ContactPage })),
)
const AboutPage = lazy(() => pageLoaders.about().then((module) => ({ default: module.AboutPage })))

interface RoutedPageProps {
  route: Route
  /** Keys the project detail, so moving between projects mounts a fresh page. */
  path: string
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

/** The page for the current route; an unknown project slug falls back to the projects list. */
export function RoutedPage({ route, path, locale, reducedMotion, canHover }: RoutedPageProps) {
  const projectContent = projectsContent[locale]

  switch (route.kind) {
    case 'project': {
      const { cards } = projectContent
      const index = findProjectIndex(projectContent, route.slug)
      if (index < 0) break
      return (
        <ProjectDetailPage
          key={path}
          card={cards[index]}
          nextCard={cards[(index + 1) % cards.length]}
          content={projectContent}
          locale={locale}
          reducedMotion={reducedMotion}
          canHover={canHover}
        />
      )
    }
    case 'contact':
      return (
        <ContactPage
          content={contactContent[locale]}
          reducedMotion={reducedMotion}
          canHover={canHover}
        />
      )
    case 'about':
      return <AboutPage locale={locale} reducedMotion={reducedMotion} canHover={canHover} />
    case 'home':
      return <HomePage locale={locale} reducedMotion={reducedMotion} canHover={canHover} />
  }

  return (
    <ProjectsPage
      content={projectContent}
      locale={locale}
      reducedMotion={reducedMotion}
      canHover={canHover}
    />
  )
}
