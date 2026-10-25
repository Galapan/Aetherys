import { content, teamMembers } from '@/content/about'
import type { Locale } from '@/content/hero'
import { contactHref } from '@/content/contact'
import { content as nextStepContent } from '@/content/nextStep'
import { AboutHero } from '@/sections/about/AboutHero'
import { Values } from '@/sections/about/Values'
import { Numbers } from '@/sections/about/Numbers'
import { Team } from '@/sections/about/Team'
import { NextStep } from '@/sections/NextStep'

interface AboutPageProps {
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

export function AboutPage({ locale, reducedMotion, canHover }: AboutPageProps) {
  const copy = content[locale]
  const href = contactHref(locale)

  return (
    <>
      <AboutHero heading={copy.heading} intro={copy.intro} reducedMotion={reducedMotion} />
      <Values
        eyebrow={copy.valuesEyebrow}
        values={copy.values}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
      <Numbers
        eyebrow={copy.numbersEyebrow}
        intro={copy.numbersIntro}
        stats={copy.stats}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
      <Team
        eyebrow={copy.teamEyebrow}
        intro={copy.teamIntro}
        callToAction={copy.teamCallToAction}
        carouselLabel={copy.teamCarouselLabel}
        carouselHint={copy.teamCarouselHint}
        members={teamMembers(locale)}
        contactHref={href}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
      <NextStep
        content={nextStepContent[locale]}
        contactHref={href}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
    </>
  )
}
