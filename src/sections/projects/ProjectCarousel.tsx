import { animate, m, useMotionValue, type PanInfo } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ProjectGalleryImage, ProjectsContent } from '@/content/projects'
import { REVEAL_EASE } from '@/components/ui/easing'

interface ProjectCarouselProps {
  slides?: ProjectGalleryImage[]
  labels: ProjectsContent['detail']['carousel']
  reducedMotion: boolean
  canHover: boolean
  className?: string
}

// Empty frames sketch the carousel until a project provides its screenshots.
const PLACEHOLDER_COUNT = 4
// Drag distance that counts as a swipe to the neighbouring slide.
const SWIPE_THRESHOLD = 40

const slideHeight = 'h-[clamp(200px,30vh,600px)]'
const pagePadding = 'px-[clamp(20px,1.85vw,32px)]'

const buttonClasses = `inline-flex min-h-11 min-w-11 items-center justify-center text-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite disabled:opacity-30`

export function ProjectCarousel({
  slides,
  labels,
  reducedMotion,
  canHover,
  className = '',
}: ProjectCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [index, setIndex] = useState(0)
  // Snap points in px. Slides that already fit at the end share the last one.
  const [snaps, setSnaps] = useState<number[]>([0])
  const slideCount = slides?.length ?? PLACEHOLDER_COUNT

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const measure = () => {
      const items = Array.from(track.children) as HTMLElement[]
      const max = Math.max(0, track.offsetWidth - viewport.clientWidth)
      const start = items[0]?.offsetLeft ?? 0
      const points = items.map((item) => Math.min(item.offsetLeft - start, max))
      setSnaps(points.filter((point, i) => i === 0 || point > points[i - 1]))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(track)
    return () => observer.disconnect()
  }, [slideCount])

  const lastIndex = snaps.length - 1
  const current = Math.min(index, lastIndex)

  // Keeps the track on its snap point when a resize moves the points.
  useEffect(() => {
    x.set(-snaps[current])
  }, [snaps, current, x])

  const goTo = (next: number) => {
    const target = Math.max(0, Math.min(next, lastIndex))
    setIndex(target)
    animate(
      x,
      -snaps[target],
      reducedMotion ? { duration: 0 } : { duration: 0.8, ease: REVEAL_EASE },
    )
  }

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const position = -x.get()
    let nearest = 0
    snaps.forEach((point, i) => {
      if (Math.abs(point - position) < Math.abs(snaps[nearest] - position)) nearest = i
    })
    if (nearest === current && Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      nearest += info.offset.x < 0 ? 1 : -1
    }
    goTo(nearest)
  }

  const hover = (disabled: boolean) => (canHover && !disabled ? { y: -2 } : undefined)

  return (
    <m.section
      className={className}
      aria-label={labels.label}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' }}
    >
      <div
        className={`${pagePadding} mb-4 grid grid-cols-4 gap-[clamp(16px,2vw,24px)] md:grid-cols-12`}
      >
        <p
          className="col-span-2 self-center text-[12px] leading-[1.4] tracking-[0.08em] uppercase md:col-span-3"
          aria-live="polite"
        >
          {current + 1} / {snaps.length}
        </p>
        <div className="col-span-2 flex justify-between md:col-span-3">
          <m.button
            type="button"
            className={buttonClasses}
            aria-label={labels.previous}
            disabled={current === 0}
            onClick={() => goTo(current - 1)}
            whileHover={hover(current === 0)}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13 8H3m0 0 4-4m-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </m.button>
          <m.button
            type="button"
            className={buttonClasses}
            aria-label={labels.next}
            disabled={current === lastIndex}
            onClick={() => goTo(current + 1)}
            whileHover={hover(current === lastIndex)}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </m.button>
        </div>
      </div>
      <div ref={viewportRef} className="overflow-hidden">
        <m.div
          ref={trackRef}
          className={`${pagePadding} relative flex w-max cursor-grab gap-[clamp(16px,2vw,24px)] active:cursor-grabbing`}
          style={{ x }}
          drag={lastIndex > 0 ? 'x' : false}
          dragConstraints={{ left: -snaps[lastIndex], right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {slides
            ? slides.map((slide) => (
                <img
                  key={slide.src}
                  className={`${slideHeight} block w-auto max-w-none shrink-0 select-none`}
                  src={slide.src}
                  srcSet={slide.srcSet}
                  sizes="min(max(356px, 53.4vh), 1067px)"
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ))
            : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={`${slideHeight} bg-graphite aspect-video shrink-0`}
                  aria-hidden="true"
                />
              ))}
        </m.div>
      </div>
    </m.section>
  )
}
