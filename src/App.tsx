import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { skipHeroEntrance } from '@/hooks/useHeroEntrance'
import { content, type Locale } from '@/content/hero'
import { content as projectsContent, findProject, findProjectIndex } from '@/content/projects'
import { Navbar } from '@/components/layout/Navbar'
import type { PageDestination } from '@/components/layout/usePageTransition'
import { HomePage } from '@/pages/HomePage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { parseRoute, readPath } from '@/routes'

function readLocale(): Locale {
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
}

/**
 * Document offset from layout boxes. Unlike getBoundingClientRect it ignores
 * transforms, such as the page scale left by the menu while the curtain covers it.
 */
function layoutOffsetTop(element: HTMLElement): number {
  let top = 0
  for (let node: Element | null = element; node instanceof HTMLElement; node = node.offsetParent) {
    top += node.offsetTop
  }
  return top - (Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0)
}

function App() {
  const [locale, setLocale] = useState<Locale>(readLocale)
  const [path, setPath] = useState<string>(readPath)
  const route = parseRoute(path)
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
  const lenis = useLenis()
  const pendingScroll = useRef<{ y: number; hash: string } | null>(null)

  // Place the new page at its destination before the curtain lifts.
  useLayoutEffect(() => {
    const target = pendingScroll.current
    if (!target) return
    pendingScroll.current = null
    let anchor: HTMLElement | null
    try {
      anchor = target.hash
        ? document.getElementById(decodeURIComponent(target.hash.slice(1)))
        : null
    } catch {
      anchor = null
    }
    const top = anchor ? layoutOffsetTop(anchor) : target.y
    if (lenis) {
      // The previous page had another height; refresh Lenis' limit first.
      lenis.resize()
      lenis.scrollTo(top, { immediate: true, force: true })
    } else window.scrollTo({ top, behavior: 'instant' })
  }, [path, lenis])

  /** Commits a page change (or a same-page history entry when `destination` is null). */
  function navigate(destination: PageDestination | null) {
    if (destination) {
      if (destination.push) window.history.pushState({ scrollY: 0 }, '', destination.href)
      // Scroll is restored by hand, after the curtain has covered the old page.
      window.history.scrollRestoration = 'manual'
      skipHeroEntrance()
      pendingScroll.current = {
        y: destination.scrollY,
        hash: new URL(destination.href).hash,
      }
    }
    setLocale(readLocale())
    setPath(readPath())
  }

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
      // Only visible around the page while the menu scales it down: the same dark
      // frame on every page, so the white menu panel always reads against it.
      className="bg-dark-gray isolate min-h-svh"
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
        path={path}
        onNavigate={navigate}
        onChange={changeLocale}
        reducedMotion={reducedMotion}
        canHover={canHover}
      >
        <main id="main" tabIndex={-1}>
          {route.kind === 'project' && project && nextProject ? (
            <ProjectDetailPage
              key={path}
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
