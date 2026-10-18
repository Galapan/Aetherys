import type { Locale } from './hero'
import { routes, withLocale } from '@/routes'

export interface ContactContent {
  /** Document title prefix. */
  title: string
  heading: string
  intro: string
  call: string
  direct: string
  formHeading: string
  name: string
  namePlaceholder: string
  email: string
  emailPlaceholder: string
  phone: string
  phonePlaceholder: string
  type: string
  typePlaceholder: string
  types: string[]
  message: string
  messagePlaceholder: string
  /** Shown under a required field left empty (or with an invalid email). */
  nameError: string
  emailError: string
  messageError: string
  send: string
  /** Subject of the email composed from the form. */
  subject: string
  /** Shown once the form hands the message to the visitor's mail app. */
  sent: string
}

export const content: Record<Locale, ContactContent> = {
  es: {
    title: 'Contacto',
    heading: 'Contacto',
    intro: '¿Tienes un proyecto en mente? Hablemos.',
    call: 'Llámanos',
    direct: 'También puedes escribirnos por correo o llamarnos:',
    formHeading: 'O completa el formulario:',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@empresa.com',
    phone: 'Teléfono (opcional)',
    phonePlaceholder: '+52 000 000 0000',
    type: 'Tipo de proyecto',
    typePlaceholder: 'Selecciona un tipo',
    types: [
      'Desarrollo web',
      'Plataformas SaaS y sistemas a medida',
      'Integración de IA',
      'Modernización de sistemas',
      'Otro',
    ],
    message: 'Mensaje',
    messagePlaceholder: '¿Qué te gustaría contarnos?',
    nameError: 'Escribe tu nombre',
    emailError: 'Escribe un correo válido',
    messageError: 'Escribe tu mensaje',
    send: 'Enviar',
    subject: 'Nuevo proyecto',
    sent: 'Abrimos tu aplicación de correo con el mensaje listo para enviar.',
  },
  en: {
    title: 'Contact',
    heading: 'Contact',
    intro: "Have a project in mind? Let's talk.",
    call: 'Call us',
    direct: 'You can also reach us by email or phone:',
    formHeading: 'Or fill in the form:',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    phone: 'Phone (optional)',
    phonePlaceholder: '+52 000 000 0000',
    type: 'Project type',
    typePlaceholder: 'Select a type',
    types: [
      'Web development',
      'SaaS platforms and custom systems',
      'AI integration',
      'System modernization',
      'Other',
    ],
    message: 'Message',
    messagePlaceholder: 'What would you like to tell us?',
    nameError: 'Please enter your name',
    emailError: 'Please enter a valid email',
    messageError: 'Please enter your message',
    send: 'Send',
    subject: 'New project',
    sent: 'We opened your email app with the message ready to send.',
  },
}

export function contactHref(locale: Locale): string {
  return withLocale(routes.contact, locale)
}
