import type { Locale } from './hero'

export const technologies = [
  { id: 'typescript', name: 'TypeScript' },
  { id: 'react', name: 'React' },
  { id: 'framer', name: 'Framer Motion' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'tailwind', name: 'Tailwind CSS' },
  { id: 'astro', name: 'Astro' },
  { id: 'node', name: 'Node.js' },
  { id: 'pnpm', name: 'pnpm' },
  { id: 'vite', name: 'Vite' },
] as const

export interface Service {
  id: string
  title: string
  description: string
  items: string[]
}

export interface ServicesContent {
  eyebrow: string
  introduction: string
  services: Service[]
  technologyHeading: string
  technologyDescription: string
  technologyLabel: string
}

export const content: Record<Locale, ServicesContent> = {
  es: {
    eyebrow: '/SERVICIOS',
    introduction:
      'De la primera idea a la puesta en marcha. Diseñamos y desarrollamos soluciones digitales a la medida de tu negocio.',
    services: [
      {
        id: 'web',
        title: 'Desarrollo web',
        description:
          'Creamos sitios que presentan tu negocio con claridad y hacen que explorar lo que ofreces sea sencillo.',
        items: [
          'Landing pages',
          'Sitios corporativos',
          'Diseño de interfaces',
          'Diseño adaptable',
          'Animación e interacción',
          'Optimización de rendimiento',
        ],
      },
      {
        id: 'platforms',
        title: 'SaaS y sistemas a medida',
        description:
          'Convertimos tus procesos en herramientas que se adaptan a la forma de trabajar de tu equipo.',
        items: [
          'Plataformas SaaS',
          'Aplicaciones web',
          'Paneles de gestión',
          'Automatización de procesos',
          'Integración de servicios',
          'Diseño de sistemas',
        ],
      },
      {
        id: 'ai',
        title: 'Integración de IA',
        description:
          'Integramos inteligencia artificial donde puede ayudarte a simplificar tareas y aprovechar tu información.',
        items: [
          'Asistentes con IA',
          'Búsqueda de información',
          'Procesamiento de documentos',
          'Flujos de trabajo con IA',
        ],
      },
      {
        id: 'modernization',
        title: 'Modernización de sistemas',
        description:
          'Mejoramos lo que ya tienes para que tu software pueda acompañar las nuevas necesidades de tu negocio.',
        items: [
          'Diagnóstico técnico',
          'Renovación de interfaces',
          'Actualización de aplicaciones',
          'Migración de sistemas',
          'Mejoras de rendimiento',
        ],
      },
    ],
    technologyHeading: 'Tu idea marca el rumbo. Nosotros elegimos las herramientas.',
    technologyDescription:
      'Combinamos estas tecnologías según las necesidades de cada proyecto, desde la interfaz hasta la lógica que la hace funcionar.',
    technologyLabel: 'Tecnologías con las que trabajamos',
  },
  en: {
    eyebrow: '/SERVICES',
    introduction:
      'From the first idea through launch. We design and develop digital solutions tailored to your business.',
    services: [
      {
        id: 'web',
        title: 'Web development',
        description:
          'We build websites that present your business clearly and make it easy to explore what you offer.',
        items: [
          'Landing pages',
          'Corporate websites',
          'Interface design',
          'Responsive design',
          'Animation and interaction',
          'Performance optimization',
        ],
      },
      {
        id: 'platforms',
        title: 'SaaS and custom systems',
        description: 'We turn your processes into tools that fit the way your team works.',
        items: [
          'SaaS platforms',
          'Web applications',
          'Management dashboards',
          'Process automation',
          'Service integration',
          'System design',
        ],
      },
      {
        id: 'ai',
        title: 'AI integration',
        description:
          'We integrate artificial intelligence where it can help simplify tasks and put your information to work.',
        items: ['AI assistants', 'Information retrieval', 'Document processing', 'AI workflows'],
      },
      {
        id: 'modernization',
        title: 'Systems modernization',
        description:
          'We improve what you already have so your software can support the changing needs of your business.',
        items: [
          'Technical assessment',
          'Interface redesign',
          'Application upgrades',
          'System migration',
          'Performance improvements',
        ],
      },
    ],
    technologyHeading: 'Your idea sets the direction. We choose the tools.',
    technologyDescription:
      'We combine these technologies around each project’s needs, from the interface to the logic that makes it work.',
    technologyLabel: 'Technologies we work with',
  },
}
