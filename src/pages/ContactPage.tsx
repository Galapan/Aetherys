import { useState, type FocusEvent, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import type { ContactContent } from '@/content/contact'
import { menuContact } from '@/content/navigation'
import { RuleGrid } from '@/components/ui/RuleGrid'

interface ContactPageProps {
  content: ContactContent
  reducedMotion: boolean
  canHover: boolean
}

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

const buttonClassName =
  'bg-burgundy text-warm-white focus-visible:outline-graphite inline-flex min-h-11 items-center justify-center rounded border border-[color-mix(in_srgb,var(--color-warm-white)_35%,transparent)] px-4 py-2 text-[12px] leading-[1.4] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4'

const leadClassName = 'm-0 text-[clamp(1.125rem,1.6vw,1.375rem)] leading-[1.4] font-medium'

// Underlined fields as in the reference; the label stays for assistive tech and the
// placeholder carries the visible hint.
const fieldClassName =
  'border-graphite placeholder:text-secondary w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite'

// Text fields draw their underline themselves so an invalid state can sweep it in burgundy.
// Focus shows as the text nudge and the caret, as in the reference, instead of an outline.
const textFieldClassName =
  'placeholder:text-secondary block w-full rounded-none border-0 bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit outline-none'

type TextFieldElement = HTMLInputElement | HTMLTextAreaElement

interface TextFieldProps {
  label: string
  name: string
  placeholder: string
  type?: string
  autoComplete?: string
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
  multiline = false,
  error,
  invalid,
  onValidityChange,
  reducedMotion,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  const errorId = `contacto-${name}-error`
  const transition = { duration: reducedMotion ? 0 : 0.4, ease: REVEAL_EASE }
  const fieldProps = {
    className: multiline ? `${textFieldClassName} min-h-28 resize-y` : textFieldClassName,
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

  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      {multiline ? (
        <m.textarea {...fieldProps} rows={3} />
      ) : (
        <m.input {...fieldProps} type={type} autoComplete={autoComplete} />
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
    </label>
  )
}

export function ContactPage({ content, reducedMotion, canHover }: ContactPageProps) {
  const [type, setType] = useState('')
  const [sent, setSent] = useState(false)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const setFieldInvalid = (name: string, value: boolean) =>
    setInvalid((current) => (current[name] === value ? current : { ...current, [name]: value }))
  const hover = canHover && !reducedMotion ? { y: -2 } : undefined
  const hoverTransition = { duration: 0.18, ease: 'easeOut' } as const

  function reveal(delay: number) {
    return {
      initial: reducedMotion ? false : { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reducedMotion ? 0 : 0.8, delay, ease: REVEAL_EASE },
    } as const
  }

  // No backend yet: the form composes the email in the visitor's mail app, addressed to
  // the verified contact address.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
    const data = new FormData(form)
    const read = (key: string) => String(data.get(key) ?? '').trim()
    const details = [
      `${content.name}: ${read('name')}`,
      `${content.email}: ${read('email')}`,
      read('phone') && `${content.phone}: ${read('phone')}`,
      read('type') && `${content.type}: ${read('type')}`,
    ].filter(Boolean)
    const body = `${details.join('\n')}\n\n${read('message')}`
    const subject = [content.subject, read('type')].filter(Boolean).join(' — ')
    window.location.href = `${menuContact.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section
      id="contacto"
      className="text-graphite bg-warm-white relative z-1 mt-[calc(var(--header-height)*-1)] min-h-svh pt-[calc(var(--header-height)+24px)] pb-[clamp(64px,10svh,144px)] [--color-secondary:color-mix(in_srgb,var(--color-graphite)_62%,transparent)]"
      aria-labelledby="contacto-heading"
    >
      <RuleGrid className="absolute inset-0" spanClassName="bg-grid-burgundy" />
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
          <m.a
            className={buttonClassName}
            href={menuContact.phoneHref}
            whileHover={hover}
            transition={hoverTransition}
          >
            {content.call}
          </m.a>
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
            placeholder={content.phonePlaceholder}
            invalid={false}
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
            <m.button
              className={buttonClassName}
              type="submit"
              whileHover={hover}
              transition={hoverTransition}
            >
              {content.send}
            </m.button>
            <p className="m-0 text-[14px] leading-[1.4]" role="status">
              {sent ? content.sent : ''}
            </p>
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
    </section>
  )
}
