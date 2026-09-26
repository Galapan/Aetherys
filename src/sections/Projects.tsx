import { useEffect } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
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

function ProjectCard({ card, index, reducedMotion, canHover }: ProjectCardProps) {
  // The letter owns its own MotionValue, driven by the article's hover. This is
  // explicit rather than variant propagation, which is unreliable while the
  // article also animates entrance with object targets.
  const markOpacity = useMotionValue(1)

  useEffect(() => () => markOpacity.stop(), [markOpacity])

  const duration = reducedMotion ? 0 : 0.28
  const hideMark = canHover
    ? () => animate(markOpacity, 0, { duration, ease: 'easeOut' })
    : undefined
  const showMark = canHover
    ? () => animate(markOpacity, 1, { duration, ease: 'easeOut' })
    : undefined

  return (
    <motion.article
      className="project-card"
      {...reveal(index, reducedMotion)}
      onHoverStart={hideMark}
      onHoverEnd={showMark}
      whileHover={
        canHover
          ? { scale: 0.9, transition: { type: 'spring', stiffness: 300, damping: 30 } }
          : undefined
      }
    >
      <motion.span
        className={`project-card__mark project-card__mark--${card.markVariant}`}
        aria-hidden="true"
        style={{ opacity: markOpacity }}
      >
        {card.mark}
      </motion.span>
      {/* The alt text already names the project, so this is decorative. */}
      <span className="project-card__name" aria-hidden="true">
        {card.title}
      </span>
      <img
        className="project-card__image"
        src={card.image}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        width={1200}
        height={675}
      />
    </motion.article>
  )
}

export function Projects({ content, reducedMotion, canHover }: ProjectsProps) {
  return (
    <div className="projects__inner">
      <div className="projects__intro">
        <motion.h2
          id="proyectos-heading"
          className="projects__heading"
          {...reveal(0.2, reducedMotion)}
        >
          <span className="reveal-eyebrow">
            {content.eyebrow}
            <motion.span
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
            <motion.span
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
        </motion.h2>
      </div>
      <div className="projects__list">
        {content.cards.map((card, index) => (
          <ProjectCard
            key={card.title}
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
