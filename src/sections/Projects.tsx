import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const [hovered, setHovered] = useState(false)
  const active = canHover && !reducedMotion && hovered
  const showCategory = active || !canHover || reducedMotion
  const transition = {
    duration: reducedMotion ? 0 : 0.95,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <motion.article
      id={card.id}
      tabIndex={-1}
      className="project-card"
      {...reveal(index, reducedMotion)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Keep the hit area fixed while only the visual surface retracts. */}
      <motion.div
        className="project-card__surface"
        initial={false}
        animate={{ clipPath: `inset(${active ? 20 : 0}px round 8px)` }}
        transition={transition}
      >
        <motion.img
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
        <motion.span
          className={`project-card__mark project-card__mark--${card.markVariant}`}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ ...transition, duration: reducedMotion ? 0 : 0.4 }}
        >
          {card.mark}
        </motion.span>
        <motion.div
          className="project-card__details"
          initial={false}
          animate={{ left: active ? 42 : 22, y: active ? -20 : 0, right: active ? 42 : 22 }}
          transition={transition}
        >
          <motion.div
            className="project-card__meta"
            initial={false}
            animate={{ y: showCategory ? -40 : 0 }}
            transition={transition}
          >
            <h3 className="project-card__name">{card.title}</h3>
            {card.year && <span className="project-card__year">{card.year}</span>}
          </motion.div>
          <motion.div
            className="project-card__category"
            initial={false}
            animate={{ opacity: showCategory ? 1 : 0, y: showCategory ? 0 : 16 }}
            transition={{ ...transition, delay: active ? 0.12 : 0 }}
          >
            {card.category}
          </motion.div>
        </motion.div>
      </motion.div>
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
