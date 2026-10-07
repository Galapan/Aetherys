import { m } from 'framer-motion'
import { createReveal } from './menuMotion'

interface MenuLinkProps {
  id: string
  label: string
  index: number
  expanded: boolean
  reducedMotion: boolean
  canHover: boolean
  hoveredLink: number | null
  setHoveredLink: (index: number | null) => void
  onClose: (id: string) => void
}

const rollEase = [0.42, 0, 0.58, 1] as const

export function MenuLink({
  id,
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
        className="flex min-h-16 items-center justify-between gap-4 overflow-hidden py-2 text-[clamp(2.25rem,5vw,4rem)] leading-[1.1] font-medium tracking-[-0.04em] uppercase"
        href={`#${id}`}
        onClick={(event) => {
          event.preventDefault()
          onClose(id)
        }}
        {...createReveal(expanded, reducedMotion, 0.35 + index * 0.075, true)}
        onHoverStart={() => {
          if (canHover) setHoveredLink(index)
        }}
        onHoverEnd={() => setHoveredLink(null)}
      >
        <span className="block h-[1.1em] overflow-hidden">
          <m.span
            className="flex flex-col"
            initial={{ y: '0%' }}
            animate={{ y: canHover && expanded && hoveredLink === index ? '-50%' : '0%' }}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: rollEase,
            }}
          >
            <span className="block leading-[1.1]">{label}</span>
            <span className="text-burgundy block leading-[1.1]" aria-hidden="true">
              {label}
            </span>
          </m.span>
        </span>
      </m.a>
    </div>
  )
}
