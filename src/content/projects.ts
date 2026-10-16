import type { Locale } from './hero'

export type MarkVariant = 'grotesque' | 'contrast' | 'geometric' | 'mono' | 'slab' | 'display'

export const projectLogoPaths: Record<string, string> = {
  sigsor: '/proyectos/proyecto-sigsor-logo.svg',
  impulso: '/proyectos/proyecto-impulso-logo.svg',
  smyt: '/proyectos/proyecto-smyt-logo.svg',
  flow: '/proyectos/proyecto-flow-logo.svg',
  buap: '/proyectos/proyecto-buap-logo.svg',
  gaucho: '/proyectos/proyecto-gaucho-logo.svg',
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
        image: '/proyectos/proyecto-sigsor-fondo.jpg',
        imageAlt: 'Captura de pantalla de Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-impulso',
        image: '/proyectos/proyecto-impulso-fondo.jpeg',
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
        image: '/proyectos/proyecto-smyt-fondo.jpeg',
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
        image: '/proyectos/proyecto-flow-fondo.jpg',
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
        image: '/proyectos/proyecto-buap-fondo.jpg',
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
        image: '/proyectos/proyecto-gaucho-fondo.jpg',
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
        image: '/proyectos/proyecto-sigsor-fondo.jpg',
        imageAlt: 'Screenshot of Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-impulso',
        image: '/proyectos/proyecto-impulso-fondo.jpeg',
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
        image: '/proyectos/proyecto-smyt-fondo.jpeg',
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
        image: '/proyectos/proyecto-flow-fondo.jpg',
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
        image: '/proyectos/proyecto-buap-fondo.jpg',
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
        image: '/proyectos/proyecto-gaucho-fondo.jpg',
        imageAlt: 'Screenshot of Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
}

export function projectHref(slug: string, locale: Locale): string {
  return locale === 'en' ? `/proyectos/${slug}?lang=en` : `/proyectos/${slug}`
}

export function projectsHref(locale: Locale): string {
  return locale === 'en' ? '/proyectos?lang=en' : '/proyectos'
}

export function findProject(content: ProjectsContent, slug: string): ProjectCard | undefined {
  return content.cards.find((card) => card.slug === slug)
}

export function findProjectIndex(content: ProjectsContent, slug: string): number {
  return content.cards.findIndex((card) => card.slug === slug)
}
