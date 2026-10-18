import type { Locale } from './hero'
import { routes, withLocale } from '@/routes'

export type MarkVariant = 'grotesque' | 'contrast' | 'geometric' | 'mono' | 'slab' | 'display'

export const projectLogoPaths: Record<string, string> = {
  sigsor: '/media/projects/proyecto-sigsor-logo.svg',
  impulso: '/media/projects/proyecto-impulso-logo.svg',
  smyt: '/media/projects/proyecto-smyt-logo.svg',
  flow: '/media/projects/proyecto-flow-logo.svg',
  buap: '/media/projects/proyecto-buap-logo.webp',
  gaucho: '/media/projects/proyecto-gaucho-logo.svg',
}

// Downscaled variants generated next to each full-size background (-960/-1600.webp).
// FLOW is only 798px wide, so it ships the original alone.
const responsiveWidths = [960, 1600]
const fullWidths: Record<string, number> = {
  sigsor: 3410,
  impulso: 2944,
  smyt: 2944,
  buap: 3413,
  gaucho: 3620,
}

export function projectImageSrcSet(card: Pick<ProjectCard, 'slug' | 'image'>): string | undefined {
  const full = fullWidths[card.slug]
  if (!full) return undefined
  const base = card.image.replace(/\.webp$/, '')
  return [...responsiveWidths.map((w) => `${base}-${w}.webp ${w}w`), `${card.image} ${full}w`].join(
    ', ',
  )
}

export interface ProjectPresentation {
  src: string
  srcSet?: string
  alt: string
  width: number
  height: number
}

export interface ProjectCard {
  id: string
  slug: string
  title: string
  year?: string
  category: string
  image: string
  imageAlt: string
  mark: string
  markVariant: MarkVariant
  summary?: string
  presentation?: ProjectPresentation
}

export interface ProjectsContent {
  eyebrow: string
  sideLabel: string
  cards: ProjectCard[]
  detail: {
    back: string
    next: string
  }
}

export const content: Record<Locale, ProjectsContent> = {
  es: {
    eyebrow: '/PROYECTOS',
    sideLabel: 'WEB',
    detail: {
      back: 'Volver a proyectos',
      next: 'Siguiente proyecto',
    },
    cards: [
      {
        title: 'Sigsor',
        slug: 'sigsor',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-sigsor',
        image: '/media/projects/proyecto-sigsor-fondo.webp',
        imageAlt: 'Captura de pantalla de Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
        summary:
          'Sigsor es un proyecto de desarrollo web. Trabajamos de principio a fin: entendimos la necesidad, definimos el alcance y construimos el sitio priorizando la claridad y la facilidad de uso.',
        presentation: {
          src: '/media/projects/presentaciones/sigsorlaptopnormal.webp',
          srcSet:
            '/media/projects/presentaciones/sigsorlaptopnormal-960.webp 960w, /media/projects/presentaciones/sigsorlaptopnormal-1600.webp 1600w, /media/projects/presentaciones/sigsorlaptopnormal.webp 2560w',
          alt: 'Presentación del proyecto Sigsor',
          width: 2560,
          height: 1182,
        },
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-impulso',
        image: '/media/projects/proyecto-impulso-fondo.webp',
        imageAlt: 'Captura de pantalla de Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'SMyT',
        slug: 'smyt',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-proyecto-03',
        image: '/media/projects/proyecto-smyt-fondo.webp',
        imageAlt: 'Captura de pantalla de SMyT',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        slug: 'flow',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-flow',
        image: '/media/projects/proyecto-flow-fondo.webp',
        imageAlt: 'Captura de pantalla de FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        slug: 'buap',
        year: '2026',
        category: 'Modernización de sistemas',
        id: 'proyecto-buap',
        image: '/media/projects/proyecto-buap-fondo.webp',
        imageAlt: 'Captura de pantalla de BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        slug: 'gaucho',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-gaucho',
        image: '/media/projects/proyecto-gaucho-fondo.webp',
        imageAlt: 'Captura de pantalla de Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
  en: {
    eyebrow: '/PROJECTS',
    sideLabel: 'WEB',
    detail: {
      back: 'Back to projects',
      next: 'Next project',
    },
    cards: [
      {
        title: 'Sigsor',
        slug: 'sigsor',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-sigsor',
        image: '/media/projects/proyecto-sigsor-fondo.webp',
        imageAlt: 'Screenshot of Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
        summary:
          'Sigsor is a web development project. We work end to end: we understood the need, defined the scope, and built the site with a focus on clarity and ease of use.',
        presentation: {
          src: '/media/projects/presentaciones/sigsorlaptopnormal.webp',
          srcSet:
            '/media/projects/presentaciones/sigsorlaptopnormal-960.webp 960w, /media/projects/presentaciones/sigsorlaptopnormal-1600.webp 1600w, /media/projects/presentaciones/sigsorlaptopnormal.webp 2560w',
          alt: 'Sigsor project presentation',
          width: 2560,
          height: 1182,
        },
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-impulso',
        image: '/media/projects/proyecto-impulso-fondo.webp',
        imageAlt: 'Screenshot of Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'Project 03',
        slug: 'smyt',
        year: '2026',
        category: 'AI integration',
        id: 'proyecto-proyecto-03',
        image: '/media/projects/proyecto-smyt-fondo.webp',
        imageAlt: 'Screenshot of SMyT',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        slug: 'flow',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-flow',
        image: '/media/projects/proyecto-flow-fondo.webp',
        imageAlt: 'Screenshot of FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        slug: 'buap',
        year: '2026',
        category: 'Systems modernisation',
        id: 'proyecto-buap',
        image: '/media/projects/proyecto-buap-fondo.webp',
        imageAlt: 'Screenshot of BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        slug: 'gaucho',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-gaucho',
        image: '/media/projects/proyecto-gaucho-fondo.webp',
        imageAlt: 'Screenshot of Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
}

export function projectHref(slug: string, locale: Locale): string {
  return withLocale(`${routes.projects}/${encodeURIComponent(slug)}`, locale)
}

export function projectsHref(locale: Locale): string {
  return withLocale(routes.projects, locale)
}

export function findProject(content: ProjectsContent, slug: string): ProjectCard | undefined {
  return content.cards.find((card) => card.slug === slug)
}

export function findProjectIndex(content: ProjectsContent, slug: string): number {
  return content.cards.findIndex((card) => card.slug === slug)
}
