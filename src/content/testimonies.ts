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

// Replace each empty value with the owner's image path, e.g. /images/profile-1.webp.
export const testimonyImages: Record<string, string> = {
  'placeholder-1': '',
  'placeholder-2': '',
  'placeholder-3': '',
}

const quotes = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat.',
]

export const content: Record<Locale, TestimoniesContent> = {
  es: {
    eyebrow: '/TESTIMONIOS',
    carouselLabel: 'Testimonios: contenido provisional',
    previous: 'Testimonio anterior',
    next: 'Testimonio siguiente',
    items: quotes.map((quote, index) => ({
      id: `placeholder-${index + 1}`,
      quote,
      name: 'Lorem ipsum',
      detail: 'Texto provisional',
      imageAlt: 'Imagen de perfil pendiente',
    })),
  },
  en: {
    eyebrow: '/TESTIMONIES',
    carouselLabel: 'Testimonies: placeholder content',
    previous: 'Previous testimony',
    next: 'Next testimony',
    items: quotes.map((quote, index) => ({
      id: `placeholder-${index + 1}`,
      quote,
      name: 'Lorem ipsum',
      detail: 'Placeholder text',
      imageAlt: 'Profile image pending',
    })),
  },
}
