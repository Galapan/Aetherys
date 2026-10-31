import { useEffect, useEffectEvent, useState, type FocusEvent, type FormEvent } from 'react'
import { AnimatePresence, animate, m, useMotionValue } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import { textFieldClassName } from './contactStyles'

// Horizontal shake of a field still invalid on submit, in px.
const SHAKE_KEYFRAMES = [0, -6, 6, -3, 3, 0]

export type TextFieldElement = HTMLInputElement | HTMLTextAreaElement

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
  /** Count of submit attempts: each one shakes the field if it is still invalid. */
  attempt: number
  onValidityChange: (name: string, invalid: boolean) => void
  reducedMotion: boolean
}

// As in the reference recording: focusing nudges the text in, and leaving a required field
// empty slides it back while the underline turns burgundy from the right and the message
// drops in below it.
export function TextField({
  label,
  name,
  placeholder,
  type = 'text',
  autoComplete,
  pattern,
  multiline = false,
  error,
  invalid,
  attempt,
  onValidityChange,
  reducedMotion,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  // A submit that finds the field invalid shakes it, a quick "no" (never on blur).
  const shakeX = useMotionValue(0)
  const shake = useEffectEvent(() => {
    if (!invalid || reducedMotion) return
    animate(shakeX, SHAKE_KEYFRAMES, { duration: 0.4, ease: 'easeOut' })
  })
  useEffect(() => {
    if (attempt > 0) shake()
  }, [attempt])
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
    <m.div className="relative" style={{ x: shakeX }}>
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
    </m.div>
  )
}
