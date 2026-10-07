import { useEffect, useRef, useState } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
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
import { RuleGrid } from './components/ui/RuleGrid'
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
    <div className="bg-dark-gray isolate min-h-svh" id="inicio">
      <a
        className="bg-burgundy fixed top-4 left-5 z-10 -translate-y-[200%] rounded px-4 py-3 focus:translate-y-0"
        href="#main"
      >
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
          <div className="sticky-stage relative">
            <RuleGrid
              className="sticky top-0 z-[-1] h-0"
              spanClassName="mt-[calc(var(--header-height)*-1)] h-[calc(100svh+var(--header-height))] bg-grid"
            />
            <div className="pointer-events-none sticky top-0 mt-[calc(var(--header-height)*-1)] mb-[calc(var(--header-height)-100svh)] grid h-svh grid-rows-[1fr_auto]">
              <div
                className="sticky-stage__mark relative z-0 grid place-items-center pb-[var(--mark-lift)]"
                aria-hidden="true"
              >
                <m.div
                  className="hero-mark-reveal w-[min(100%,480px)]"
                  initial={entering ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: entering ? 0.8 : 0,
                    delay: entering ? 3.8 : 0,
                    ease: 'easeOut',
                  }}
                >
                  <HeroMark />
                </m.div>
              </div>
              <div className="pointer-events-none relative z-2 container flex w-full max-w-none items-center justify-between gap-6 pb-8 [--page-padding:clamp(20px,1.85vw,32px)]">
                <p className="text-secondary m-0 text-[12px] leading-[1.4] tracking-[0.08em] uppercase">
                  {copy.eyebrow}
                </p>
                <div className="relative flex items-center justify-end">
                  <Showreel content={copy} reducedMotion={reducedMotion} canHover={canHover} />
                  <span className="text-warm-white flex shrink-0 items-center text-[clamp(13px,1.2vw,15px)] leading-[1.2] font-semibold tracking-[0.02em] whitespace-nowrap tabular-nums">
                    <span className="sr-only">{`${copy.localTime}: `}</span>
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
            className="bg-warm-white text-graphite relative z-1 mt-[-100svh] scroll-mt-[calc(var(--header-height)+24px)] pt-[clamp(48px,6vw,96px)] pb-[clamp(80px,9vw,144px)]"
            aria-labelledby="proyectos-heading"
          >
            <RuleGrid
              className="absolute inset-x-0 top-0 h-full"
              spanClassName="bg-grid-burgundy"
            />
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
