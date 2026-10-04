export type Locale = 'es' | 'en'

// Traced from the owner's supplied raster; shared by the extrusion and fallback.
export const heroMark = {
  scale: 1.12,
  path: 'M 155 263 C 146 263 143 258 148 249 L 211 140 C 219 126 229 117 241 117 C 258 116 269 131 286 159 L 268 155 C 258 140 251 133 243 133 C 235 133 229 140 223 150 L 165 249 L 200 249 L 236 188 C 245 171 254 163 266 162 C 280 161 291 169 298 182 L 336 248 C 342 258 338 263 328 263 L 278 263 L 246 209 L 255 194 L 287 249 L 320 249 L 285 189 C 279 179 274 177 268 177 C 261 177 255 182 249 192 L 208 263 Z',
  fallback: '/brand/aetherys-mark.svg',
}

export interface HeroContent {
  menu: string
  openMenu: string
  closeMenu: string
  close: string
  playMusic: string
  stopMusic: string
  contact: string
  contactPending: string
  navigation: string
  sectionsLabel: string
  projectsLabel: string
  homeLabel: string
  brand: string
  home: string
  skip: string
  language: string
  spanish: string
  english: string
  es: string
  en: string
  eyebrow: string
  localTime: string
  highlights: [string, string, string]
  heading: string
  description: string
  title: string
  showreel: {
    label: string
    open: string
    play: string
    pause: string
    replay: string
    instructions: string
    summary: string
    reducedMotion: string
    words: [string, string, string]
    craft: string
    services: [string, string, string, string]
    closing: string
  }
}

export const content: Record<Locale, HeroContent> = {
  es: {
    menu: 'Menú',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    close: 'Cerrar',
    playMusic: 'Reproducir música',
    stopMusic: 'Detener música',
    contact: 'Contacto',
    contactPending: 'Contacto — próximamente',
    navigation: 'Navegación principal',
    sectionsLabel: 'Secciones',
    projectsLabel: 'Proyectos',
    homeLabel: 'Inicio',
    brand: 'Aetherys',
    home: 'Aetherys — inicio',
    skip: 'Ir al contenido',
    language: 'Idioma',
    spanish: 'Cambiar a español',
    english: 'Cambiar a inglés',
    es: 'ES',
    en: 'EN',
    eyebrow: 'Desarrollo de software a medida',
    localTime: 'Hora local',
    highlights: ['Software a medida', 'Integración de IA', 'Acompañamiento cercano'],
    heading: 'Tecnología a la medida de lo que imaginas.',
    description:
      'Diseñamos y desarrollamos sitios web, plataformas y soluciones con IA. Te acompañamos desde la primera idea hasta su puesta en marcha.',
    title: 'Aetherys — Software a medida',
    showreel: {
      label: '/SHOWREEL',
      open: 'Ver showreel de Aetherys',
      play: 'Reproducir',
      pause: 'Pausar',
      replay: 'Volver a reproducir',
      instructions:
        'Haz clic en la animación para pausar o continuar; al terminar, haz clic para repetir. Con teclado, usa Espacio o Enter. Haz clic fuera o pulsa Escape para cerrar.',
      summary:
        'Aetherys. Imagina, diseña, construye. Desarrollo web, plataformas a medida, integración de IA y modernización de sistemas. De tu idea a su puesta en marcha.',
      reducedMotion: 'Versión estática · movimiento reducido',
      words: ['Imagina.', 'Diseña.', 'Construye.'],
      craft: 'Tecnología con intención.',
      services: ['Desarrollo web', 'Plataformas a medida', 'Integración de IA', 'Modernización'],
      closing: 'De tu idea a su puesta en marcha.',
    },
  },
  en: {
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    close: 'Close',
    playMusic: 'Play music',
    stopMusic: 'Stop music',
    contact: 'Contact',
    contactPending: 'Contact — coming soon',
    navigation: 'Main navigation',
    sectionsLabel: 'Sections',
    projectsLabel: 'Projects',
    homeLabel: 'Home',
    brand: 'Aetherys',
    home: 'Aetherys — home',
    skip: 'Skip to content',
    language: 'Language',
    spanish: 'Switch to Spanish',
    english: 'Switch to English',
    es: 'ES',
    en: 'EN',
    eyebrow: 'Custom software development',
    localTime: 'Local time',
    highlights: ['Custom software', 'AI integration', 'Guidance at every step'],
    heading: 'Technology tailored to what you imagine.',
    description:
      'We design and build websites, platforms, and AI solutions. We work with you from the first idea through launch.',
    title: 'Aetherys — Custom software',
    showreel: {
      label: '/SHOWREEL',
      open: 'Watch the Aetherys showreel',
      play: 'Play',
      pause: 'Pause',
      replay: 'Replay',
      instructions:
        'Click the animation to pause or continue; when it ends, click to replay. With a keyboard, use Space or Enter. Click outside or press Escape to close.',
      summary:
        'Aetherys. Imagine, design, build. Web development, custom platforms, AI integration and system modernization. From your idea to launch.',
      reducedMotion: 'Static version · reduced motion',
      words: ['Imagine.', 'Design.', 'Build.'],
      craft: 'Technology with intention.',
      services: ['Web development', 'Custom platforms', 'AI integration', 'Modernization'],
      closing: 'From your idea to launch.',
    },
  },
}
