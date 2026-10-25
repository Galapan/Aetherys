import type { Locale } from './hero'
import { routes, withLocale } from '@/routes'

export type MarkVariant = 'grotesque' | 'contrast' | 'geometric' | 'mono' | 'slab' | 'display'

export const projectLogoPaths: Record<string, string> = {
  sigsor: '/media/projects/proyecto-sigsor-logo.svg',
  impulso: '/media/projects/proyecto-impulso-logo.svg',
  smyt: '/media/projects/proyecto-smyt-logo.svg',
  flow: '/media/projects/proyecto-flow-logo.svg',
  buap: '/media/projects/proyecto-buap-logo.webp',
  gaucho: '/media/projects/proyecto-gaucho-logo.svg',
}

// Downscaled variants generated next to each full-size background (-960/-1600.webp).
// FLOW is only 798px wide, so it ships the original alone.
const responsiveWidths = [960, 1600]
const fullWidths: Record<string, number> = {
  sigsor: 3410,
  impulso: 2944,
  smyt: 2944,
  buap: 3413,
  gaucho: 3620,
}

export function projectImageSrcSet(card: Pick<ProjectCard, 'slug' | 'image'>): string | undefined {
  const full = fullWidths[card.slug]
  if (!full) return undefined
  const base = card.image.replace(/\.webp$/, '')
  return [...responsiveWidths.map((w) => `${base}-${w}.webp ${w}w`), `${card.image} ${full}w`].join(
    ', ',
  )
}

export interface ProjectPresentation {
  src: string
  srcSet?: string
  alt: string
  width: number
  height: number
}

/** Labelled block shown under the presentation image, e.g. "/APPROACH". */
export interface ProjectSection {
  label: string
  body: string
}

/** Empty graphite frame used to sketch a project gallery layout. */
export type ProjectGalleryBlock = 'full' | 'half' | 'large' | 'medium' | 'small' | 'wide'

/** Layout used by every project page that doesn't define its own `gallery`. */
export const defaultProjectGallery: ProjectGalleryBlock[] = [
  'medium',
  'full',
  'wide',
  'half',
  'half',
]

/** Looping video rendered inside the medium gallery block. */
export interface ProjectGalleryVideo {
  src: string
  label: string
}

/** Image rendered inside the wide gallery block. */
export interface ProjectGalleryImage {
  src: string
  srcSet?: string
  alt: string
  width: number
  height: number
}

/** Screenshots shown side by side over a decorative backdrop. */
export interface ProjectGalleryShowcase {
  background: ProjectGalleryImage
  images: ProjectGalleryImage[]
}

/** Wide backdrop that frames an optional looping video in its centre. */
export interface ProjectVideoBackground {
  src: string
  srcSet?: string
  alt: string
  width: number
  height: number
  video?: string
}

export interface ProjectCard {
  id: string
  slug: string
  title: string
  year?: string
  category: string
  image: string
  imageAlt: string
  mark: string
  markVariant: MarkVariant
  summary?: string
  sections?: ProjectSection[]
  presentation?: ProjectPresentation
  videoBackground?: ProjectVideoBackground
  galleryVideo?: ProjectGalleryVideo
  galleryWideVideo?: ProjectGalleryVideo
  galleryImage?: ProjectGalleryImage
  /** Image that fills the full-bleed gallery block. */
  galleryFullImage?: ProjectGalleryImage
  /** Screenshots for the carousel under the gallery; empty slides are shown without it. */
  galleryCarousel?: ProjectGalleryImage[]
  /** Content for the half gallery blocks, assigned in order of appearance. */
  galleryHalves?: ProjectGalleryShowcase[]
  gallery?: ProjectGalleryBlock[]
}

export interface ProjectsContent {
  eyebrow: string
  sideLabel: string
  cards: ProjectCard[]
  detail: {
    back: string
    /** Small eyebrow above the summary on the project page. */
    context: string
    carousel: {
      label: string
      previous: string
      next: string
    }
  }
}

export const content: Record<Locale, ProjectsContent> = {
  es: {
    eyebrow: '/PROYECTOS',
    sideLabel: 'WEB',
    detail: {
      back: 'Volver a proyectos',
      context: '/CONTEXTO',
      carousel: {
        label: 'Galería de capturas',
        previous: 'Anterior',
        next: 'Siguiente',
      },
    },
    cards: [
      {
        title: 'Sigsor',
        slug: 'sigsor',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-sigsor',
        image: '/media/projects/proyecto-sigsor-fondo.webp',
        imageAlt: 'Captura de pantalla de Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
        summary:
          'SIGSOR (Sistema Integral de Gestión de Soporte y Red) es una plataforma web para el Departamento de Soporte Técnico y Redes de IT Global Knowledge in System Solutions. Antes, las solicitudes de soporte llegaban por llamadas y mensajes de WhatsApp, lo que impedía priorizar incidencias, medir tiempos de respuesta y conservar un historial de cada atención.',
        sections: [
          {
            label: '/ENFOQUE',
            body: 'SIGSOR reúne en un solo lugar el registro, seguimiento y resolución de las solicitudes. GloBot, un asistente conversacional apoyado por IA, captura cada solicitud, resuelve las consultas sencillas y escala a un técnico las que no puede resolver. El equipo técnico trabaja sobre un tablero Kanban en tiempo real, y un módulo de inventario vincula cada equipo de TI con su historial de incidencias. Se construyó con Scrum en ocho sprints de dos semanas, sobre Next.js, TypeScript, Prisma y PostgreSQL, con acceso por roles para empleados, técnicos y administradores.',
          },
          {
            label: '/RESULTADO',
            body: 'El departamento pasó de un soporte reactivo a uno estructurado, medible y trazable: cada solicitud tiene folio, historial y tiempos de atención, y un panel administrativo con indicadores permite supervisar el servicio. Se entregaron 30 de los 32 requerimientos funcionales y la totalidad de los no funcionales, y la plataforma quedó lista para operar en producción al cierre del proyecto.',
          },
        ],
        presentation: {
          src: '/media/projects/presentaciones/sigsorlaptopnormal.webp',
          srcSet:
            '/media/projects/presentaciones/sigsorlaptopnormal-960.webp 960w, /media/projects/presentaciones/sigsorlaptopnormal-1600.webp 1600w, /media/projects/presentaciones/sigsorlaptopnormal.webp 2560w',
          alt: 'Presentación del proyecto Sigsor',
          width: 2560,
          height: 1182,
        },
        videoBackground: {
          src: '/media/projects/proyecto-sigsor-video-fondo.webp',
          srcSet:
            '/media/projects/proyecto-sigsor-video-fondo-960.webp 960w, /media/projects/proyecto-sigsor-video-fondo-1600.webp 1600w, /media/projects/proyecto-sigsor-video-fondo.webp 2560w',
          alt: 'Fondo del video de Sigsor',
          width: 2560,
          height: 1440,
          video: '/media/projects/videos/SigsorReveal-web.mp4',
        },
        galleryVideo: {
          src: '/media/projects/videos/SigsorLogin-web.mp4',
          label: 'Demostración del inicio de sesión de Sigsor',
        },
        galleryWideVideo: {
          src: '/media/projects/videos/SigsorTablero-web.mp4',
          label: 'Demostración del tablero de Sigsor',
        },
        galleryImage: {
          src: '/media/projects/MasFondosSigsor/Sigsor2fondo-2560.webp',
          srcSet:
            '/media/projects/MasFondosSigsor/Sigsor2fondo-960.webp 960w, /media/projects/MasFondosSigsor/Sigsor2fondo-1600.webp 1600w, /media/projects/MasFondosSigsor/Sigsor2fondo-2560.webp 2560w',
          alt: '',
          width: 2944,
          height: 1472,
        },
        galleryFullImage: {
          src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-2560.webp',
          srcSet:
            '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-960.webp 960w, /media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-1600.webp 1600w, /media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-2560.webp 2560w',
          alt: 'Sigsor en un iPhone sostenido en la mano',
          width: 2560,
          height: 1440,
        },
        galleryCarousel: [
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-inventario-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-inventario-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-inventario-1600.webp 1600w',
            alt: 'Tablero de inventario de Sigsor',
            width: 1600,
            height: 900,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-importar-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-importar-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-importar-1600.webp 1600w',
            alt: 'Importación masiva de inventario desde CSV en Sigsor',
            width: 1600,
            height: 900,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-1600.webp 1600w',
            alt: 'Catálogo de hardware de Sigsor',
            width: 1600,
            height: 906,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-1600.webp 1600w',
            alt: 'Conciliación de inventario de Sigsor',
            width: 1600,
            height: 900,
          },
        ],
        galleryHalves: [
          {
            background: {
              src: '/media/projects/MasFondosSigsor/SigsorFondotelefonos-1600.webp',
              srcSet:
                '/media/projects/MasFondosSigsor/SigsorFondotelefonos-960.webp 960w, /media/projects/MasFondosSigsor/SigsorFondotelefonos-1600.webp 1600w',
              alt: '',
              width: 2400,
              height: 1170,
            },
            images: [
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-1.webp',
                alt: 'Vista móvil de Sigsor: inicio del chat con GloBot',
                width: 324,
                height: 704,
              },
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-2.webp',
                alt: 'Vista móvil de Sigsor: creación de una solicitud en el chat',
                width: 391,
                height: 849,
              },
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-3.webp',
                alt: 'Vista móvil de Sigsor: menú con historial y herramientas',
                width: 324,
                height: 705,
              },
            ],
          },
          {
            background: {
              src: '/media/projects/MasFondosSigsor/fondoBuscador-1600.webp',
              srcSet:
                '/media/projects/MasFondosSigsor/fondoBuscador-960.webp 960w, /media/projects/MasFondosSigsor/fondoBuscador-1600.webp 1600w',
              alt: '',
              width: 2400,
              height: 1350,
            },
            images: [
              {
                src: '/media/projects/MasFondosSigsor/buscador-1600.webp',
                srcSet:
                  '/media/projects/MasFondosSigsor/buscador-960.webp 960w, /media/projects/MasFondosSigsor/buscador-1600.webp 1600w',
                alt: 'Buscador de Sigsor con accesos y acciones rápidas',
                width: 2559,
                height: 1439,
              },
            ],
          },
        ],
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-impulso',
        image: '/media/projects/proyecto-impulso-fondo.webp',
        imageAlt: 'Captura de pantalla de Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'SMyT',
        slug: 'smyt',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-proyecto-03',
        image: '/media/projects/proyecto-smyt-fondo.webp',
        imageAlt: 'Captura de pantalla de SMyT',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        slug: 'flow',
        year: '2026',
        category: 'Desarrollo web',
        id: 'proyecto-flow',
        image: '/media/projects/proyecto-flow-fondo.webp',
        imageAlt: 'Captura de pantalla de FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        slug: 'buap',
        year: '2026',
        category: 'Modernización de sistemas',
        id: 'proyecto-buap',
        image: '/media/projects/proyecto-buap-fondo.webp',
        imageAlt: 'Captura de pantalla de BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        slug: 'gaucho',
        year: '2026',
        category: 'Plataforma SaaS',
        id: 'proyecto-gaucho',
        image: '/media/projects/proyecto-gaucho-fondo.webp',
        imageAlt: 'Captura de pantalla de Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
  en: {
    eyebrow: '/PROJECTS',
    sideLabel: 'WEB',
    detail: {
      back: 'Back to projects',
      context: '/CONTEXT',
      carousel: {
        label: 'Screenshot gallery',
        previous: 'Previous',
        next: 'Next',
      },
    },
    cards: [
      {
        title: 'Sigsor',
        slug: 'sigsor',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-sigsor',
        image: '/media/projects/proyecto-sigsor-fondo.webp',
        imageAlt: 'Screenshot of Sigsor',
        mark: 'S',
        markVariant: 'grotesque',
        summary:
          'SIGSOR (Comprehensive Support and Network Management System) is a web platform for the Technical Support and Networks Department at IT Global Knowledge in System Solutions. Support requests used to arrive through phone calls and WhatsApp messages, which made it impossible to prioritize incidents, measure response times, or keep a history of each case.',
        sections: [
          {
            label: '/APPROACH',
            body: "SIGSOR brings the registration, tracking, and resolution of requests into one place. GloBot, an AI-assisted conversational assistant, captures each request, solves simple questions, and escalates to a technician the ones it can't resolve. The technical team works on a real-time Kanban board, and an inventory module links every IT asset to its incident history. It was built with Scrum in eight two-week sprints on Next.js, TypeScript, Prisma, and PostgreSQL, with role-based access for employees, technicians, and administrators.",
          },
          {
            label: '/RESULT',
            body: 'The department moved from reactive support to a structured, measurable, and traceable process: every request has a tracking number, a history, and response times, and an admin dashboard with metrics lets the team oversee the service. 30 of the 32 functional requirements and all of the non-functional ones were delivered, and the platform was ready to run in production when the project closed.',
          },
        ],
        presentation: {
          src: '/media/projects/presentaciones/sigsorlaptopnormal.webp',
          srcSet:
            '/media/projects/presentaciones/sigsorlaptopnormal-960.webp 960w, /media/projects/presentaciones/sigsorlaptopnormal-1600.webp 1600w, /media/projects/presentaciones/sigsorlaptopnormal.webp 2560w',
          alt: 'Sigsor project presentation',
          width: 2560,
          height: 1182,
        },
        videoBackground: {
          src: '/media/projects/proyecto-sigsor-video-fondo.webp',
          srcSet:
            '/media/projects/proyecto-sigsor-video-fondo-960.webp 960w, /media/projects/proyecto-sigsor-video-fondo-1600.webp 1600w, /media/projects/proyecto-sigsor-video-fondo.webp 2560w',
          alt: 'Sigsor video backdrop',
          width: 2560,
          height: 1440,
          video: '/media/projects/videos/SigsorReveal-web.mp4',
        },
        galleryVideo: {
          src: '/media/projects/videos/SigsorLogin-web.mp4',
          label: 'Sigsor sign-in demo',
        },
        galleryWideVideo: {
          src: '/media/projects/videos/SigsorTablero-web.mp4',
          label: 'Sigsor dashboard demo',
        },
        galleryImage: {
          src: '/media/projects/MasFondosSigsor/Sigsor2fondo-2560.webp',
          srcSet:
            '/media/projects/MasFondosSigsor/Sigsor2fondo-960.webp 960w, /media/projects/MasFondosSigsor/Sigsor2fondo-1600.webp 1600w, /media/projects/MasFondosSigsor/Sigsor2fondo-2560.webp 2560w',
          alt: '',
          width: 2944,
          height: 1472,
        },
        galleryFullImage: {
          src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-2560.webp',
          srcSet:
            '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-960.webp 960w, /media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-1600.webp 1600w, /media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/fondoSigsorIphone-2560.webp 2560w',
          alt: 'Sigsor on an iPhone held in hand',
          width: 2560,
          height: 1440,
        },
        galleryCarousel: [
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-inventario-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-inventario-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-inventario-1600.webp 1600w',
            alt: 'Sigsor inventory dashboard',
            width: 1600,
            height: 900,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-importar-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-importar-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-importar-1600.webp 1600w',
            alt: 'Sigsor bulk inventory import from CSV',
            width: 1600,
            height: 900,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-catalogo-1600.webp 1600w',
            alt: 'Sigsor hardware catalog',
            width: 1600,
            height: 906,
          },
          {
            src: '/media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-1600.webp',
            srcSet:
              '/media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-960.webp 960w, /media/projects/MasFondosSigsor/carrusel/sigsor-conciliacion-1600.webp 1600w',
            alt: 'Sigsor inventory reconciliation',
            width: 1600,
            height: 900,
          },
        ],
        galleryHalves: [
          {
            background: {
              src: '/media/projects/MasFondosSigsor/SigsorFondotelefonos-1600.webp',
              srcSet:
                '/media/projects/MasFondosSigsor/SigsorFondotelefonos-960.webp 960w, /media/projects/MasFondosSigsor/SigsorFondotelefonos-1600.webp 1600w',
              alt: '',
              width: 2400,
              height: 1170,
            },
            images: [
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-1.webp',
                alt: 'Sigsor mobile view: GloBot chat start',
                width: 324,
                height: 704,
              },
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-2.webp',
                alt: 'Sigsor mobile view: creating a request in the chat',
                width: 391,
                height: 849,
              },
              {
                src: '/media/projects/MasFondosSigsor/imagenesTelefonoSIGSOR/sigsor-movil-3.webp',
                alt: 'Sigsor mobile view: menu with history and tools',
                width: 324,
                height: 705,
              },
            ],
          },
          {
            background: {
              src: '/media/projects/MasFondosSigsor/fondoBuscador-1600.webp',
              srcSet:
                '/media/projects/MasFondosSigsor/fondoBuscador-960.webp 960w, /media/projects/MasFondosSigsor/fondoBuscador-1600.webp 1600w',
              alt: '',
              width: 2400,
              height: 1350,
            },
            images: [
              {
                src: '/media/projects/MasFondosSigsor/buscador-1600.webp',
                srcSet:
                  '/media/projects/MasFondosSigsor/buscador-960.webp 960w, /media/projects/MasFondosSigsor/buscador-1600.webp 1600w',
                alt: 'Sigsor search with quick access and quick actions',
                width: 2559,
                height: 1439,
              },
            ],
          },
        ],
      },
      {
        title: 'Impulso',
        slug: 'impulso',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-impulso',
        image: '/media/projects/proyecto-impulso-fondo.webp',
        imageAlt: 'Screenshot of Impulso',
        mark: 'I',
        markVariant: 'contrast',
      },
      {
        title: 'Project 03',
        slug: 'smyt',
        year: '2026',
        category: 'AI integration',
        id: 'proyecto-proyecto-03',
        image: '/media/projects/proyecto-smyt-fondo.webp',
        imageAlt: 'Screenshot of SMyT',
        mark: 'S',
        markVariant: 'geometric',
      },
      {
        title: 'FLOW',
        slug: 'flow',
        year: '2026',
        category: 'Web development',
        id: 'proyecto-flow',
        image: '/media/projects/proyecto-flow-fondo.webp',
        imageAlt: 'Screenshot of FLOW',
        mark: 'f',
        markVariant: 'mono',
      },
      {
        title: 'BUAP',
        slug: 'buap',
        year: '2026',
        category: 'Systems modernisation',
        id: 'proyecto-buap',
        image: '/media/projects/proyecto-buap-fondo.webp',
        imageAlt: 'Screenshot of BUAP',
        mark: 'B',
        markVariant: 'slab',
      },
      {
        title: 'Gaucho',
        slug: 'gaucho',
        year: '2026',
        category: 'SaaS platform',
        id: 'proyecto-gaucho',
        image: '/media/projects/proyecto-gaucho-fondo.webp',
        imageAlt: 'Screenshot of Gaucho',
        mark: 'G',
        markVariant: 'display',
      },
    ],
  },
}

export function projectHref(slug: string, locale: Locale): string {
  return withLocale(`${routes.projects}/${encodeURIComponent(slug)}`, locale)
}

export function projectsHref(locale: Locale): string {
  return withLocale(routes.projects, locale)
}

export function findProject(content: ProjectsContent, slug: string): ProjectCard | undefined {
  return content.cards.find((card) => card.slug === slug)
}

export function findProjectIndex(content: ProjectsContent, slug: string): number {
  return content.cards.findIndex((card) => card.slug === slug)
}
