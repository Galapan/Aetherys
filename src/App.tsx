import { useEffect, useState } from 'react'
import { useMotionPreferences } from './hooks/useMotionPreferences'
import { content, type Locale } from './content/hero'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './sections/Hero'

function readLocale(): Locale {
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
}

function App() {
  const [locale, setLocale] = useState<Locale>(readLocale)
  const { reducedMotion, canHover } = useMotionPreferences()
  const copy = content[locale]

  useEffect(() => {
    const syncLocale = () => setLocale(readLocale())
    window.addEventListener('popstate', syncLocale)
    return () => window.removeEventListener('popstate', syncLocale)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = copy.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description)
  }, [locale, copy])

  function changeLocale(next: Locale) {
    if (next === locale) return
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.pushState(null, '', url)
    setLocale(next)
  }

  return (
    <div className="page-shell" id="inicio">
      <a className="skip-link" href="#main">
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
          <Hero content={copy} reducedMotion={reducedMotion} />
        </main>
      </Navbar>
    </div>
  )
}

export default App
