import type { Locale } from './hero'

export interface JoinUsContent {
  eyebrow: string
  headingStart: string
  headingEmphasis: string
  headingEnd: string
  description: string
  contact: string
  photoAlt: string
  videoLabel: string
}

// Supply the owner's media and verified contact destination before publishing.
export const joinUsAssets: {
  photo?: string
  video?: string
  poster?: string
  contactHref?: string
} = {
  photo: '',
  video: '',
  poster: '',
  contactHref: '',
}

export const content: Record<Locale, JoinUsContent> = {
  es: {
    eyebrow: '/ÚNETE',
    headingStart: 'Para',
    headingEmphasis: 'construir las marcas del mañana',
    headingEnd: 'con nosotros, es aquí.',
    description:
      'Tienes creatividad, ambición, visión estratégica y buena energía. Escríbenos y veamos qué podemos hacer juntos.',
    contact: 'Contáctanos',
    photoAlt: 'Nuestro espacio de trabajo',
    videoLabel: 'Un vistazo a nuestro día a día',
  },
  en: {
    eyebrow: '/JOIN US',
    headingStart: 'To',
    headingEmphasis: 'build the brands of tomorrow',
    headingEnd: 'with us, it’s here.',
    description:
      'You are both creative, ambitious, strategic and nice. Come, we write and see what we can do together.',
    contact: 'Contact us',
    photoAlt: 'Our workspace',
    videoLabel: 'A glimpse of our day-to-day work',
  },
}
