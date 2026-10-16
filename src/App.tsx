import { useEffect, useState } from 'react'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { content, type Locale } from '@/content/hero'
import { content as projectsContent, findProject, findProjectIndex } from '@/content/projects'
import { Navbar } from '@/components/layout/Navbar'
import { HomePage } from '@/pages/HomePage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { parseRoute, readPath } from '@/routes'

function readLocale(): Locale {
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
}

function App() {
  const [locale, setLocale] = useState<Locale>(readLocale)
  const [path, setPath] = useState<string>(readPath)
  const route = parseRoute(path)
  const isLightPage = route.kind !== 'home'
  const projectContent = projectsContent[locale]
  const projectSlug = route.kind === 'project' ? route.slug : undefined
  const project = projectSlug ? findProject(projectContent, projectSlug) : undefined
  const projectIndex = projectSlug ? findProjectIndex(projectContent, projectSlug) : -1
  const nextProject =
    project && projectIndex >= 0
      ? projectContent.cards[(projectIndex + 1) % projectContent.cards.length]
      : undefined
  const { reducedMotion, canHover } = useMotionPreferences()
  const copy = content[locale]

  useEffect(() => {
    const sync = () => {
      setLocale(readLocale())
      setPath(readPath())
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = project ? `${project.title} — ${copy.brand}` : copy.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description)
  }, [locale, copy, project])

  function changeLocale(next: Locale) {
    if (next === locale) return
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.pushState(null, '', url)
    setLocale(next)
  }

  return (
    <div
      className={`${isLightPage ? 'bg-warm-white' : 'bg-dark-gray'} isolate min-h-svh`}
      id="inicio"
    >
      <a
        className="bg-burgundy fixed top-4 left-5 z-10 -translate-y-[200%] rounded px-4 py-3 focus:translate-y-0"
        href="#main"
        data-skip-link
      >
        {copy.skip}
      </a>
      <Navbar
        content={copy}
        locale={locale}
        onChange={changeLocale}
        reducedMotion={reducedMotion}
        canHover={canHover}
      >
        <main id="main" tabIndex={-1}>
          {route.kind === 'project' && project && nextProject ? (
            <ProjectDetailPage
              card={project}
              nextCard={nextProject}
              content={projectContent}
              locale={locale}
              reducedMotion={reducedMotion}
              canHover={canHover}
            />
          ) : route.kind !== 'home' ? (
            <ProjectsPage
              content={projectContent}
              locale={locale}
              reducedMotion={reducedMotion}
              canHover={canHover}
            />
          ) : (
            <HomePage locale={locale} reducedMotion={reducedMotion} canHover={canHover} />
          )}
        </main>
      </Navbar>
    </div>
  )
}

export default App
