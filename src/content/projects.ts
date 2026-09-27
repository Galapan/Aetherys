import type { Locale } from './hero'

export type MarkVariant = 'grotesque' | 'contrast' | 'geometric' | 'mono' | 'slab' | 'display'

export interface ProjectCard {
  id: string
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
  cards: ProjectCard[]
}

export const content: Record<Locale, ProjectsContent> = {
  es: {
    eyebrow: '/PROYECTOS',
    cards: [
      {
        title: 'Sigsor',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-sigsor',
        image: '/proyectos/proyecto-01.jpg',
        imageAlt: 'Captura de pantalla de Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-impulso',
        image: '/proyectos/proyecto-02.jpg',
        imageAlt: 'Captura de pantalla de Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'SMyT',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-proyecto-03',
        image: '/proyectos/proyecto-03.jpg',
        imageAlt: 'Captura de pantalla del proyecto 03',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-flow',
        image: '/proyectos/proyecto-04.jpg',
        imageAlt: 'Captura de pantalla de FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        year: '2026',
        category: 'Modernización de sistemas',
        id: 'proyecto-buap',
        image: '/proyectos/proyecto-05.jpg',
        imageAlt: 'Captura de pantalla de BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-gaucho',
        image: '/proyectos/proyecto-06.jpg',
        imageAlt: 'Captura de pantalla de Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
  en: {
    eyebrow: '/PROJECTS',
    cards: [
      {
        title: 'Sigsor',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-sigsor',
        image: '/proyectos/proyecto-01.jpg',
        imageAlt: 'Screenshot of Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-impulso',
        image: '/proyectos/proyecto-02.jpg',
        imageAlt: 'Screenshot of Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'Project 03',
        year: '2026',
        category: 'AI integration',
        id: 'proyecto-proyecto-03',
        image: '/proyectos/proyecto-03.jpg',
        imageAlt: 'Screenshot of project 03',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-flow',
        image: '/proyectos/proyecto-04.jpg',
        imageAlt: 'Screenshot of FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        year: '2026',
        category: 'Systems modernisation',
        id: 'proyecto-buap',
        image: '/proyectos/proyecto-05.jpg',
        imageAlt: 'Screenshot of BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-gaucho',
        image: '/proyectos/proyecto-06.jpg',
        imageAlt: 'Screenshot of Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
}
