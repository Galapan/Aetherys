import { SectionTitleReveal } from '../components/ui/SectionTitleReveal'
import { m } from 'framer-motion'
import type { ManifestoContent } from '../content/manifesto'

interface ManifestoProps {
  content: ManifestoContent
  reducedMotion: boolean
}

const reveal = (delay: number, reducedMotion: boolean) => ({
  initial: reducedMotion ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: {
    duration: reducedMotion ? 0 : 0.8,
    delay: reducedMotion ? 0 : delay,
    ease: 'easeOut' as const,
  },
})

export function Manifesto({ content, reducedMotion }: ManifestoProps) {
  return (
    <section
      id="manifiesto"
      className="pointer-events-none relative z-1 min-h-[200svh] ps-[calc(var(--page-padding)+clamp(0px,5vw,72px))] pe-[var(--page-padding)]"
      aria-labelledby="manifiesto-heading"
    >
      <div className="sticky top-0 flex h-svh w-full max-w-[560px] flex-col items-start justify-center gap-8 py-16 md:max-w-[780px] md:py-20 lg:max-w-[960px] lg:py-26">
        <p className="text-burgundy pointer-events-auto m-0 text-[16px] leading-[1.4] font-bold tracking-[0.08em] uppercase">
          <SectionTitleReveal text={content.eyebrow} reducedMotion={reducedMotion} />
        </p>
        <m.h2
          id="manifiesto-heading"
          className="pointer-events-auto m-0 max-w-[44ch] text-[26px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[32px] md:leading-[1.15] lg:text-[clamp(2rem,3.4vw,2.75rem)] lg:leading-[1.1] lg:tracking-[-0.025em]"
          {...reveal(0.35, reducedMotion)}
        >
          {content.statement}
        </m.h2>
      </div>
    </section>
  )
}
