import { useState } from 'react'
import { m } from 'framer-motion'
import type { ProjectCard as ProjectCardData, ProjectsContent } from '../content/projects'

interface ProjectsProps {
  content: ProjectsContent
  reducedMotion: boolean
  canHover: boolean
}

function reveal(index: number, reducedMotion: boolean) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : index * 0.08,
      ease: 'easeOut' as const,
    },
  }
}

interface ProjectCardProps {
  card: ProjectCardData
  index: number
  reducedMotion: boolean
  canHover: boolean
}

interface ProjectCardVisualProps {
  card: ProjectCardData
  active: boolean
  transition: {
    duration: number
    ease: readonly [0.22, 1, 0.36, 1]
  }
  reducedMotion: boolean
}

function ProjectCardMedia({ card, active, transition, reducedMotion }: ProjectCardVisualProps) {
  return (
    <>
      <m.img
        className="project-card__image"
        src={card.image}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        width={1200}
        height={675}
        initial={false}
        animate={{ scale: active ? 1.1 : 1, filter: active ? 'blur(3px)' : 'blur(0px)' }}
        transition={transition}
      />
      <m.span
        className={`project-card__mark project-card__mark--${card.markVariant}`}
        aria-hidden="true"
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ ...transition, duration: reducedMotion ? 0 : 0.4 }}
      >
        {card.mark}
      </m.span>
    </>
  )
}

interface ProjectCardDetailsProps extends ProjectCardVisualProps {
  showCategory: boolean
}

function ProjectCardDetails({ card, active, showCategory, transition }: ProjectCardDetailsProps) {
  return (
    <m.div
      className="project-card__details"
      layout
      initial={false}
      style={{ left: active ? 42 : 22, right: active ? 42 : 22 }}
      animate={{ y: active ? -20 : 0 }}
      transition={transition}
    >
      <m.div
        className="project-card__meta"
        initial={false}
        animate={{ y: showCategory ? -40 : 0 }}
        transition={transition}
      >
        <h3 className="project-card__name">{card.title}</h3>
        {card.year && <span className="project-card__year">{card.year}</span>}
      </m.div>
      <m.div
        className="project-card__category"
        initial={false}
        animate={{ opacity: showCategory ? 1 : 0, y: showCategory ? 0 : 16 }}
        transition={{ ...transition, delay: active ? 0.12 : 0 }}
      >
        {card.category}
      </m.div>
    </m.div>
  )
}

function ProjectCard({ card, index, reducedMotion, canHover }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const active = canHover && !reducedMotion && hovered
  const showCategory = active || !canHover || reducedMotion
  const transition = {
    duration: reducedMotion ? 0 : 0.95,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <m.article
      id={card.id}
      tabIndex={-1}
      className="project-card"
      {...reveal(index, reducedMotion)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Keep the hit area fixed while only the visual surface retracts. */}
      <m.div
        className="project-card__surface"
        initial={false}
        animate={{ clipPath: `inset(${active ? 20 : 0}px round 8px)` }}
        transition={transition}
      >
        <ProjectCardMedia
          card={card}
          active={active}
          transition={transition}
          reducedMotion={reducedMotion}
        />
        <ProjectCardDetails
          card={card}
          active={active}
          showCategory={showCategory}
          transition={transition}
          reducedMotion={reducedMotion}
        />
      </m.div>
    </m.article>
  )
}

export function Projects({ content, reducedMotion, canHover }: ProjectsProps) {
  return (
    <div className="projects__inner">
      <div className="projects__intro">
        <m.h2 id="proyectos-heading" className="projects__heading" {...reveal(0.2, reducedMotion)}>
          <span className="reveal-eyebrow">
            {content.eyebrow}
            <m.span
              className="reveal-eyebrow__line"
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
              className="reveal-eyebrow__cover"
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
      </div>
      <div className="projects__list">
        {content.cards.map((card, index) => (
          <ProjectCard
            key={card.id}
            card={card}
            index={index}
            reducedMotion={reducedMotion}
            canHover={canHover}
          />
        ))}
      </div>
    </div>
  )
}
