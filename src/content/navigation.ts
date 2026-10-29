import type { Locale } from './hero'

export const menuContact = {
  copyright: 'Aetherys 2026',
  location: 'Tlaxcala | México',
  phone: '+52 241 414 7285',
  phoneHref: 'tel:+522414147285',
  email: 'aetherys.dev@gmail.com',
  emailHref: 'mailto:aetherys.dev@gmail.com',
}

export const menuSocials = [
  { label: 'Instagram', href: '' },
  { label: 'LinkedIn', href: '' },
]

interface MenuContent {
  about: string
  socials: string
  projects: string
  contact: string
}

export const menuContent: Record<Locale, MenuContent> = {
  es: {
    about: 'Nosotros',
    socials: 'Redes sociales',
    projects: 'Proyectos',
    contact: 'Datos de contacto',
  },
  en: {
    about: 'About',
    socials: 'Socials',
    projects: 'Projects',
    contact: 'Contact details',
  },
}
