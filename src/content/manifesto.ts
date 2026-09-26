import type { Locale } from './hero'

export interface ManifestoContent {
  sectionLabel: string
  eyebrow: string
  statement: string
  showreelLabel: string
  showreelHint: string
}

export const content: Record<Locale, ManifestoContent> = {
  es: {
    sectionLabel: 'Manifiesto',
    eyebrow: '/MANIFIESTO',
    statement:
      'Estrategia y desarrollo trabajando juntos. Construimos contigo, paso a paso, desde la primera idea hasta su puesta en marcha.',
    showreelLabel: '/SHOWREEL',
    showreelHint: 'Próximamente.',
  },
  en: {
    sectionLabel: 'Manifesto',
    eyebrow: '/MANIFESTO',
    statement:
      'Strategy and development working side by side. We build with you, step by step, from the first idea through launch.',
    showreelLabel: '/SHOWREEL',
    showreelHint: 'Coming soon.',
  },
}
