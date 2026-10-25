import { m } from 'framer-motion'
import type { SyntheticEvent } from 'react'
import type { Locale } from '@/content/hero'
import {
  projectHref,
  projectsHref,
  projectImageSrcSet,
  projectLogoPaths,
  type ProjectCard,
  type ProjectGalleryBlock,
  type ProjectsContent,
  type ProjectVideoBackground,
} from '@/content/projects'
import { content as nextStepContent } from '@/content/nextStep'
import { contactHref } from '@/content/contact'
import { RuleGrid } from '@/components/ui/RuleGrid'
import { NextStep } from '@/sections/NextStep'

interface ProjectDetailPageProps {
  card: ProjectCard
  nextCard: ProjectCard
  content: ProjectsContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

function reveal(reducedMotion: boolean, delay = 0) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : delay,
      ease: 'easeOut' as const,
    },
  }
}

function fadeIn(reducedMotion: boolean) {
  return {
    initial: reducedMotion ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' as const },
  }
}

const secondaryGraphite = 'text-[color-mix(in_srgb,var(--color-graphite)_78%,transparent)]'

const navLinkClasses = `inline-flex min-h-11 items-center text-[12px] leading-[1.4] tracking-[0.08em] uppercase text-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite`

const galleryBlockClasses: Record<ProjectGalleryBlock, string> = {
  large: 'col-span-2 aspect-[4/3] md:col-span-6',
  medium:
    'col-span-2 mt-[clamp(16px,4vw,40px)] mb-[calc(clamp(48px,7vw,96px)+clamp(16px,4vw,40px)-clamp(32px,5vw,48px))] aspect-[16/9] justify-self-center md:col-span-12 md:mt-[clamp(24px,4vw,56px)] md:mb-[calc(clamp(48px,7vw,96px)+clamp(24px,4vw,56px)-clamp(32px,5vw,48px))] md:w-[57.5%]',
  small: 'col-span-1 aspect-square md:col-span-3',
  wide: 'col-span-2 aspect-[16/9] md:col-span-12',
}

// Mirrors the header: blends the label with whatever image sits behind it.
const backLinkClasses = `pointer-events-auto inline-flex min-h-11 items-center text-[14px] leading-[1.4] tracking-[0.08em] uppercase`

interface LoopingVideoProps {
  src: string
  label: string
  autoPlay: boolean
  className: string
}

// Restarts slightly before the end so the last frames never flash on loop.
function LoopingVideo({ src, label, autoPlay, className }: LoopingVideoProps) {
  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (video.duration && video.currentTime >= video.duration - 0.5) {
      video.currentTime = 0
      void video.play()
    }
  }

  return (
    <video
      className={className}
      src={src}
      aria-label={label}
      autoPlay={autoPlay}
      loop
      muted
      playsInline
      preload="auto"
      onTimeUpdate={handleTimeUpdate}
    />
  )
}

type ProjectCoverProps = Omit<ProjectDetailPageProps, 'nextCard'>

// Portada fija: la página inferior asciende y se superpone sobre ella.
function ProjectCover({ card, content, locale, reducedMotion, canHover }: ProjectCoverProps) {
  return (
    <m.div
      className="sticky top-0 z-0 h-[50svh] min-h-[260px] w-full overflow-hidden"
      {...fadeIn(reducedMotion)}
    >
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={card.image}
        srcSet={projectImageSrcSet(card)}
        sizes="100vw"
        alt={card.imageAlt}
        width={1200}
        height={675}
        loading="eager"
        decoding="async"
      />
      {projectLogoPaths[card.slug] && (
        <img
          className="pointer-events-none absolute top-1/2 left-1/2 max-h-[22.5%] max-w-[min(40vw,280px)] -translate-x-1/2 -translate-y-1/2 object-contain"
          src={projectLogoPaths[card.slug]}
          alt=""
          aria-hidden="true"
          width={560}
          height={160}
          loading="eager"
          decoding="async"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-2 flex flex-col justify-center">
        <m.h1
          id="proyecto-heading"
          className="text-warm-white container max-w-none text-[clamp(2.5rem,5vw,5rem)] leading-[1.02] font-medium tracking-[-0.04em] uppercase"
          {...reveal(reducedMotion, 0.05)}
        >
          <span aria-hidden="true">/</span>
          {card.title}
        </m.h1>
      </div>
      <div className="text-warm-white pointer-events-none absolute inset-x-0 top-0 z-3 container max-w-none pt-[calc(var(--header-height)+clamp(12px,2vw,24px))] mix-blend-difference [--page-padding:clamp(20px,1.85vw,32px)]">
        <m.a
          href={projectsHref(locale)}
          className={backLinkClasses}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M13 8H3m0 0 4-4m-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{content.detail.back}</span>
        </m.a>
      </div>
      <div className="text-warm-white pointer-events-none absolute inset-x-0 bottom-0 z-3 container max-w-none pb-[clamp(16px,2vw,28px)] mix-blend-difference [--page-padding:clamp(20px,1.85vw,32px)]">
        <m.div
          className="flex items-baseline justify-between gap-4 text-[12px] leading-[1.4] tracking-[0.08em] uppercase"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : 0.2,
            ease: 'easeOut',
          }}
        >
          <span>{card.year}</span>
          <span>{card.category}</span>
        </m.div>
      </div>
    </m.div>
  )
}

interface ProjectVideoProps {
  media: ProjectVideoBackground
  reducedMotion: boolean
}

function ProjectVideo({ media, reducedMotion }: ProjectVideoProps) {
  return (
    <m.div
      className="mt-[clamp(48px,7vw,96px)] px-[clamp(20px,1.85vw,32px)]"
      {...fadeIn(reducedMotion)}
    >
      <div className="relative overflow-hidden">
        <img
          className="block h-auto w-full"
          src={media.src}
          srcSet={media.srcSet}
          sizes="100vw"
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
        />
        {media.video && !reducedMotion && (
          <video
            className="absolute top-1/2 left-1/2 aspect-video w-[92%] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 object-cover md:w-[68%]"
            src={media.video}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        )}
      </div>
    </m.div>
  )
}

export function ProjectDetailPage({
  card,
  nextCard,
  content,
  locale,
  reducedMotion,
  canHover,
}: ProjectDetailPageProps) {
  return (
    <>
      <section
        id="proyecto"
        tabIndex={-1}
        className="text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh"
        aria-labelledby="proyecto-heading"
      >
        <ProjectCover
          card={card}
          content={content}
          locale={locale}
          reducedMotion={reducedMotion}
          canHover={canHover}
        />
        {/* Superficie opaca que se superpone sobre la portada al hacer scroll. */}
        <div className="bg-warm-white relative z-1 pb-[clamp(80px,9vw,144px)]">
          <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
          <div
            className={
              card.summary
                ? 'container max-w-none pt-[clamp(48px,7vw,96px)] [--page-padding:clamp(20px,1.85vw,32px)]'
                : 'container flex min-h-[50svh] flex-col justify-center'
            }
          >
            {card.summary && (
              <>
                <m.p
                  className="text-burgundy text-[14px] leading-[1.4] font-bold tracking-[0.08em] uppercase"
                  {...reveal(reducedMotion, 0.15)}
                >
                  {content.detail.context}
                </m.p>
                <m.p
                  className="mt-[clamp(16px,2vw,24px)] max-w-[62ch] text-[clamp(1.25rem,1.6vw,1.5rem)] leading-[1.6]"
                  {...reveal(reducedMotion, 0.2)}
                >
                  {card.summary}
                </m.p>
              </>
            )}
          </div>
          {card.presentation && (
            <m.img
              className="mt-[clamp(48px,7vw,96px)] block h-auto w-full"
              src={card.presentation.src}
              srcSet={card.presentation.srcSet}
              sizes="100vw"
              alt={card.presentation.alt}
              width={card.presentation.width}
              height={card.presentation.height}
              loading="lazy"
              decoding="async"
              {...fadeIn(reducedMotion)}
            />
          )}
          {card.sections && card.sections.length > 0 && (
            <div className="mt-[clamp(48px,7vw,96px)] grid w-full max-w-[1440px] gap-x-6 gap-y-[clamp(32px,5vw,48px)] px-[clamp(20px,1.85vw,32px)] md:grid-cols-2">
              {card.sections.map((section) => (
                <div key={section.label}>
                  <m.p
                    className="text-burgundy text-[14px] leading-[1.4] font-bold tracking-[0.08em] uppercase"
                    {...reveal(reducedMotion, 0.15)}
                  >
                    {section.label}
                  </m.p>
                  <m.p
                    className="mt-[clamp(16px,2vw,24px)] max-w-[62ch] text-[clamp(1.25rem,1.6vw,1.5rem)] leading-[1.6]"
                    {...reveal(reducedMotion, 0.2)}
                  >
                    {section.body}
                  </m.p>
                </div>
              ))}
            </div>
          )}
          {card.videoBackground && (
            <ProjectVideo media={card.videoBackground} reducedMotion={reducedMotion} />
          )}
          {card.gallery && card.gallery.length > 0 && (
            <m.div
              className="mt-[clamp(48px,7vw,96px)] grid grid-cols-2 gap-[clamp(16px,2vw,24px)] px-[clamp(20px,1.85vw,32px)] md:grid-cols-12"
              {...fadeIn(reducedMotion)}
            >
              {card.gallery.map((block, index) => {
                const video = block === 'medium' ? card.galleryVideo : undefined
                const wideVideo = block === 'wide' ? card.galleryWideVideo : undefined
                const image = block === 'wide' ? card.galleryImage : undefined
                return (
                  <div
                    key={`${block}-${index}`}
                    className={`bg-graphite relative overflow-hidden ${galleryBlockClasses[block]}`}
                    aria-hidden={video || wideVideo ? undefined : 'true'}
                  >
                    {video && (
                      <LoopingVideo
                        className="absolute inset-0 h-full w-full object-cover"
                        src={video.src}
                        label={video.label}
                        autoPlay={!reducedMotion}
                      />
                    )}
                    {image && (
                      <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    {wideVideo && (
                      <LoopingVideo
                        className="absolute top-1/2 left-1/2 aspect-video w-[92%] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 object-cover md:w-[68%]"
                        src={wideVideo.src}
                        label={wideVideo.label}
                        autoPlay={!reducedMotion}
                      />
                    )}
                  </div>
                )
              })}
            </m.div>
          )}
          <div className="container mt-[clamp(24px,4vw,48px)] flex flex-col gap-3 sm:flex-row sm:justify-end">
            <m.a
              href={projectHref(nextCard.slug, locale)}
              className={`${navLinkClasses} sm:justify-end`}
              aria-label={`${content.detail.next}: ${nextCard.title}`}
              whileHover={canHover ? { y: -2 } : undefined}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <span className="text-burgundy" aria-hidden="true">
                /
              </span>
              <span className="ml-1">{content.detail.next}</span>
              <span className={`${secondaryGraphite} ml-1`}>{nextCard.title}</span>
            </m.a>
          </div>
        </div>
      </section>
      <NextStep
        content={nextStepContent[locale]}
        contactHref={contactHref(locale)}
        reducedMotion={reducedMotion}
        canHover={canHover}
      />
    </>
  )
}
