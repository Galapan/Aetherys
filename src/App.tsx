import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useMotionPreferences } from './hooks/useMotionPreferences'
import { useLocalTime } from './hooks/useLocalTime'
import { useHeroEntrance } from './hooks/useHeroEntrance'
import { content, type Locale } from './content/hero'
import { content as manifestoContent } from './content/manifesto'
import { content as projectsContent } from './content/projects'
import { content as expertiseContent } from './content/expertise'
import { content as servicesContent } from './content/services'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { Projects } from './sections/Projects'
import { Expertise } from './sections/Expertise'
import { Services } from './sections/Services'
import { HeroMark } from './features/hero/HeroMark'

function readLocale(): Locale {
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
}

function App() {
  const [locale, setLocale] = useState<Locale>(readLocale)
  const { reducedMotion, canHover } = useMotionPreferences()
  const localTime = useLocalTime()
  const entering = useHeroEntrance(reducedMotion)
  const copy = content[locale]

  const projectsRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: projectsRef,
    offset: ['start end', 'start start'],
  })
  const headerInvert = useTransform(scrollYProgress, [0.82, 0.9], [0, 1], { clamp: true })

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
        headerInvert={headerInvert}
      >
        <main id="main" tabIndex={-1}>
          <div className="sticky-stage">
            <div className="rule-grid sticky-stage__grid" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="sticky-stage__frame">
              <div className="sticky-stage__mark" aria-hidden="true">
                <motion.div
                  className="hero-mark-reveal"
                  initial={entering ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: entering ? 0.8 : 0,
                    delay: entering ? 3.8 : 0,
                    ease: 'easeOut',
                  }}
                >
                  <HeroMark />
                </motion.div>
              </div>
              <div className="hero-bottom container">
                <p className="eyebrow">{copy.eyebrow}</p>
                <div className="hero-bottom__aside">
                  <div
                    className="showreel-placeholder"
                    role="img"
                    aria-label={`${manifestoContent[locale].showreelLabel} — ${manifestoContent[locale].showreelHint}`}
                  >
                    <span className="showreel-placeholder__label">
                      {manifestoContent[locale].showreelLabel}
                    </span>
                    <span className="showreel-placeholder__hint">
                      {manifestoContent[locale].showreelHint}
                    </span>
                  </div>
                  <span className="hero-time">
                    <span className="visually-hidden">{`${copy.localTime}: `}</span>
                    <time dateTime={localTime.machine}>{localTime.display}</time>
                  </span>
                </div>
              </div>
            </div>
            <Hero content={copy} entering={entering} reducedMotion={reducedMotion} />
            <Manifesto content={manifestoContent[locale]} reducedMotion={reducedMotion} />
          </div>
          <section
            ref={projectsRef}
            id="proyectos"
            tabIndex={-1}
            className="projects"
            aria-labelledby="proyectos-heading"
          >
            <div className="rule-grid projects__grid" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <Projects
              content={projectsContent[locale]}
              reducedMotion={reducedMotion}
              canHover={canHover}
            />
          </section>
          <Expertise
            content={expertiseContent[locale]}
            reducedMotion={reducedMotion}
            canHover={canHover}
          />
          <Services
            content={servicesContent[locale]}
            reducedMotion={reducedMotion}
            canHover={canHover}
          />
        </main>
      </Navbar>
    </div>
  )
}

export default App
