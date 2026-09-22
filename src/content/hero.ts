export type Locale = 'es' | 'en'

// Traced from the owner's supplied raster; shared by the extrusion and fallback.
export const heroMark = {
  path: 'M 155 263 C 146 263 143 258 148 249 L 211 140 C 219 126 229 117 241 117 C 258 116 269 131 286 159 L 268 155 C 258 140 251 133 243 133 C 235 133 229 140 223 150 L 165 249 L 200 249 L 236 188 C 245 171 254 163 266 162 C 280 161 291 169 298 182 L 336 248 C 342 258 338 263 328 263 L 278 263 L 246 209 L 255 194 L 287 249 L 320 249 L 285 189 C 279 179 274 177 268 177 C 261 177 255 182 249 192 L 208 263 Z',
  fallback: '/brand/aetherys-mark.svg',
}

export interface HeroContent {
  menu: string
  openMenu: string
  closeMenu: string
  close: string
  navigation: string
  sectionsLabel: string
  projectsLabel: string
  homeLabel: string
  servicesLabel: string
  aboutLabel: string
  brand: string
  home: string
  skip: string
  language: string
  spanish: string
  english: string
  es: string
  en: string
  eyebrow: string
  heading: string
  description: string
  title: string
}

export const content: Record<Locale, HeroContent> = {
  es: {
    menu: 'Menú',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    close: 'Cerrar',
    navigation: 'Navegación principal',
    sectionsLabel: 'Secciones',
    projectsLabel: 'Proyectos',
    homeLabel: 'Inicio',
    servicesLabel: 'Servicios',
    aboutLabel: 'Empresa',
    brand: 'Aetherys',
    home: 'Aetherys — inicio',
    skip: 'Ir al contenido',
    language: 'Idioma',
    spanish: 'Cambiar a español',
    english: 'Cambiar a inglés',
    es: 'ES',
    en: 'EN',
    eyebrow: 'Desarrollo de software a medida',
    heading: 'Tecnología a la medida de lo que imaginas.',
    description:
      'Diseñamos y desarrollamos sitios web, plataformas y soluciones con IA. Te acompañamos desde la primera idea hasta su puesta en marcha.',
    title: 'Aetherys — Software a medida',
  },
  en: {
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    close: 'Close',
    navigation: 'Main navigation',
    sectionsLabel: 'Sections',
    projectsLabel: 'Projects',
    homeLabel: 'Home',
    servicesLabel: 'Services',
    aboutLabel: 'About',
    brand: 'Aetherys',
    home: 'Aetherys — home',
    skip: 'Skip to content',
    language: 'Language',
    spanish: 'Switch to Spanish',
    english: 'Switch to English',
    es: 'ES',
    en: 'EN',
    eyebrow: 'Custom software development',
    heading: 'Technology tailored to what you imagine.',
    description:
      'We design and build websites, platforms, and AI solutions. We work with you from the first idea through launch.',
    title: 'Aetherys — Custom software',
  },
}
