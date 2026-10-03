import { useEffect, useRef, type ReactNode } from 'react'
import { m, stagger, useAnimate, useInView } from 'framer-motion'
import { joinUsAssets, type JoinUsContent } from '../content/joinUs'
import './JoinUs.css'

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
      <span className="join-us__word-mask">
        <span className="join-us__word">{word}</span>
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
    <section id="join-us" className="join-us" tabIndex={-1} aria-labelledby="join-us-heading">
      <div className="rule-grid join-us__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="container">
        <Reveal kind="eyebrow" reducedMotion={reducedMotion}>
          <p className="join-us__eyebrow">
            {content.eyebrow}
            <span className="join-us__eyebrow-cover" aria-hidden="true" />
          </p>
        </Reveal>
        <div className="join-us__columns">
          <div className="join-us__column">
            <Reveal kind="heading" reducedMotion={reducedMotion}>
              <h2 id="join-us-heading" className="join-us__heading">
                <Words text={content.headingStart} />{' '}
                <span className="join-us__emphasis">
                  <Words text={content.headingEmphasis} />
                </span>{' '}
                <Words text={content.headingEnd} />
              </h2>
            </Reveal>
            <div className="join-us__photo">
              <div className="join-us__media">
                {joinUsAssets.photo && (
                  <img
                    src={joinUsAssets.photo}
                    alt={content.photoAlt}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="join-us__column join-us__column--video">
            <div className="join-us__media">
              {joinUsAssets.video && (
                <JoinUsVideo label={content.videoLabel} reducedMotion={reducedMotion} />
              )}
            </div>
            <Reveal kind="details" className="join-us__details" reducedMotion={reducedMotion}>
              <div className="join-us__reveal-content">
                <p className="join-us__description">{content.description}</p>
                {joinUsAssets.contactHref ? (
                  <m.a
                    className="join-us__contact"
                    href={joinUsAssets.contactHref}
                    whileHover={canHover && !reducedMotion ? { y: -2 } : undefined}
                    transition={{ duration: 0.18 }}
                  >
                    {content.contact}
                  </m.a>
                ) : (
                  <button className="join-us__contact" type="button" disabled>
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
