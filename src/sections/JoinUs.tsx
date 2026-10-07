import { useEffect, useRef, type ReactNode } from 'react'
import { m, stagger, useAnimate, useInView } from 'framer-motion'
import { joinUsAssets, type JoinUsContent } from '../content/joinUs'
import { RuleGrid } from '../components/ui/RuleGrid'

interface JoinUsProps {
  content: JoinUsContent
  reducedMotion: boolean
  canHover: boolean
}

const ease = [0.22, 1, 0.36, 1] as const

// Each block enters when it reaches the viewport, including the copy below the video.
// Markup is visible until Motion initializes, and cleanup restores the static state.
function Reveal({
  children,
  className,
  kind,
  reducedMotion,
}: {
  children: ReactNode
  className?: string
  kind: 'eyebrow' | 'heading' | 'details'
  reducedMotion: boolean
}) {
  const [scope, animate] = useAnimate()
  const visible = useInView(scope, { once: true, amount: 0.15 })

  useEffect(() => {
    if (!visible || reducedMotion) return
    const target = kind === 'heading' ? '.join-us__word' : '.join-us__reveal-content'
    const controls =
      kind === 'eyebrow'
        ? animate([
            ['.join-us__eyebrow-cover', { opacity: 1, scaleX: 1 }, { duration: 0 }],
            ['.join-us__eyebrow-cover', { scaleX: 0 }, { duration: 0.6, ease }],
          ])
        : animate([
            [target, { y: '110%', opacity: 0 }, { duration: 0 }],
            [
              target,
              { y: '0%', opacity: 1 },
              { duration: 0.8, delay: kind === 'heading' ? stagger(0.025) : 0, ease },
            ],
          ])

    return () => {
      controls.stop()
      if (kind === 'eyebrow') {
        animate('.join-us__eyebrow-cover', { opacity: 0 }, { duration: 0 })
      } else {
        animate(target, { y: 0, opacity: 1 }, { duration: 0 })
      }
    }
  }, [animate, kind, reducedMotion, visible])

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}

function Words({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <span key={`${index}-${word}`}>
      {index > 0 ? ' ' : null}
      <span className="mb-[-0.12em] inline-block overflow-clip pb-[0.12em] align-top">
        {/* animation hook: targeted by useAnimate */}
        <span className="join-us__word inline-block">{word}</span>
      </span>
    </span>
  ))
}

function JoinUsVideo({ label, reducedMotion }: { label: string; reducedMotion: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  const visible = useInView(video, { amount: 0.15 })

  useEffect(() => {
    const element = video.current
    if (!element) return
    const syncPlayback = () => {
      if (!visible || document.hidden || reducedMotion) {
        element.pause()
      } else {
        // Autoplay can be refused by the browser; native controls remain available.
        void element.play().catch(() => {})
      }
    }
    syncPlayback()
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      element.pause()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [reducedMotion, visible])

  return (
    <video
      ref={video}
      src={joinUsAssets.video}
      poster={joinUsAssets.poster || undefined}
      className="focus-visible:outline-graphite block h-full w-full object-cover focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={label}
      muted
      loop
      playsInline
      controls
      preload="none"
    />
  )
}

export function JoinUs({ content, reducedMotion, canHover }: JoinUsProps) {
  return (
    <section
      id="join-us"
      className="bg-warm-white text-graphite focus-visible:outline-graphite relative isolate z-1 min-h-svh scroll-mt-[calc(var(--header-height)+24px)] py-20 [color-scheme:light] focus-visible:outline-2 focus-visible:outline-offset-4 md:py-26 lg:py-36"
      tabIndex={-1}
      aria-labelledby="join-us-heading"
    >
      <RuleGrid className="absolute inset-0 z-[-1]" spanClassName="bg-grid-burgundy" />
      <div className="container">
        <Reveal kind="eyebrow" reducedMotion={reducedMotion}>
          <p className="text-burgundy relative m-0 mb-16 table text-[12px] leading-[1.4] tracking-[0.08em]">
            {content.eyebrow}
            {/* animation hook: targeted by useAnimate */}
            <span
              className="join-us__eyebrow-cover bg-burgundy absolute inset-0 origin-right opacity-0"
              aria-hidden="true"
            />
          </p>
        </Reveal>
        <div className="grid gap-12 md:grid-cols-8 md:gap-6 lg:grid-cols-12">
          <div className="min-w-0 md:col-span-4 lg:col-span-5 lg:col-start-1">
            <Reveal kind="heading" reducedMotion={reducedMotion}>
              <h2
                id="join-us-heading"
                className="m-0 text-[clamp(2rem,4vw,4rem)] leading-[1.1] font-medium tracking-[-0.03em] md:text-[clamp(2rem,3.2vw,3rem)]"
              >
                <Words text={content.headingStart} />{' '}
                <span className="text-burgundy">
                  <Words text={content.headingEmphasis} />
                </span>{' '}
                <Words text={content.headingEnd} />
              </h2>
            </Reveal>
            <div className="mt-12 lg:mt-16">
              <div className="bg-dark-gray aspect-square overflow-clip rounded-lg">
                {joinUsAssets.photo && (
                  <img
                    src={joinUsAssets.photo}
                    alt={content.photoAlt}
                    className="block h-full w-full object-cover"
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="min-w-0 md:col-span-4 md:pt-6 lg:col-span-5 lg:col-start-8">
            <div className="bg-dark-gray aspect-square overflow-clip rounded-lg">
              {joinUsAssets.video && (
                <JoinUsVideo label={content.videoLabel} reducedMotion={reducedMotion} />
              )}
            </div>
            <Reveal
              kind="details"
              className="mt-8 overflow-clip lg:mt-12"
              reducedMotion={reducedMotion}
            >
              {/* animation hook: targeted by useAnimate */}
              <div className="join-us__reveal-content">
                <p className="m-0 max-w-[62ch] text-[18px] leading-[1.6] text-[color-mix(in_srgb,var(--color-graphite)_78%,transparent)]">
                  {content.description}
                </p>
                {joinUsAssets.contactHref ? (
                  <m.a
                    className="bg-burgundy text-warm-white focus-visible:outline-graphite mt-6 inline-flex min-h-11 items-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
                    href={joinUsAssets.contactHref}
                    whileHover={canHover && !reducedMotion ? { y: -2 } : undefined}
                    transition={{ duration: 0.18 }}
                  >
                    {content.contact}
                  </m.a>
                ) : (
                  <button
                    className="bg-burgundy text-warm-white focus-visible:outline-graphite mt-6 inline-flex min-h-11 items-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-60"
                    type="button"
                    disabled
                  >
                    {content.contact}
                  </button>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
