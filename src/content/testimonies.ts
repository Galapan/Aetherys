import type { Locale } from './hero'

export interface Testimony {
  id: string
  quote: string
  name: string
  detail: string
  imageAlt: string
}

export interface TestimoniesContent {
  eyebrow: string
  carouselLabel: string
  previous: string
  next: string
  items: Testimony[]
}

export const testimonyImages: Record<string, string> = {
  'bastian-alessandro': '/teamPFP/galapan.jpg',
  'placeholder-1': '',
  'placeholder-2': '',
  'placeholder-3': '',
}

const placeholderQuotes = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat.',
]

export const content: Record<Locale, TestimoniesContent> = {
  es: {
    eyebrow: '/TESTIMONIOS',
    carouselLabel: 'Testimonios destacados',
    previous: 'Testimonio anterior',
    next: 'Testimonio siguiente',
    items: [
      {
        id: 'bastian-alessandro',
        quote:
          'Siempre he creído que lo que no se ve bien, no vende, por eso uno de los trabajos más importantes es la primera impresión hacia nuestros clientes.',
        name: 'Bastian Alessandro',
        detail: 'Desarrollador web full stack',
        imageAlt: 'Retrato de Bastian Alessandro',
      },
      ...placeholderQuotes.map((quote, index) => ({
        id: `placeholder-${index + 1}`,
        quote,
        name: 'Lorem ipsum',
        detail: 'Texto provisional',
        imageAlt: 'Imagen de perfil provisional',
      })),
    ],
  },
  en: {
    eyebrow: '/TESTIMONIES',
    carouselLabel: 'Featured testimonies',
    previous: 'Previous testimony',
    next: 'Next testimony',
    items: [
      {
        id: 'bastian-alessandro',
        quote:
          "I've always believed that what doesn't look good doesn't sell. That's why making a strong first impression on our clients is one of the most important parts of our work.",
        name: 'Bastian Alessandro',
        detail: 'Full-stack web developer',
        imageAlt: 'Portrait of Bastian Alessandro',
      },
      ...placeholderQuotes.map((quote, index) => ({
        id: `placeholder-${index + 1}`,
        quote,
        name: 'Lorem ipsum',
        detail: 'Placeholder text',
        imageAlt: 'Placeholder profile image',
      })),
    ],
  },
}
