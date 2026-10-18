import type { ManifestoContent } from '@/content/manifesto'

interface ManifestoProps {
  content: ManifestoContent
}

export function Manifesto({ content }: ManifestoProps) {
  return (
    <section
      id="manifiesto"
      className="pointer-events-none relative z-1 min-h-[260svh] ps-[calc(var(--page-padding)+clamp(0px,5vw,72px))] pe-[var(--page-padding)]"
      aria-labelledby="manifiesto-heading"
    >
      <div className="sticky top-0 flex h-svh w-full max-w-[560px] flex-col items-start justify-center gap-8 py-16 md:max-w-[780px] md:py-20 lg:max-w-[960px] lg:py-26">
        <p className="text-burgundy pointer-events-auto m-0 text-[16px] leading-[1.4] font-bold tracking-[0.08em] uppercase">
          {content.eyebrow}
        </p>
        <h2
          id="manifiesto-heading"
          className="pointer-events-auto m-0 max-w-[44ch] text-[26px] leading-[1.2] font-medium tracking-[-0.02em] text-pretty md:text-[32px] md:leading-[1.15] lg:text-[clamp(2rem,3.4vw,2.75rem)] lg:leading-[1.1] lg:tracking-[-0.025em]"
        >
          {content.statement}
        </h2>
      </div>
    </section>
  )
}
