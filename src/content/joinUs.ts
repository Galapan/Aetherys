import type { Locale } from './hero'

export interface JoinUsContent {
  eyebrow: string
  headingStart: string
  headingEmphasis: string
  headingEnd: string
  description: string
  contact: string
  photoAlt: string
  /** Shown in the second box while there is no video. */
  secondaryPhotoAlt: string
  videoLabel: string
}

// Owner's photos as 736px square WebP (originals in proyectos-originales/joinUs). The second
// box shows the video once one is supplied, and the secondary photo until then.
export const joinUsAssets: {
  photo?: string
  secondaryPhoto?: string
  video?: string
  poster?: string
} = {
  photo: '/media/joinUs/join-us-desk.webp',
  secondaryPhoto: '/media/joinUs/join-us-terminal.webp',
  video: '',
  poster: '',
}

/** Intrinsic size of the photos above, reserved to avoid layout shift. */
export const JOIN_US_PHOTO_SIZE = 736

export const content: Record<Locale, JoinUsContent> = {
  es: {
    eyebrow: '/ÚNETE',
    headingStart: 'Para',
    headingEmphasis: 'construir las marcas del mañana',
    headingEnd: 'con nosotros, es aquí.',
    description:
      'Tienes creatividad, ambición, visión estratégica y buena energía. Escríbenos y veamos qué podemos hacer juntos.',
    contact: 'Contáctanos',
    photoAlt: 'Escritorio con un monitor y una laptop mostrando código',
    secondaryPhotoAlt: 'Laptop con una terminal abierta, de noche',
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
    photoAlt: 'Desk with a monitor and a laptop showing code',
    secondaryPhotoAlt: 'Laptop with a terminal open, at night',
    videoLabel: 'A glimpse of our day-to-day work',
  },
}
