import { useRef, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useLocalTime } from '@/hooks/useLocalTime'
import { useHeroEntrance } from '@/hooks/useHeroEntrance'
import { content, type HeroContent, type Locale } from '@/content/hero'
import { content as manifestoContent } from '@/content/manifesto'
import { content as projectsContent } from '@/content/projects'
import { content as expertiseContent } from '@/content/expertise'
import { content as servicesContent } from '@/content/services'
import { content as processContent } from '@/content/process'
import { content as testimoniesContent } from '@/content/testimonies'
import { content as joinUsContent } from '@/content/joinUs'
import { contactHref } from '@/content/contact'
import { content as nextStepContent } from '@/content/nextStep'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { Hero } from '@/sections/Hero'
import { Manifesto } from '@/sections/Manifesto'
import { Projects } from '@/sections/Projects'
import { Expertise } from '@/sections/Expertise'
import { Services } from '@/sections/Services'
import { Process } from '@/sections/Process'
import { Testimonies } from '@/sections/Testimonies'
import { JoinUs } from '@/sections/JoinUs'
import { NextStep } from '@/sections/NextStep'
import { HeroMark } from '@/features/hero/HeroMark'
import { Showreel } from '@/features/hero/Showreel'

interface HomePageProps {
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

export function HomePage({ locale, reducedMotion, canHover }: HomePageProps) {
  const localTime = useLocalTime()
  const entering = useHeroEntrance(reducedMotion)
  const copy = content[locale]
  const projectContent = projectsContent[locale]
  const testimoniesRef = useRef<HTMLElement>(null)

  return (
    <>
      <div className="sticky-stage relative">
        <RuleGrid
          className="hero-rule-grid sticky top-0 z-[-1] h-0"
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
          {/* Invisible twin that reserves the foot row, so the mark keeps its centre. */}
          <StageFoot copy={copy} localTime={localTime} ghost />
        </div>
        <Hero content={copy} entering={entering} reducedMotion={reducedMotion} />
        <Manifesto content={manifestoContent[locale]} />
        {/* Pinned to the bottom after the stage text, so it paints above the hero and manifesto. */}
        <div className="pointer-events-none sticky bottom-0 z-1 -mt-[calc(100svh-var(--header-height))] flex h-[calc(100svh-var(--header-height))] flex-col justify-end">
          <StageFoot copy={copy} localTime={localTime}>
            <Showreel content={copy} reducedMotion={reducedMotion} canHover={canHover} />
          </StageFoot>
        </div>
      </div>
      <section
        id="proyectos"
        tabIndex={-1}
        className="bg-warm-white text-graphite relative z-1 mt-[-100svh] scroll-mt-[calc(var(--header-height)+24px)] pt-[clamp(48px,6vw,96px)] pb-[clamp(80px,9vw,144px)]"
        aria-labelledby="proyectos-heading"
      >
        <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
        <Projects
          content={projectContent}
          locale={locale}
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
        contactHref={contactHref(locale)}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
      <NextStep
        content={nextStepContent[locale]}
        contactHref={contactHref(locale)}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
    </>
  )
}

interface StageFootProps {
  copy: HeroContent
  localTime: ReturnType<typeof useLocalTime>
  ghost?: boolean
  children?: ReactNode
}

function StageFoot({ copy, localTime, ghost = false, children }: StageFootProps) {
  return (
    <div
      className={`pointer-events-none relative container flex w-full max-w-none items-center justify-between gap-6 pb-8 [--page-padding:clamp(20px,1.85vw,32px)] ${ghost ? 'invisible' : ''}`}
      aria-hidden={ghost || undefined}
    >
      <p className="text-secondary m-0 text-[12px] leading-[1.4] tracking-[0.08em] uppercase">
        {copy.eyebrow}
      </p>
      <div className="relative flex items-center justify-end">
        {children}
        <span className="text-warm-white flex shrink-0 items-center text-[clamp(13px,1.2vw,15px)] leading-[1.2] font-semibold tracking-[0.02em] whitespace-nowrap tabular-nums">
          <span className="sr-only">{`${copy.localTime}: `}</span>
          <time dateTime={localTime.machine}>{localTime.display}</time>
        </span>
      </div>
    </div>
  )
}
