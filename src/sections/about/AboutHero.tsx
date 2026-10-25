import { LineReveal } from '@/components/ui/LineReveal'
import { LightSection } from '@/components/ui/LightSection'

interface AboutHeroProps {
  heading: string
  intro: string
  reducedMotion: boolean
}

// The page curtain lifts about this long after the page mounts beneath it.
const ENTRANCE_DELAY = 0.35

export function AboutHero({ heading, intro, reducedMotion }: AboutHeroProps) {
  return (
    <LightSection
      id="nosotros"
      labelledBy="nosotros-heading"
      className="mt-[calc(var(--header-height)*-1)] min-h-svh pt-[max(calc(var(--header-height)+48px),27svh)] pb-[clamp(64px,12svh,144px)]"
    >
      {/* Full-bleed like RuleGrid, so the margins land on its lines (fifths of the inner
          width): the heading on the second line and the intro on the fourth, as in the
          reference. Tablet uses the lines it shows; phones keep both on the page margin. */}
      <div className="relative px-[var(--page-padding)]">
        <h1
          id="nosotros-heading"
          className="text-burgundy m-0 max-w-[22ch] text-[clamp(2.25rem,3.4vw,3.5rem)] leading-[1.15] font-medium tracking-[-0.03em] lg:ms-[20%]"
        >
          <LineReveal text={heading} reducedMotion={reducedMotion} delay={ENTRANCE_DELAY} />
        </h1>
        <p className="m-0 mt-[clamp(64px,22svh,280px)] max-w-[44ch] text-[clamp(18px,1.4vw,24px)] leading-[1.4] md:ms-[40%] lg:ms-[60%]">
          <LineReveal text={intro} reducedMotion={reducedMotion} delay={ENTRANCE_DELAY + 0.35} />
        </p>
      </div>
    </LightSection>
  )
}
