import { m } from 'framer-motion'
import type { Locale } from '../../content/hero'
import { content as projectsContent } from '../../content/projects'
import { menuContent } from '../../content/navigation'
import { createReveal } from './menuMotion'

interface MenuProjectsProps {
  locale: Locale
  expanded: boolean
  reducedMotion: boolean
}

export function MenuProjects({ locale, expanded, reducedMotion }: MenuProjectsProps) {
  const projects = projectsContent[locale].cards

  return (
    <section className="min-w-0" aria-labelledby="menu-projects-heading">
      <div className="overflow-hidden">
        <m.h2
          id="menu-projects-heading"
          className="text-burgundy m-0 mb-4 text-sm leading-[1.4] font-medium tracking-[0.02em] uppercase md:text-base"
          {...createReveal(expanded, reducedMotion, 0.42, true)}
        >
          /{menuContent[locale].projects} ({projects.length})
        </m.h2>
      </div>
      <ul className="m-0 flex list-none flex-col items-start gap-2 p-0">
        {projects.map((project, index) => (
          <li key={project.id} className="max-w-full overflow-hidden">
            <m.a
              role="link"
              aria-disabled="true"
              className="bg-graphite/5 block max-w-full cursor-default rounded px-3 py-2 text-sm leading-[1.4] wrap-break-word uppercase md:text-base"
              {...createReveal(expanded, reducedMotion, 0.48 + index * 0.055, true)}
            >
              {project.title}
            </m.a>
          </li>
        ))}
      </ul>
    </section>
  )
}
