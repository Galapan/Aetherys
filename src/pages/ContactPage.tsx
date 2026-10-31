import { m } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import type { ContactContent } from '@/content/contact'
import { menuContact } from '@/content/navigation'
import { Button } from '@/components/ui/Button'
import { LightSection } from '@/components/ui/LightSection'
import { ContactForm } from '@/features/contact/ContactForm'
import { leadClassName } from '@/features/contact/contactStyles'

interface ContactPageProps {
  content: ContactContent
  reducedMotion: boolean
  canHover: boolean
}

export function ContactPage({ content, reducedMotion, canHover }: ContactPageProps) {
  const lift = canHover && !reducedMotion

  function reveal(delay: number) {
    return {
      initial: reducedMotion ? false : { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reducedMotion ? 0 : 0.8, delay, ease: REVEAL_EASE },
    } as const
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
          <Button href={menuContact.phoneHref} lift={lift} reducedMotion={reducedMotion}>
            {content.call}
          </Button>
        </m.div>

        <m.div
          className="mt-12 md:mt-16 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-2"
          {...reveal(0.4)}
        >
          <ContactForm content={content} lift={lift} reducedMotion={reducedMotion} />
        </m.div>

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
