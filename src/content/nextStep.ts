import type { Locale } from './hero'

export interface NextStepContent {
  /** Reading order; laid out around the mark like the reference composition. */
  heading: [string, string, string, string]
  callToAction: string
  bastianAlt: string
  cesarAlt: string
}

export const content: Record<Locale, NextStepContent> = {
  es: {
    heading: ['Transforma', 'tu', 'compañía', 'hoy.'],
    callToAction: 'Conversemos sobre tu proyecto',
    bastianAlt: 'Retrato de Bastian Alessandro',
    cesarAlt: 'Retrato de Cesar Vazquez',
  },
  en: {
    heading: ['Transform', 'your', 'company', 'today.'],
    callToAction: "Let's talk about your project",
    bastianAlt: 'Portrait of Bastian Alessandro',
    cesarAlt: 'Portrait of Cesar Vazquez',
  },
}
