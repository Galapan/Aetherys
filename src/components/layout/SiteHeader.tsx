import type { RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'
import { AudioToggle } from '../ui/AudioToggle'

interface SiteHeaderProps {
  ref: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  audioRef: RefObject<HTMLAudioElement | null>
  content: HeroContent
  reducedMotion: boolean
  canHover: boolean
  mounted: boolean
  onOpen: () => void
}

export function SiteHeader({
  ref: headerRef,
  triggerRef,
  audioRef,
  content,
  reducedMotion,
  canHover,
  mounted,
  onOpen,
}: SiteHeaderProps) {
  return (
    <header
      ref={headerRef}
      className="site-header container"
      style={{ visibility: mounted ? 'hidden' : undefined }}
    >
      <a className="brand" href="#inicio" aria-label={content.home}>
        {content.brand}
      </a>
      <div className="header-actions">
        <AudioToggle
          content={content}
          reducedMotion={reducedMotion}
          canHover={canHover}
          audioRef={audioRef}
        />
        <m.button
          ref={triggerRef}
          className="menu-toggle"
          type="button"
          aria-label={content.openMenu}
          aria-expanded={mounted}
          aria-controls="navigation-menu"
          onClick={onOpen}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18 }}
        >
          <span className="menu-label" aria-hidden="true">
            <span>{content.menu}</span>
          </span>
          <span className="menu-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </m.button>
      </div>
    </header>
  )
}
