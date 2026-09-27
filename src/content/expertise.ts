import type { Locale } from './hero'

export interface ExpertiseContent {
  eyebrow: string
  heading: string
  description: string
  cards: {
    id: string
    title: string
    image?: string
    imageWidth?: number
    imageHeight?: number
  }[]
}

export const content: Record<Locale, ExpertiseContent> = {
  es: {
    eyebrow: '/EXPERTISE',
    heading: 'Lo que podemos construir contigo.',
    description:
      'Desde tu primera web hasta una plataforma a medida. Diseñamos y desarrollamos soluciones para las necesidades de tu negocio. ',
    cards: [
      {
        id: 'fashion',
        title: 'Moda',
        image: '/expertise/fashion.jpg',
        imageWidth: 2048,
        imageHeight: 2560,
      },
      {
        id: 'finance',
        title: 'Finanzas',
        image: '/expertise/finance.jpg',
        imageWidth: 720,
        imageHeight: 360,
      },
      {
        id: 'ai',
        title: 'IA - Tech',
        image: '/expertise/tech.webp',
        imageWidth: 1365,
        imageHeight: 868,
      },
      {
        id: 'architecture',
        title: 'Arquitectura',
        image: '/expertise/architecture.jpg',
        imageWidth: 1600,
        imageHeight: 1088,
      },
      {
        id: 'cars',
        title: 'Autos',
        image: '/expertise/cars.webp',
        imageWidth: 1600,
        imageHeight: 1088,
      },
    ],
  },
  en: {
    eyebrow: '/EXPERTISE',
    heading: 'What we can build together.',
    description:
      'From your first website to a custom platform. We design and develop solutions around the needs of your business.',
    cards: [
      {
        id: 'fashion',
        title: 'Fashion',
        image: '/expertise/fashion.jpg',
        imageWidth: 2048,
        imageHeight: 2560,
      },
      {
        id: 'finance',
        title: 'Finance',
        image: '/expertise/finance.jpg',
        imageWidth: 720,
        imageHeight: 360,
      },
      {
        id: 'ai',
        title: 'AI - Tech',
        image: '/expertise/tech.webp',
        imageWidth: 1365,
        imageHeight: 868,
      },
      {
        id: 'architecture',
        title: 'Architecture',
        image: '/expertise/architecture.jpg',
        imageWidth: 1600,
        imageHeight: 1088,
      },
      {
        id: 'cars',
        title: 'Cars',
        image: '/expertise/cars.webp',
        imageWidth: 1600,
        imageHeight: 1088,
      },
    ],
  },
}
