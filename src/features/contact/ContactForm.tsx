import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  AnimatePresence,
  animate,
  m,
  type AnimationPlaybackControls,
  type AnimationSequence,
} from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { ContactContent } from '@/content/contact'
import { menuContact } from '@/content/navigation'
import { Button } from '@/components/ui/Button'
import { fieldClassName, leadClassName } from './contactStyles'
import { FormAlert } from './FormAlert'
import { TextField, type TextFieldElement } from './TextField'

// Digits with optional leading +, spaces, dashes and parentheses; at least 8 characters.
const PHONE_PATTERN = '\\+?[0-9 \\(\\)\\-]{8,20}'

// How long the delivery confirmation stays before fading out.
const SENT_ALERT_MS = 6000

// Send / sending labels of the submit button, keyed by the Button's variant labels.
const SUBMIT_LABELS = [
  {
    id: 'send',
    variants: {
      rest: { opacity: 1, y: 0 },
      hover: { opacity: 1, y: 0 },
      disabled: { opacity: 0, y: -6 },
    },
  },
  {
    id: 'sending',
    variants: {
      rest: { opacity: 0, y: 6 },
      hover: { opacity: 0, y: 6 },
      disabled: { opacity: 1, y: 0 },
    },
  },
] as const

// Fields erased after a successful send, last to first, and the pace of each deletion.
const ERASE_ORDER = ['message', 'type', 'phone', 'email', 'name'] as const
const ERASE_PER_CHAR_S = 0.02
const ERASE_MIN_S = 0.2
const ERASE_MAX_S = 0.7
// The select has nothing to type backwards: it clears in one short step.
const ERASE_SELECT_S = 0.05

type Status = 'idle' | 'sending' | 'sent' | 'error'

// One timeline that deletes the sent answers as if typed backwards: from the end of the
// message up to the first character of the name, each field starting when the previous ends.
function eraseSequence(form: HTMLFormElement, clearType: () => void): AnimationSequence {
  const sequence: AnimationSequence = []
  for (const name of ERASE_ORDER) {
    if (name === 'type') {
      sequence.push([
        (progress: number) => {
          if (progress > 0) clearType()
        },
        { duration: ERASE_SELECT_S },
      ])
      continue
    }
    const field = form.elements.namedItem(name)
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) continue
    const text = field.value
    if (!text) continue
    sequence.push([
      (length: number) => {
        field.value = text.slice(0, Math.round(length))
      },
      [text.length, 0],
      {
        duration: Math.min(ERASE_MAX_S, Math.max(ERASE_MIN_S, text.length * ERASE_PER_CHAR_S)),
        ease: 'easeIn',
      },
    ])
  }
  return sequence
}

// Plays the erase timeline after a send and resets the form; stops it on unmount.
function useFormEraser(clearType: () => void, reducedMotion: boolean) {
  const controls = useRef<AnimationPlaybackControls | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      controls.current?.stop()
    }
  }, [])

  async function erase(form: HTMLFormElement) {
    if (!reducedMotion) {
      controls.current = animate(eraseSequence(form, clearType))
      await controls.current
    }
    if (!mounted.current) return
    form.reset()
    clearType()
    controls.current = null
  }

  return erase
}

interface SubmitButtonProps {
  content: ContactContent
  sending: boolean
  lift: boolean
  reducedMotion: boolean
}

function SubmitButton({ content, sending, lift, reducedMotion }: SubmitButtonProps) {
  return (
    <Button type="submit" lift={lift} reducedMotion={reducedMotion} disabled={sending}>
      {/* Both labels share one cell so the button keeps its width while they cross. */}
      <span className="grid">
        {SUBMIT_LABELS.map(({ id, variants }) => {
          const active = sending === (id === 'sending')
          return (
            // Variants follow the button's labels (it is disabled only while sending).
            <m.span
              key={id}
              className="[grid-area:1/1]"
              aria-hidden={!active || undefined}
              variants={variants}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: REVEAL_EASE }}
            >
              {id === 'send' ? content.send : content.sending}
            </m.span>
          )
        })}
      </span>
    </Button>
  )
}

interface ContactFormProps {
  content: ContactContent
  lift: boolean
  reducedMotion: boolean
}

export function ContactForm({ content, lift, reducedMotion }: ContactFormProps) {
  const [type, setType] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [attempts, setAttempts] = useState(0)
  // Idempotency key for the current form fill; renewed once a message is delivered.
  const requestId = useRef<string | null>(null)
  // Set before a send starts and cleared once its erase ends, so a double click or a second
  // Enter cannot post the same message twice before the disabled button renders.
  const busy = useRef(false)
  const erase = useFormEraser(() => setType(''), reducedMotion)

  // The confirmation leaves on its own; the error stays until the next attempt.
  useEffect(() => {
    if (status !== 'sent') return
    const timeout = window.setTimeout(() => setStatus('idle'), SENT_ALERT_MS)
    return () => window.clearTimeout(timeout)
  }, [status])
  const setFieldInvalid = (name: string, value: boolean) =>
    setInvalid((current) => (current[name] === value ? current : { ...current, [name]: value }))

  // The Vercel Function at /api/contact forwards the request to the Aetherys inbox.
  async function send(form: HTMLFormElement) {
    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          requestId: (requestId.current ??= crypto.randomUUID()),
        }),
      })
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`)
      requestId.current = null
      setStatus('sent')
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const form = event.currentTarget
    // Validation is ours (noValidate) so empty fields show the same animated state as on blur.
    const invalidFields = Array.from(form.elements).filter(
      (element): element is TextFieldElement =>
        (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
        !element.validity.valid,
    )
    if (invalidFields.length > 0) {
      setAttempts((count) => count + 1)
      setInvalid((current) => ({
        ...current,
        ...Object.fromEntries(invalidFields.map((element) => [element.name, true])),
      }))
      invalidFields[0].focus()
      return
    }
    busy.current = true
    if (await send(form)) await erase(form)
    busy.current = false
  }

  const fieldState = (name: 'name' | 'email' | 'phone' | 'message') => ({
    name,
    invalid: Boolean(invalid[name]),
    attempt: attempts,
    onValidityChange: setFieldInvalid,
    reducedMotion,
  })

  return (
    <form
      className="flex flex-col gap-6"
      aria-labelledby="contacto-form-heading"
      onSubmit={submit}
      noValidate
    >
      <h2 id="contacto-form-heading" className={`${leadClassName} mb-2`}>
        {content.formHeading}
      </h2>
      {/* Honeypot: hidden from people and assistive tech; bots that fill it are dropped
          by the function. */}
      <input
        className="sr-only"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <TextField
        {...fieldState('name')}
        label={content.name}
        autoComplete="name"
        placeholder={content.namePlaceholder}
        error={content.nameError}
      />
      <TextField
        {...fieldState('email')}
        label={content.email}
        type="email"
        autoComplete="email"
        placeholder={content.emailPlaceholder}
        error={content.emailError}
      />
      <TextField
        {...fieldState('phone')}
        label={content.phone}
        type="tel"
        autoComplete="tel"
        pattern={PHONE_PATTERN}
        placeholder={content.phonePlaceholder}
        error={content.phoneError}
      />
      <label className="relative">
        <span className="sr-only">{content.type}</span>
        <select
          className={`${fieldClassName} cursor-pointer appearance-none pr-8 ${type ? '' : 'text-secondary'}`}
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="" disabled>
            {content.typePlaceholder}
          </option>
          {content.types.map((option) => (
            <option key={option} value={option} className="text-graphite">
              {option}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-1 h-3 w-3 -translate-y-1/2"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </label>
      <TextField
        {...fieldState('message')}
        label={content.message}
        multiline
        placeholder={content.messagePlaceholder}
        error={content.messageError}
      />
      <div className="mt-4 flex flex-col items-start gap-4">
        <SubmitButton
          content={content}
          sending={status === 'sending'}
          lift={lift}
          reducedMotion={reducedMotion}
        />
        {/* The live region stays mounted so screen readers announce the alert it receives. */}
        <div className="w-full" role="status">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' || status === 'error' ? (
              <FormAlert key={status} kind={status} reducedMotion={reducedMotion}>
                {status === 'sent' ? (
                  content.sent
                ) : (
                  <>
                    {content.error}{' '}
                    <a
                      className="text-burgundy focus-visible:outline-graphite [overflow-wrap:anywhere] hover:underline"
                      href={menuContact.emailHref}
                    >
                      {menuContact.email}
                    </a>
                  </>
                )}
              </FormAlert>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </form>
  )
}
