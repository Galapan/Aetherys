import { m } from 'framer-motion'
import type { ManifestoContent } from '../content/manifesto'

interface ManifestoProps {
  content: ManifestoContent
  reducedMotion: boolean
}

const reveal = (delay: number, reducedMotion: boolean) => ({
  initial: reducedMotion ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: {
    duration: reducedMotion ? 0 : 0.8,
    delay: reducedMotion ? 0 : delay,
    ease: 'easeOut' as const,
  },
})

export function Manifesto({ content, reducedMotion }: ManifestoProps) {
  return (
    <section id="manifiesto" className="manifesto" aria-labelledby="manifiesto-heading">
      <div className="manifesto-inner">
        <m.p className="manifesto-eyebrow eyebrow" {...reveal(0.2, reducedMotion)}>
          <span className="reveal-eyebrow">
            {content.eyebrow}
            <m.span
              className="reveal-eyebrow__line"
              initial={reducedMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                delay: reducedMotion ? 0 : 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <m.span
              className="reveal-eyebrow__cover"
              aria-hidden="true"
              initial={{ scaleY: reducedMotion ? 0 : 1 }}
              whileInView={{ scaleY: 0 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{
                duration: reducedMotion ? 0 : 0.75,
                delay: reducedMotion ? 0 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </span>
        </m.p>
        <m.h2
          id="manifiesto-heading"
          className="manifesto-statement"
          {...reveal(0.35, reducedMotion)}
        >
          {content.statement}
        </m.h2>
      </div>
    </section>
  )
}
