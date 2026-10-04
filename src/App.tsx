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
import { content as processContent } from './content/process'
import { content as testimoniesContent } from './content/testimonies'
import { content as joinUsContent } from './content/joinUs'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { Projects } from './sections/Projects'
import { Expertise } from './sections/Expertise'
import { Services } from './sections/Services'
import { Process } from './sections/Process'
import { Testimonies } from './sections/Testimonies'
import { JoinUs } from './sections/JoinUs'
import { HeroMark } from './features/hero/HeroMark'
import { Showreel } from './features/hero/Showreel'

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
  const testimoniesRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: projectsRef,
    offset: ['start end', 'start start'],
  })
  const lightHeaderInvert = useTransform(scrollYProgress, [0.82, 0.9], [0, 1], { clamp: true })
  const { scrollYProgress: testimoniesProgress } = useScroll({
    target: testimoniesRef,
    offset: ['start start', 'end start'],
  })
  const headerInvert = useTransform(() => {
    const progress = testimoniesProgress.get()
    return progress > 0 && progress < 1 ? 0 : lightHeaderInvert.get()
  })

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
                  <Showreel content={copy} reducedMotion={reducedMotion} canHover={canHover} />
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
          <Process content={processContent[locale]} reducedMotion={reducedMotion} />
          <Testimonies
            key={locale}
            sectionRef={testimoniesRef}
            content={testimoniesContent[locale]}
            reducedMotion={reducedMotion}
          />
          <JoinUs
            content={joinUsContent[locale]}
            reducedMotion={reducedMotion}
            canHover={canHover}
          />
        </main>
      </Navbar>
    </div>
  )
}

export default App
