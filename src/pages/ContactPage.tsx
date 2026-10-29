import { useEffect, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { ContactContent } from '@/content/contact'
import { menuContact } from '@/content/navigation'
import { Button } from '@/components/ui/Button'
import { LightSection } from '@/components/ui/LightSection'

interface ContactPageProps {
  content: ContactContent
  reducedMotion: boolean
  canHover: boolean
}

const leadClassName = 'm-0 text-[clamp(1.125rem,1.6vw,1.375rem)] leading-[1.4] font-medium'

// Underlined fields as in the reference; the label stays for assistive tech and the
// placeholder carries the visible hint.
const fieldClassName =
  'border-graphite placeholder:text-secondary w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite'

// Text fields draw their underline themselves so an invalid state can sweep it in burgundy.
// Focus shows as the text nudge and the caret, as in the reference, instead of an outline.
const textFieldClassName =
  'placeholder:text-secondary block w-full rounded-none border-0 bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit outline-none'

// Digits with optional leading +, spaces, dashes and parentheses; at least 8 characters.
const PHONE_PATTERN = '\\+?[0-9 \\(\\)\\-]{8,20}'

// How long the delivery confirmation stays before fading out.
const SENT_ALERT_MS = 6000

type TextFieldElement = HTMLInputElement | HTMLTextAreaElement

interface TextFieldProps {
  label: string
  name: string
  placeholder: string
  type?: string
  autoComplete?: string
  /** Format the value must match, checked through the native constraint validation. */
  pattern?: string
  multiline?: boolean
  /** Required fields pass the message shown when they are left empty or invalid. */
  error?: string
  invalid: boolean
  onValidityChange: (name: string, invalid: boolean) => void
  reducedMotion: boolean
}

// As in the reference recording: focusing nudges the text in, and leaving a required field
// empty slides it back while the underline turns burgundy from the right and the message
// drops in below it.
function TextField({
  label,
  name,
  placeholder,
  type = 'text',
  autoComplete,
  pattern,
  multiline = false,
  error,
  invalid,
  onValidityChange,
  reducedMotion,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  const fieldId = `contacto-${name}`
  const errorId = `${fieldId}-error`
  const transition = { duration: reducedMotion ? 0 : 0.4, ease: REVEAL_EASE }
  const fieldProps = {
    className: multiline ? `${textFieldClassName} min-h-28 resize-y` : textFieldClassName,
    id: fieldId,
    name,
    placeholder,
    required: Boolean(error),
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? errorId : undefined,
    initial: false,
    animate: { paddingLeft: focused ? 8 : 0 },
    transition,
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent<TextFieldElement>) => {
      setFocused(false)
      if (error) onValidityChange(name, !event.currentTarget.validity.valid)
    },
    onInput: (event: FormEvent<TextFieldElement>) => {
      if (invalid && event.currentTarget.validity.valid) onValidityChange(name, false)
    },
  } as const

  // The label points at the field instead of wrapping it, so the error message below is
  // announced once through aria-describedby rather than also becoming part of the name.
  return (
    <div className="relative">
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      {multiline ? (
        <m.textarea {...fieldProps} rows={3} />
      ) : (
        <m.input {...fieldProps} type={type} autoComplete={autoComplete} pattern={pattern} />
      )}
      <span className="bg-graphite pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      <m.span
        className="bg-burgundy pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right"
        initial={false}
        animate={{ scaleX: invalid ? 1 : 0 }}
        transition={transition}
      />
      <AnimatePresence initial={false}>
        {invalid && error ? (
          <m.span
            key="error"
            id={errorId}
            className="text-burgundy absolute top-full left-0 mt-1 text-[12px] leading-[1.4]"
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: REVEAL_EASE }}
          >
            {error}
          </m.span>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface FormAlertProps {
  kind: 'sent' | 'error'
  reducedMotion: boolean
  children: ReactNode
}

// Burgundy rule sweeping in like the invalid underline, the icon drawing itself, then the
// message rising into place.
function FormAlert({ kind, reducedMotion, children }: FormAlertProps) {
  const timing = (duration: number, delay = 0) => ({
    duration: reducedMotion ? 0 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: REVEAL_EASE,
  })
  const draw = {
    initial: reducedMotion ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: timing(0.5, 0.25),
  } as const

  return (
    <m.div
      className="relative flex items-start gap-3 pt-4 text-[14px] leading-[1.4]"
      exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: timing(0.25) }}
    >
      <m.span
        className="bg-burgundy pointer-events-none absolute inset-x-0 top-0 h-px origin-left"
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={timing(0.6)}
      />
      <svg
        className="text-burgundy mt-px h-4 w-4 shrink-0"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        {kind === 'sent' ? (
          <m.path
            d="M3 8.5l3.25 3.25L13 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            {...draw}
          />
        ) : (
          <>
            <m.path d="M8 3v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" {...draw} />
            <m.path
              d="M8 12.25v.75"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              {...draw}
            />
          </>
        )}
      </svg>
      <m.p
        className="m-0"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={timing(0.5, 0.15)}
      >
        {children}
      </m.p>
    </m.div>
  )
}

export function ContactPage({ content, reducedMotion, canHover }: ContactPageProps) {
  const [type, setType] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  // Idempotency key for the current form fill; renewed once a message is delivered.
  const requestId = useRef<string | null>(null)

  // The confirmation leaves on its own; the error stays until the next attempt.
  useEffect(() => {
    if (status !== 'sent') return
    const timeout = window.setTimeout(() => setStatus('idle'), SENT_ALERT_MS)
    return () => window.clearTimeout(timeout)
  }, [status])
  const setFieldInvalid = (name: string, value: boolean) =>
    setInvalid((current) => (current[name] === value ? current : { ...current, [name]: value }))
  const lift = canHover && !reducedMotion

  function reveal(delay: number) {
    return {
      initial: reducedMotion ? false : { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reducedMotion ? 0 : 0.8, delay, ease: REVEAL_EASE },
    } as const
  }

  // The Vercel Function at /api/contact forwards the request to the Aetherys inbox.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    // Validation is ours (noValidate) so empty fields show the same animated state as on blur.
    const invalidFields = Array.from(form.elements).filter(
      (element): element is TextFieldElement =>
        (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
        !element.validity.valid,
    )
    if (invalidFields.length > 0) {
      setInvalid((current) => ({
        ...current,
        ...Object.fromEntries(invalidFields.map((element) => [element.name, true])),
      }))
      invalidFields[0].focus()
      return
    }
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
      form.reset()
      setType('')
      requestId.current = null
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <LightSection
      id="contacto"
      labelledBy="contacto-heading"
      className="mt-[calc(var(--header-height)*-1)] min-h-svh pt-[calc(var(--header-height)+24px)] pb-[clamp(64px,10svh,144px)]"
    >
      <div className="relative container grid grid-cols-1 gap-x-6 lg:grid-cols-12">
        <h1
          id="contacto-heading"
          className="text-burgundy m-0 overflow-hidden pb-[0.06em] text-[clamp(3.5rem,11vw,9rem)] leading-[1] font-medium tracking-[-0.04em] uppercase lg:col-span-12"
        >
          <m.span
            className="block"
            initial={reducedMotion ? false : { y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ duration: reducedMotion ? 0 : 1, ease: REVEAL_EASE }}
          >
            {content.heading}
          </m.span>
        </h1>

        {/* Phone order follows the reference: intro, form, then the direct contact. On desktop
            the intro and direct contact share the left column around the form. */}
        <m.div
          className="mt-12 flex flex-col items-start gap-8 md:mt-16 lg:col-span-5 lg:row-start-2"
          {...reveal(0.25)}
        >
          <p className={leadClassName}>{content.intro}</p>
          <Button href={menuContact.phoneHref} lift={lift}>
            {content.call}
          </Button>
        </m.div>

        <m.form
          className="mt-12 flex flex-col gap-6 md:mt-16 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-2"
          aria-labelledby="contacto-form-heading"
          onSubmit={submit}
          noValidate
          {...reveal(0.4)}
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
            label={content.name}
            name="name"
            autoComplete="name"
            placeholder={content.namePlaceholder}
            error={content.nameError}
            invalid={Boolean(invalid.name)}
            onValidityChange={setFieldInvalid}
            reducedMotion={reducedMotion}
          />
          <TextField
            label={content.email}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={content.emailPlaceholder}
            error={content.emailError}
            invalid={Boolean(invalid.email)}
            onValidityChange={setFieldInvalid}
            reducedMotion={reducedMotion}
          />
          <TextField
            label={content.phone}
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern={PHONE_PATTERN}
            placeholder={content.phonePlaceholder}
            error={content.phoneError}
            invalid={Boolean(invalid.phone)}
            onValidityChange={setFieldInvalid}
            reducedMotion={reducedMotion}
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
            label={content.message}
            name="message"
            multiline
            placeholder={content.messagePlaceholder}
            error={content.messageError}
            invalid={Boolean(invalid.message)}
            onValidityChange={setFieldInvalid}
            reducedMotion={reducedMotion}
          />
          <div className="mt-4 flex flex-col items-start gap-4">
            <Button type="submit" lift={lift} disabled={status === 'sending'}>
              {status === 'sending' ? content.sending : content.send}
            </Button>
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
        </m.form>

        <m.div
          className="mt-16 flex flex-col gap-6 lg:col-span-5 lg:row-start-3 lg:self-end"
          {...reveal(0.5)}
        >
          <p className={leadClassName}>{content.direct}</p>
          <p className="m-0 flex flex-col text-[18px] leading-[1.6]">
            <a
              className="text-burgundy focus-visible:outline-graphite w-fit [overflow-wrap:anywhere] hover:underline"
              href={menuContact.emailHref}
            >
              {menuContact.email}
            </a>
            <a
              className="text-burgundy focus-visible:outline-graphite w-fit hover:underline"
              href={menuContact.phoneHref}
            >
              {menuContact.phone}
            </a>
          </p>
        </m.div>
      </div>
    </LightSection>
  )
}
