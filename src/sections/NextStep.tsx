import { m } from 'framer-motion'
import type { NextStepContent } from '../content/nextStep'
import { testimonyImages } from '../content/testimonies'
import { RuleGrid } from '../components/ui/RuleGrid'
import { NextStepMark } from '../features/nextstep/NextStepMark'

interface NextStepProps {
  content: NextStepContent
  contactHref?: string
  reducedMotion: boolean
  canHover: boolean
}

const buttonClassName =
  'bg-burgundy text-warm-white focus-visible:outline-graphite inline-flex min-h-11 items-center justify-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4'

export function NextStep({ content, contactHref, reducedMotion, canHover }: NextStepProps) {
  return (
    <section
      id="next-step"
      className="bg-warm-white text-graphite relative isolate z-1 min-h-svh scroll-mt-[calc(var(--header-height)+24px)] [color-scheme:light]"
      tabIndex={-1}
      aria-labelledby="next-step-heading"
    >
      <RuleGrid className="absolute inset-0 z-0" spanClassName="bg-grid-burgundy" />
      <div className="relative container flex min-h-svh flex-col items-center pt-[clamp(104px,20svh,216px)] pb-[clamp(64px,8vw,104px)]">
        <div className="relative w-full">
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-1 w-[min(72vw,520px)] -translate-x-1/2 -translate-y-1/2">
            <NextStepMark heading={content.heading} />
          </div>
          <h2
            id="next-step-heading"
            aria-label={content.heading.join(' ')}
            className="relative z-0 m-0 grid w-full grid-cols-4 grid-rows-[auto_auto_auto] text-left text-[clamp(2.25rem,6vw,6rem)] leading-[0.98] font-medium tracking-[-0.045em] md:grid-cols-8 md:grid-rows-[auto_auto] lg:grid-cols-12"
          >
            <span
              aria-hidden="true"
              className="col-span-3 col-start-1 row-start-1 whitespace-nowrap md:col-span-5 md:col-start-2 md:text-left lg:col-span-5 lg:col-start-3"
            >
              {content.heading[0]}
            </span>
            <span
              aria-hidden="true"
              className="col-span-2 col-start-1 row-start-2 whitespace-nowrap md:col-span-3 md:col-start-1 md:row-start-2 md:text-left lg:col-span-3 lg:col-start-2"
            >
              {content.heading[1]}
            </span>
            <span
              aria-hidden="true"
              className="col-span-3 col-start-2 row-start-3 whitespace-nowrap md:col-span-4 md:col-start-5 md:row-start-2 md:text-left lg:col-span-5 lg:col-start-8"
            >
              {content.heading[2]}
            </span>
          </h2>
        </div>
        <div className="relative z-2 mt-[clamp(176px,38svh,280px)] flex flex-col items-center">
          <div className="relative z-0 -mb-[26px] flex items-end justify-center gap-3">
            <img
              src={testimonyImages.bastian}
              alt={content.bastianAlt}
              className="h-[76px] w-[58px] -rotate-[7deg] rounded-lg object-cover"
              width={58}
              height={76}
              loading="lazy"
              decoding="async"
            />
            <img
              src={testimonyImages.cesar}
              alt={content.cesarAlt}
              className="h-[76px] w-[58px] rotate-[7deg] rounded-lg object-cover"
              width={58}
              height={76}
              loading="lazy"
              decoding="async"
            />
          </div>
          {contactHref ? (
            <m.a
              className={`${buttonClassName} relative z-1`}
              href={contactHref}
              whileHover={canHover && !reducedMotion ? { y: -2 } : undefined}
              transition={{ duration: 0.18 }}
            >
              {content.callToAction}
            </m.a>
          ) : (
            <button
              className={`${buttonClassName} relative z-1 disabled:cursor-default disabled:opacity-60`}
              type="button"
              disabled
            >
              {content.callToAction}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
