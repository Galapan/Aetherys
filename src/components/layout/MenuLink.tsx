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
    <div className="menu-row-mask">
      <m.a
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
        <span className="menu-link-label">
          <m.span
            className="menu-link-roll"
            initial={{ y: '0%' }}
            animate={{ y: canHover && expanded && hoveredLink === index ? '-50%' : '0%' }}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: rollEase,
            }}
          >
            <span>{label}</span>
            <span className="menu-link-roll-accent" aria-hidden="true">
              {label}
            </span>
          </m.span>
        </span>
      </m.a>
    </div>
  )
}
