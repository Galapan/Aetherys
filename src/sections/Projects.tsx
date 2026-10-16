import { m } from 'framer-motion'
import type { Locale } from '@/content/hero'
import type { ProjectsContent } from '@/content/projects'
import { ProjectCard } from './projects/ProjectCard'
import { reveal } from './projects/reveal'

interface ProjectsProps {
  content: ProjectsContent
  locale: Locale
  reducedMotion: boolean
  canHover: boolean
}

const cardAreas = [
  'lg:[grid-area:1/1]',
  'lg:[grid-area:2/1]',
  'lg:[grid-area:1/3]',
  'lg:[grid-area:3/1]',
  'lg:[grid-area:2/3]',
  'lg:[grid-area:3/3]',
]

const headingClasses =
  'text-burgundy m-0 text-center text-[16px] leading-[1.1] font-medium tracking-[-0.03em] lg:text-[clamp(0.75rem,1.05vw,1.125rem)]'

function ProjectsHeading({ label, reducedMotion }: { label: string; reducedMotion: boolean }) {
  return (
    <m.h2 id="proyectos-heading" className={headingClasses} {...reveal(0.2, reducedMotion)}>
      <span className="relative inline-block pb-[7px]">
        {label}
        <m.span
          className="absolute right-0 bottom-0 left-0 h-px origin-left bg-current"
          initial={reducedMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        <m.span
          className="absolute inset-0 origin-top bg-[var(--eyebrow-cover,var(--color-burgundy))]"
          aria-hidden="true"
          initial={{ scaleY: reducedMotion ? 0 : 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{
            duration: reducedMotion ? 0 : 0.75,
            delay: reducedMotion ? 0 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </span>
    </m.h2>
  )
}

/** Home section: 3×2 grid around a sticky eyebrow. The full deck lives in ProyectosPage. */
export function Projects({ content, locale, reducedMotion, canHover }: ProjectsProps) {
  return (
    <div className="relative px-[var(--page-padding)]">
      <div className="bg-warm-white pointer-events-none relative z-2 mb-8 flex min-h-14 items-center justify-start lg:sticky lg:top-[50svh] lg:mb-0 lg:h-0 lg:min-h-0 lg:justify-center lg:bg-transparent">
        <ProjectsHeading label={content.eyebrow} reducedMotion={reducedMotion} />
      </div>
      <div className="flex flex-col gap-[clamp(32px,5vw,80px)] lg:grid lg:grid-cols-[40vw_minmax(0,1fr)_40vw] lg:gap-x-0">
        {content.cards.map((card, index) => (
          <ProjectCard
            key={card.id}
            card={card}
            index={index}
            locale={locale}
            reducedMotion={reducedMotion}
            canHover={canHover}
            className={`aspect-[5/3] ${cardAreas[index] ?? ''}`}
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        ))}
      </div>
    </div>
  )
}
