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
  bastian: '/teamPFP/galapan.jpg',
  jesus: '/teamPFP/jesus.jpeg',
  cesar: '/teamPFP/cesar.jpeg',
  'placeholder-3': '',
}

export const content: Record<Locale, TestimoniesContent> = {
  es: {
    eyebrow: '/TESTIMONIOS',
    carouselLabel: 'Testimonios destacados',
    previous: 'Testimonio anterior',
    next: 'Testimonio siguiente',
    items: [
      {
        id: 'bastian',
        quote:
          'Lo que no se ve bien, no vende, por eso uno de los trabajos más importantes es la primera impresión hacia nuestros clientes.',
        name: 'Bastian Alessandro',
        detail: 'Desarrollador web full stack - Frontend',
        imageAlt: 'Retrato de Bastian',
      },
      {
        id: 'jesus',
        quote:
          'Desarrollo software de extremo a extremo y lidero equipos ágiles para entregar soluciones eficientes y de gran valor.',
        name: 'Jesus Hernandez',
        detail: 'Desarrollador Full stack - Scrum',
        imageAlt: 'Retrato de Jesus',
      },
      {
        id: 'cesar',
        quote: 'Comiendonos el mundo, un commit a la vez.',
        name: 'Cesar Vazquez',
        detail: 'Desarrollador full stack',
        imageAlt: 'Retrato de Cesar',
      },
    ],
  },
  en: {
    eyebrow: '/TESTIMONIES',
    carouselLabel: 'Featured testimonies',
    previous: 'Previous testimony',
    next: 'Next testimony',
    items: [
      {
        id: 'bastian',
        quote:
          'If it does not look good, it does not sell. That is why making a strong first impression on our clients is one of the most important parts of our work.',
        name: 'Bastian Alessandro',
        detail: 'Full-stack web developer - Frontend',
        imageAlt: 'Portrait of Bastian Alessandro',
      },
      {
        id: 'jesus',
        quote:
          'I develop software end to end and lead agile teams to deliver efficient, high-value solutions.',
        name: 'Jesus Hernandez',
        detail: 'Full-stack developer - Scrum',
        imageAlt: 'Portrait of Jesus Hernandez',
      },
      {
        id: 'cesar',
        quote: 'Taking on the world, one commit at a time.',
        name: 'Cesar Vazquez',
        detail: 'Full-stack developer',
        imageAlt: 'Portrait of Cesar Vazquez',
      },
    ],
  },
}
