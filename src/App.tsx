import { startTransition, Suspense, useState } from 'react'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { skipHeroEntrance } from '@/hooks/useHeroEntrance'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { usePageScroll } from '@/hooks/usePageScroll'
import { content, type Locale } from '@/content/hero'
import { Navbar } from '@/components/layout/Navbar'
import type { PageDestination } from '@/components/layout/usePageTransition'
import { usePagePreload } from '@/pages/pageLoaders'
import { RoutedPage } from '@/pages/RoutedPage'
import { parseRoute, readPath } from '@/routes'

function readLocale(): Locale {
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
}

function App() {
  const [locale, setLocale] = useState<Locale>(readLocale)
  const [path, setPath] = useState<string>(readPath)
  const route = parseRoute(path)
  const { reducedMotion, canHover } = useMotionPreferences()
  const copy = content[locale]
  const queueScroll = usePageScroll(path)
  usePagePreload()
  useDocumentMeta(route, locale)

  /** Commits a page change (or a same-page history entry when `destination` is null). */
  function navigate(destination: PageDestination | null) {
    if (destination) {
      if (destination.push) window.history.pushState({ scrollY: 0 }, '', destination.href)
      // Scroll is restored by hand, after the curtain has covered the old page.
      window.history.scrollRestoration = 'manual'
      skipHeroEntrance()
      queueScroll({ y: destination.scrollY, hash: new URL(destination.href).hash })
    }
    // As a transition, the current page stays mounted until the next one has loaded, so the
    // scroll placement runs against the new page.
    startTransition(() => {
      setLocale(readLocale())
      setPath(readPath())
    })
  }

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
          <Suspense fallback={null}>
            <RoutedPage
              route={route}
              path={path}
              locale={locale}
              reducedMotion={reducedMotion}
              canHover={canHover}
            />
          </Suspense>
        </main>
      </Navbar>
    </div>
  )
}

export default App
