import type { ProjectsContent } from '../content/projects'
import { Projects } from '../sections/Projects'
import { RuleGrid } from '../components/ui/RuleGrid'

interface ProyectosPageProps {
  content: ProjectsContent
  reducedMotion: boolean
  canHover: boolean
}

export function ProyectosPage({ content, reducedMotion, canHover }: ProyectosPageProps) {
  return (
    <section
      id="proyectos"
      tabIndex={-1}
      className="text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh scroll-mt-[calc(var(--header-height)+24px)] pt-[calc(var(--header-height)+clamp(32px,5vw,96px))] pb-[clamp(80px,9vw,144px)]"
      aria-labelledby="proyectos-heading"
    >
      <RuleGrid className="absolute inset-x-0 top-0 h-full" spanClassName="bg-grid-burgundy" />
      <Projects
        content={content}
        reducedMotion={reducedMotion}
        canHover={canHover}
        layout="stagger"
      />
    </section>
  )
}
