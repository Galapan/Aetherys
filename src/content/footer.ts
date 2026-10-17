import type { Locale } from './hero'

export interface FooterContent {
  label: string
  homeLabel: string
  pages: string
  socials: string
  services: string
  process: string
  backToTop: string
  /** Oversized closing word; each letter rises on its own. */
  contactWord: string
}

export const content: Record<Locale, FooterContent> = {
  es: {
    label: 'Pie de página',
    homeLabel: 'Aetherys, ir al inicio',
    pages: 'Páginas',
    socials: 'Redes',
    services: 'Servicios',
    process: 'Proceso',
    backToTop: 'Volver arriba',
    contactWord: 'Contacto',
  },
  en: {
    label: 'Footer',
    homeLabel: 'Aetherys, go to top',
    pages: 'Pages',
    socials: 'Socials',
    services: 'Services',
    process: 'Process',
    backToTop: 'Back to top',
    contactWord: 'Contact',
  },
}
