import type { Locale } from './hero'

export type MarkVariant = 'grotesque' | 'contrast' | 'geometric' | 'mono' | 'slab' | 'display'

export interface ProjectCard {
  title: string
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
        category: 'Desarrollo web',
        image: '/proyectos/proyecto-01.jpg',
        imageAlt: 'Captura de pantalla de Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        category: 'Plataforma SaaS',
        image: '/proyectos/proyecto-02.jpg',
        imageAlt: 'Captura de pantalla de Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'Proyecto 03',
        category: 'Integración de IA',
        image: '/proyectos/proyecto-03.jpg',
        imageAlt: 'Captura de pantalla del proyecto 03',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        category: 'Desarrollo web',
        image: '/proyectos/proyecto-04.jpg',
        imageAlt: 'Captura de pantalla de FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        category: 'Modernización de sistemas',
        image: '/proyectos/proyecto-05.jpg',
        imageAlt: 'Captura de pantalla de BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        category: 'Plataforma SaaS',
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
        category: 'Web development',
        image: '/proyectos/proyecto-01.jpg',
        imageAlt: 'Screenshot of Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
      },
      {
        title: 'Impulso',
        category: 'SaaS platform',
        image: '/proyectos/proyecto-02.jpg',
        imageAlt: 'Screenshot of Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'Project 03',
        category: 'AI integration',
        image: '/proyectos/proyecto-03.jpg',
        imageAlt: 'Screenshot of project 03',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        category: 'Web development',
        image: '/proyectos/proyecto-04.jpg',
        imageAlt: 'Screenshot of FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        category: 'Systems modernisation',
        image: '/proyectos/proyecto-05.jpg',
        imageAlt: 'Screenshot of BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        category: 'SaaS platform',
        image: '/proyectos/proyecto-06.jpg',
        imageAlt: 'Screenshot of Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
}
