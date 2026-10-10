import { m } from 'framer-motion'
import { createReveal } from './menuMotion'

interface MenuLinkProps {
  href: string
  label: string
  index: number
  expanded: boolean
  reducedMotion: boolean
  canHover: boolean
  hoveredLink: number | null
  setHoveredLink: (index: number | null) => void
  onClose: (id?: string) => void
}

const rollEase = [0.42, 0, 0.58, 1] as const

export function MenuLink({
  href,
  label,
  index,
  expanded,
  reducedMotion,
  canHover,
  hoveredLink,
  setHoveredLink,
  onClose,
}: MenuLinkProps) {
  return (
    <div className="-m-1 overflow-hidden p-1">
      <m.a
        className="block w-fit max-w-full py-2 text-[clamp(1.625rem,4.2vw,2rem)] leading-[1.15] font-normal tracking-[-0.045em] uppercase aria-disabled:cursor-default md:text-[clamp(2rem,3.3vw,3.5rem)]"
        href={href || undefined}
        role={href ? undefined : 'link'}
        aria-disabled={!href || undefined}
        onClick={(event) => {
          if (!href) return
          if (href.startsWith('#')) {
            event.preventDefault()
            onClose(href.slice(1))
          } else onClose()
        }}
        {...createReveal(expanded, reducedMotion, 0.35 + index * 0.075, true)}
        onHoverStart={() => {
          if (canHover && href) setHoveredLink(index)
        }}
        onHoverEnd={() => setHoveredLink(null)}
        onFocus={() => {
          if (href) setHoveredLink(index)
        }}
        onBlur={() => setHoveredLink(null)}
      >
        <span className="block h-[1.15em] overflow-hidden">
          <m.span
            className="flex flex-col"
            initial={{ y: '0%' }}
            animate={{ y: canHover && expanded && hoveredLink === index ? '-50%' : '0%' }}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: rollEase,
            }}
          >
            <span className="block leading-[1.15]">{label}</span>
            <span className="text-burgundy block leading-[1.15]" aria-hidden="true">
              {label}
            </span>
          </m.span>
        </span>
      </m.a>
    </div>
  )
}
