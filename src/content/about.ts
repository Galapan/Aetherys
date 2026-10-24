import type { Locale } from './hero'
import { content as projectsContent } from './projects'
import { content as servicesContent } from './services'
import { content as testimoniesContent } from './testimonies'
import { routes, withLocale } from '@/routes'

export interface AboutValue {
  id: string
  title: string
  description: string
}

export interface AboutStat {
  id: string
  value: number
  label: string
}

export interface AboutContent {
  /** Document title prefix. */
  title: string
  heading: string
  intro: string
  valuesEyebrow: string
  values: AboutValue[]
  numbersEyebrow: string
  numbersIntro: string
  stats: AboutStat[]
  teamEyebrow: string
  teamIntro: string
  teamCallToAction: string
  teamCarouselLabel: string
  teamCarouselHint: string
}

export interface TeamPhoto {
  /** Largest WebP variant, used when srcset is not supported. */
  src: string
  srcSet: string
  position: string
}

/**
 * Card portraits as WebP variants of the originals (never upscaled past their source width);
 * names, roles and alt text come from the testimonies dictionary.
 */
export const teamPhotos: Record<string, TeamPhoto> = {
  bastian: {
    src: '/media/team/galapan-400.webp',
    srcSet: '/media/team/galapan-400.webp 400w',
    position: '50% 40%',
  },
  jesus: {
    src: '/media/team/jesus-617.webp',
    srcSet: '/media/team/jesus-480.webp 480w, /media/team/jesus-617.webp 617w',
    position: '50% 35%',
  },
  cesar: {
    src: '/media/team/cesar-768.webp',
    srcSet: '/media/team/cesar-480.webp 480w, /media/team/cesar-768.webp 768w',
    position: '50% 30%',
  },
  edgar: {
    src: '/media/team/edgar-900.webp',
    srcSet: '/media/team/edgar-480.webp 480w, /media/team/edgar-900.webp 900w',
    position: '50% 25%',
  },
}

export function teamMembers(locale: Locale) {
  return testimoniesContent[locale].items.filter((item) => item.id in teamPhotos)
}

// Counts derived from published content, so the numbers never drift from what the site shows.
function stats(locale: Locale, labels: [string, string, string]): AboutStat[] {
  return [
    { id: 'projects', value: projectsContent[locale].cards.length, label: labels[0] },
    { id: 'services', value: servicesContent[locale].services.length, label: labels[1] },
    { id: 'team', value: teamMembers(locale).length, label: labels[2] },
  ]
}

export const content: Record<Locale, AboutContent> = {
  es: {
    title: 'Nosotros',
    heading: 'Creamos Aetherys para ser el equipo de desarrollo que nos hubiera gustado encontrar.',
    intro:
      'Exigentes sin ser distantes, cercanos en cada etapa y enfocados en que la tecnología resuelva problemas reales.',
    valuesEyebrow: '/VALORES',
    values: [
      {
        id: 'quality',
        title: 'Calidad',
        description: 'Cuidamos cada detalle, del código a la experiencia final.',
      },
      {
        id: 'closeness',
        title: 'Cercanía',
        description: 'Contacto constante y comunicación clara en cada paso.',
      },
      {
        id: 'guidance',
        title: 'Acompañamiento',
        description: 'Te guiamos paso a paso, de la primera idea a la puesta en marcha.',
      },
      {
        id: 'innovation',
        title: 'Innovación',
        description: 'Probamos, aprendemos y mejoramos cada día.',
      },
    ],
    numbersEyebrow: '/NÚMEROS',
    numbersIntro:
      'Trabajar con Aetherys es saber que construiremos juntos, con comunicación constante y cuidado en cada detalle. Que tu idea funcione es nuestro primer objetivo.',
    stats: stats('es', ['Proyectos', 'Servicios', 'Integrantes']),
    teamEyebrow: '/EL EQUIPO',
    teamIntro:
      'Somos un equipo pequeño y cercano de desarrolladores que acompaña cada proyecto de principio a fin.',
    teamCallToAction: 'Cuéntanos tu proyecto',
    teamCarouselLabel: 'Integrantes del equipo',
    teamCarouselHint: 'Arrastra o usa las flechas del teclado para recorrer el equipo.',
  },
  en: {
    title: 'About',
    heading: 'We created Aetherys to be the development team we wish we had found.',
    intro:
      'Demanding without being distant, close at every stage, and focused on technology that solves real problems.',
    valuesEyebrow: '/VALUES',
    values: [
      {
        id: 'quality',
        title: 'Quality',
        description: 'We care for every detail, from the code to the final experience.',
      },
      {
        id: 'closeness',
        title: 'Closeness',
        description: 'Constant contact and clear communication at every step.',
      },
      {
        id: 'guidance',
        title: 'Guidance',
        description: 'We guide you step by step, from the first idea through launch.',
      },
      {
        id: 'innovation',
        title: 'Innovation',
        description: 'Testing, learning, and improving every day.',
      },
    ],
    numbersEyebrow: '/NUMBERS',
    numbersIntro:
      'Working with Aetherys means knowing we will build together, with constant communication and care in every detail. Making your idea work is our first objective.',
    stats: stats('en', ['Projects', 'Services', 'Team members']),
    teamEyebrow: '/THE TEAM',
    teamIntro:
      'We are a small, close-knit team of developers who stay with every project from start to finish.',
    teamCallToAction: 'Tell us about your project',
    teamCarouselLabel: 'Team members',
    teamCarouselHint: 'Drag or use the arrow keys to browse the team.',
  },
}

export function aboutHref(locale: Locale): string {
  return withLocale(routes.about, locale)
}
