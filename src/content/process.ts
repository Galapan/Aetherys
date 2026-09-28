import type { Locale } from './hero'

// Placeholder dates: invented for layout only, replace with real durations before launch.
export interface ProcessStep {
  id: string
  index: string
  title: string
  date: string
  description: string
}

export interface ProcessContent {
  eyebrow: string
  steps: ProcessStep[]
}

export const content: Record<Locale, ProcessContent> = {
  es: {
    eyebrow: '/PROCESO',
    steps: [
      {
        id: 'strategy',
        index: '/1',
        title: 'Estrategia',
        date: 'Semana 1 — 2',
        description:
          'Definimos una estrategia de marca clara para posicionar tu proyecto y crear valor a largo plazo.',
      },
      {
        id: 'artistic-direction',
        index: '/2',
        title: 'Dirección de arte',
        date: 'Semana 3 — 4',
        description:
          'Creamos una identidad visual fuerte y distintiva que refleje el ADN de tu marca.',
      },
      {
        id: 'web-development',
        index: '/3',
        title: 'Desarrollo web',
        date: 'Semana 5 — 6',
        description:
          'Construimos experiencias digitales rápidas, inmersivas y escalables para el crecimiento a largo plazo.',
      },
    ],
  },
  en: {
    eyebrow: '/PROCESS',
    steps: [
      {
        id: 'strategy',
        index: '/1',
        title: 'Strategy',
        date: 'Week 1 — 2',
        description:
          'Defining a clear brand strategy to position your project and create long-term value.',
      },
      {
        id: 'artistic-direction',
        index: '/2',
        title: 'Artistic direction',
        date: 'Week 3 — 4',
        description:
          'Crafting a strong and distinctive visual identity that reflects your brand’s DNA.',
      },
      {
        id: 'web-development',
        index: '/3',
        title: 'Web development',
        date: 'Week 5 — 6',
        description:
          'Building fast, immersive, and scalable digital experiences for long-term growth.',
      },
    ],
  },
}
