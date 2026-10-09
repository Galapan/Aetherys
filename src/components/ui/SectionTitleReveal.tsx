import { useEffect } from 'react'
import { m, useAnimate, useInView } from 'framer-motion'

export function SectionTitleReveal({
  text,
  reducedMotion,
}: {
  text: string
  reducedMotion: boolean
}) {
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const visible = useInView(scope, { amount: 0.8 })

  useEffect(() => {
    const cover = scope.current?.querySelector<HTMLElement>('.section-title-cover')
    if (!cover) return

    const controls = reducedMotion
      ? animate(cover, { opacity: 0, scaleX: 0 }, { duration: 0 })
      : visible
        ? animate([
            [cover, { opacity: 1, scaleX: 1 }, { duration: 0 }],
            [cover, { scaleX: 0 }, { duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }],
          ])
        : animate(cover, { opacity: 1, scaleX: 1 }, { duration: 0 })

    return () => {
      controls.stop()
      cover.style.opacity = '0'
    }
  }, [animate, visible, reducedMotion, text, scope])

  return (
    <span ref={scope} className="relative inline-block">
      {text}
      <m.span
        className="section-title-cover pointer-events-none absolute -inset-x-[0.1em] inset-y-0 bg-current opacity-0"
        style={{ skewX: -12, originX: 0 }}
        aria-hidden="true"
      />
    </span>
  )
}
