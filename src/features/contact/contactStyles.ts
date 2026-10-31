// Class names shared by the contact page and its form.

export const leadClassName = 'm-0 text-[clamp(1.125rem,1.6vw,1.375rem)] leading-[1.4] font-medium'

// Underlined fields as in the reference; the label stays for assistive tech and the
// placeholder carries the visible hint.
export const fieldClassName =
  'border-graphite placeholder:text-secondary w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite'

// Text fields draw their underline themselves so an invalid state can sweep it in burgundy.
// Focus shows as the text nudge and the caret, as in the reference, instead of an outline.
export const textFieldClassName =
  'placeholder:text-secondary block w-full rounded-none border-0 bg-transparent px-0 py-3 text-[18px] leading-[1.6] text-inherit outline-none'
