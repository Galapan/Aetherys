import type { Locale } from './hero'

export interface NextStepContent {
  heading: [string, string, string]
  callToAction: string
  bastianAlt: string
  cesarAlt: string
}

export const content: Record<Locale, NextStepContent> = {
  es: {
    heading: ['Llevemos', 'tu idea', 'más lejos.'],
    callToAction: 'Conversemos sobre tu proyecto',
    bastianAlt: 'Retrato de Bastian Alessandro',
    cesarAlt: 'Retrato de Cesar Vazquez',
  },
  en: {
    heading: ["Let's take", 'your idea', 'further.'],
    callToAction: "Let's talk about your project",
    bastianAlt: 'Portrait of Bastian Alessandro',
    cesarAlt: 'Portrait of Cesar Vazquez',
  },
}
